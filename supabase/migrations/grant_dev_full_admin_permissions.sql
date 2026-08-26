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
-- Qualquer política de segurança (RLS) que utilize is_admin() concederá
-- automaticamente ACESSO TOTAL tanto para 'admin' quanto para 'dev'!
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
    -- Permitir tanto ADMIN quanto DEV
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
    -- Permitir tanto ADMIN quanto DEV
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
