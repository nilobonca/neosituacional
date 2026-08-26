-- =========================================================================
-- Migração: Garantir que a Role DEV tenha 100% de Todas as Permissões de Admin
-- =========================================================================

-- 1. Habilitar extensões
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Garantir que as constraints de cargo aceitem ('admin', 'sindico', 'dev')
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'sindico', 'dev'));

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
        ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
        ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check CHECK (role IN ('admin', 'sindico', 'dev'));
    END IF;
END $$;

-- 3. Atualizar a função mestre public.is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'dev')
  );
END;
$$;

-- 4. Função auxiliar public.is_dev() para checagens exclusivas de desenvolvedor
CREATE OR REPLACE FUNCTION public.is_dev()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'dev'
  );
END;
$$;

-- =========================================================================
-- 5. Atualizar RLS de todas as tabelas administrativas para usar public.is_admin()
-- =========================================================================

-- TABELA: PROFILES
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;
CREATE POLICY "Admins podem ver todos os perfis" 
ON public.profiles FOR SELECT TO authenticated 
USING ( public.is_admin() );

DROP POLICY IF EXISTS "Admins podem editar todos os perfis" ON public.profiles;
CREATE POLICY "Admins podem editar todos os perfis" 
ON public.profiles FOR UPDATE TO authenticated 
USING ( public.is_admin() )
WITH CHECK ( public.is_admin() );

-- TABELA: ADMIN_INVITES (Convites)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_invites') THEN
        DROP POLICY IF EXISTS "Admins podem visualizar convites" ON public.admin_invites;
        CREATE POLICY "Admins podem visualizar convites" ON public.admin_invites FOR SELECT TO authenticated USING ( public.is_admin() );

        DROP POLICY IF EXISTS "Admins podem criar convites" ON public.admin_invites;
        CREATE POLICY "Admins podem criar convites" ON public.admin_invites FOR INSERT TO authenticated WITH CHECK ( public.is_admin() );

        DROP POLICY IF EXISTS "Admins podem atualizar convites" ON public.admin_invites;
        CREATE POLICY "Admins podem atualizar convites" ON public.admin_invites FOR UPDATE TO authenticated USING ( public.is_admin() );
    END IF;
END $$;

-- TABELA: SUPPLIERS_APPLICATIONS (Fornecedores)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'suppliers_applications') THEN
        DROP POLICY IF EXISTS "Admins podem acessar todos os fornecedores" ON public.suppliers_applications;
        CREATE POLICY "Admins podem acessar todos os fornecedores" 
        ON public.suppliers_applications TO authenticated 
        USING ( public.is_admin() )
        WITH CHECK ( public.is_admin() );
    END IF;
END $$;

-- TABELA: CONDOMINIUMS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'condominiums') THEN
        DROP POLICY IF EXISTS "Acesso total para admins em condomínios" ON public.condominiums;
        CREATE POLICY "Acesso total para admins em condomínios" 
        ON public.condominiums TO authenticated 
        USING ( public.is_admin() )
        WITH CHECK ( public.is_admin() );
    END IF;
END $$;

-- TABELA: COMMERCIAL_PROPOSALS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'commercial_proposals') THEN
        DROP POLICY IF EXISTS "Acesso total para admins em propostas" ON public.commercial_proposals;
        CREATE POLICY "Acesso total para admins em propostas" 
        ON public.commercial_proposals TO authenticated 
        USING ( public.is_admin() )
        WITH CHECK ( public.is_admin() );
    END IF;
END $$;

-- TABELA: JOB_APPLICATIONS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'job_applications') THEN
        DROP POLICY IF EXISTS "Acesso total para admins em currículos" ON public.job_applications;
        CREATE POLICY "Acesso total para admins em currículos" 
        ON public.job_applications TO authenticated 
        USING ( public.is_admin() )
        WITH CHECK ( public.is_admin() );
    END IF;
END $$;

-- TABELA: SITE_SETTINGS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'site_settings') THEN
        DROP POLICY IF EXISTS "Acesso total para admins em configurações" ON public.site_settings;
        CREATE POLICY "Acesso total para admins em configurações" 
        ON public.site_settings TO authenticated 
        USING ( public.is_admin() )
        WITH CHECK ( public.is_admin() );
    END IF;
END $$;

-- =========================================================================
-- 6. Atualizar RPCs de Convites para aceitarem 'dev' além de 'admin'
-- =========================================================================
CREATE OR REPLACE FUNCTION public.create_admin_invite(
    target_email TEXT,
    hours_valid INTEGER DEFAULT 48
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
DECLARE
    v_admin_id UUID := auth.uid();
    v_is_authorized BOOLEAN;
    v_invite_id UUID := gen_random_uuid();
    v_expires_at TIMESTAMP WITH TIME ZONE;
    v_token TEXT;
    v_clean_email TEXT := lower(trim(target_email));
BEGIN
    SELECT (role IN ('admin', 'dev')) INTO v_is_authorized FROM public.profiles WHERE id = v_admin_id;
    IF v_admin_id IS NULL OR v_is_authorized IS NOT TRUE THEN
        RAISE EXCEPTION 'Acesso não autorizado: apenas administradores e desenvolvedores podem gerar convites.';
    END IF;

    IF v_clean_email IS NULL OR v_clean_email = '' OR v_clean_email NOT LIKE '%@%' THEN
        RAISE EXCEPTION 'E-mail informado é inválido.';
    END IF;

    IF hours_valid IS NULL OR hours_valid <= 0 THEN
        hours_valid := 48;
    END IF;
    v_expires_at := timezone('utc'::text, now()) + (hours_valid || ' hours')::INTERVAL;

    UPDATE public.admin_invites
    SET status = 'revoked'
    WHERE email = v_clean_email AND status = 'pending';

    v_token := public.generate_jwt_token(v_invite_id, v_clean_email, v_expires_at);

    INSERT INTO public.admin_invites (
        id, email, token, status, invited_by, expires_at, created_at
    ) VALUES (
        v_invite_id, v_clean_email, v_token, 'pending', v_admin_id, v_expires_at, timezone('utc'::text, now())
    );

    RETURN jsonb_build_object(
        'success', true,
        'invite_id', v_invite_id,
        'email', v_clean_email,
        'token', v_token,
        'expires_at', v_expires_at
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_admin_invite(
    token_jwt TEXT,
    target_user_id UUID DEFAULT NULL,
    target_full_name TEXT DEFAULT '',
    user_password TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
DECLARE
    v_invite RECORD;
    v_updated_rows INTEGER;
    v_final_user_id UUID := target_user_id;
    v_clean_email TEXT;
    v_hashed_password TEXT := NULL;
BEGIN
    IF token_jwt IS NULL THEN
        RAISE EXCEPTION 'Parâmetros obrigatórios ausentes: token_jwt.';
    END IF;

    -- 1. Buscar convite com trava de concorrência (FOR UPDATE)
    SELECT * INTO v_invite 
    FROM public.admin_invites 
    WHERE token = token_jwt
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Convite inválido ou não encontrado.';
    END IF;

    IF v_invite.status = 'used' THEN
        RAISE EXCEPTION 'Este convite já foi utilizado anteriormente.';
    END IF;

    IF v_invite.status = 'revoked' THEN
        RAISE EXCEPTION 'Este convite foi revogado pelo administrador.';
    END IF;

    IF v_invite.expires_at < timezone('utc'::text, now()) THEN
        UPDATE public.admin_invites SET status = 'expired' WHERE id = v_invite.id;
        RAISE EXCEPTION 'Este convite expirou.';
    END IF;

    v_clean_email := lower(trim(v_invite.email));

    -- 2. Gerar hash bcrypt da senha caso tenha sido informada
    IF user_password IS NOT NULL AND length(trim(user_password)) >= 6 THEN
        BEGIN
            v_hashed_password := extensions.crypt(user_password, extensions.gen_salt('bf', 10));
        EXCEPTION WHEN OTHERS THEN
            v_hashed_password := crypt(user_password, gen_salt('bf', 10));
        END;
    END IF;

    -- 3. Identificar ou Criar o usuário em auth.users
    IF v_final_user_id IS NOT NULL THEN
        -- Verificar se o ID realmente existe em auth.users
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_final_user_id) THEN
            v_final_user_id := NULL;
        END IF;
    END IF;

    IF v_final_user_id IS NULL THEN
        -- Tentar buscar pelo e-mail
        SELECT id INTO v_final_user_id FROM auth.users WHERE lower(email) = v_clean_email LIMIT 1;
    END IF;

    IF v_final_user_id IS NULL THEN
        -- Usuário ainda não existe no auth.users: CRIAR DIRETAMENTE!
        v_final_user_id := gen_random_uuid();

        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_final_user_id,
            'authenticated',
            'authenticated',
            v_clean_email,
            coalesce(v_hashed_password, ''),
            timezone('utc'::text, now()),
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('full_name', coalesce(target_full_name, '')),
            timezone('utc'::text, now()),
            timezone('utc'::text, now())
        );

        -- Inserir em auth.identities para compatibilidade com o Supabase Auth
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'identities') THEN
            BEGIN
                INSERT INTO auth.identities (
                    id,
                    user_id,
                    identity_data,
                    provider,
                    provider_id,
                    last_sign_in_at,
                    created_at,
                    updated_at
                ) VALUES (
                    v_final_user_id::text,
                    v_final_user_id,
                    jsonb_build_object('sub', v_final_user_id::text, 'email', v_clean_email),
                    'email',
                    v_final_user_id::text,
                    timezone('utc'::text, now()),
                    timezone('utc'::text, now()),
                    timezone('utc'::text, now())
                )
                ON CONFLICT DO NOTHING;
            EXCEPTION WHEN OTHERS THEN
                NULL;
            END;
        END IF;
    ELSE
        -- Usuário já existe: atualizar senha, confirmar e-mail e atualizar metadados
        UPDATE auth.users
        SET 
            encrypted_password = coalesce(v_hashed_password, encrypted_password),
            email_confirmed_at = coalesce(email_confirmed_at, timezone('utc'::text, now())),
            confirmed_at = coalesce(confirmed_at, timezone('utc'::text, now())),
            raw_user_meta_data = jsonb_build_object('full_name', coalesce(target_full_name, '')),
            updated_at = timezone('utc'::text, now())
        WHERE id = v_final_user_id;
    END IF;

    -- 4. Consumir o token de forma atômica (One-Time Use Enforcement)
    UPDATE public.admin_invites
    SET 
        status = 'used',
        used_at = timezone('utc'::text, now()),
        used_by = v_final_user_id
    WHERE id = v_invite.id AND status = 'pending';

    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
    IF v_updated_rows = 0 THEN
        RAISE EXCEPTION 'Falha ao processar convite: o token já foi consumido por outra requisição.';
    END IF;

    -- 5. Atualizar ou Inserir o perfil do usuário como 'admin'
    INSERT INTO public.profiles (id, email, full_name, role, created_at)
    VALUES (
        v_final_user_id,
        v_clean_email,
        coalesce(target_full_name, ''),
        'admin',
        timezone('utc'::text, now())
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        full_name = CASE 
            WHEN trim(coalesce(EXCLUDED.full_name, '')) <> '' THEN EXCLUDED.full_name 
            ELSE public.profiles.full_name 
        END;

    -- Sincronizar tabela legado user_roles caso exista
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_final_user_id, 'admin')
        ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Convite consumido com sucesso. Conta de administrador ativada!',
        'user_id', v_final_user_id,
        'email', v_clean_email
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_admin_invite(invite_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
DECLARE
    v_admin_id UUID := auth.uid();
    v_is_authorized BOOLEAN;
BEGIN
    SELECT (role IN ('admin', 'dev')) INTO v_is_authorized FROM public.profiles WHERE id = v_admin_id;
    IF v_admin_id IS NULL OR v_is_authorized IS NOT TRUE THEN
        RAISE EXCEPTION 'Apenas administradores e desenvolvedores podem revogar convites.';
    END IF;

    UPDATE public.admin_invites
    SET status = 'revoked'
    WHERE id = invite_id AND status = 'pending';

    RETURN jsonb_build_object('success', true);
END;
$$;

-- 7. Recarregar o cache do PostgREST
NOTIFY pgrst, 'reload schema';
