-- =========================================================================
-- Migração: Correção Definitiva de Autenticação para Convites de Admin e DEV
-- Resolve o erro de "Senha Incorreta" garantindo sincronização total com GoTrue
-- =========================================================================

-- 1. Habilitar extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- 2. Função de Aceitação de Convite 100% Compatível com Supabase Auth (GoTrue)
DROP FUNCTION IF EXISTS public.accept_admin_invite(TEXT, UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.accept_admin_invite(TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS public.accept_admin_invite(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.accept_admin_invite(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.accept_admin_invite;

CREATE OR REPLACE FUNCTION public.accept_admin_invite(
    token_jwt TEXT,
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
    v_final_user_id UUID;
    v_clean_email TEXT;
    v_hashed_password TEXT;
BEGIN
    IF token_jwt IS NULL OR trim(token_jwt) = '' THEN
        RAISE EXCEPTION 'Token de convite não informado.';
    END IF;

    IF user_password IS NULL OR length(trim(user_password)) < 6 THEN
        RAISE EXCEPTION 'A senha deve conter no mínimo 6 caracteres.';
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
        RAISE EXCEPTION 'Este convite expirou. Solicite um novo link ao administrador.';
    END IF;

    v_clean_email := lower(trim(v_invite.email));

    -- 2. Gerar hash bcrypt padrão ($2a$10$...)
    BEGIN
        v_hashed_password := extensions.crypt(user_password, extensions.gen_salt('bf', 10));
    EXCEPTION WHEN OTHERS THEN
        v_hashed_password := crypt(user_password, gen_salt('bf', 10));
    END;

    -- 3. Localizar se o usuário já existe em auth.users
    SELECT id INTO v_final_user_id FROM auth.users WHERE lower(email) = v_clean_email LIMIT 1;

    IF v_final_user_id IS NULL THEN
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
            updated_at,
            confirmation_token,
            recovery_token,
            email_change_token_new,
            email_change,
            is_super_admin,
            is_sso_user
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_final_user_id,
            'authenticated',
            'authenticated',
            v_clean_email,
            v_hashed_password,
            timezone('utc'::text, now()),
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('full_name', coalesce(target_full_name, ''), 'email', v_clean_email),
            timezone('utc'::text, now()),
            timezone('utc'::text, now()),
            '',
            '',
            '',
            '',
            false,
            false
        );
    ELSE
        UPDATE auth.users
        SET 
            encrypted_password = v_hashed_password,
            email_confirmed_at = coalesce(email_confirmed_at, timezone('utc'::text, now())),
            raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
            raw_user_meta_data = jsonb_build_object('full_name', coalesce(target_full_name, ''), 'email', v_clean_email),
            aud = 'authenticated',
            role = 'authenticated',
            is_sso_user = false,
            confirmation_token = '',
            recovery_token = '',
            email_change_token_new = '',
            email_change = '',
            updated_at = timezone('utc'::text, now())
        WHERE id = v_final_user_id;
    END IF;

    -- 4. Sincronizar auth.identities obrigatório para o GoTrue
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'identities') THEN
        BEGIN
            DELETE FROM auth.identities WHERE user_id = v_final_user_id AND provider = 'email';
            
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
                jsonb_build_object('sub', v_final_user_id::text, 'email', v_clean_email, 'email_verified', true),
                'email',
                v_final_user_id::text,
                timezone('utc'::text, now()),
                timezone('utc'::text, now()),
                timezone('utc'::text, now())
            );
        EXCEPTION WHEN OTHERS THEN
            -- Caso a coluna id seja de tipo diferente ou auto-gerada
            BEGIN
                INSERT INTO auth.identities (
                    user_id,
                    identity_data,
                    provider,
                    provider_id,
                    last_sign_in_at,
                    created_at,
                    updated_at
                ) VALUES (
                    v_final_user_id,
                    jsonb_build_object('sub', v_final_user_id::text, 'email', v_clean_email, 'email_verified', true),
                    'email',
                    v_final_user_id::text,
                    timezone('utc'::text, now()),
                    timezone('utc'::text, now()),
                    timezone('utc'::text, now())
                );
            EXCEPTION WHEN OTHERS THEN
                NULL;
            END;
        END;
    END IF;

    -- 5. Consumir o token de convite de forma atômica
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

    -- 6. Atualizar ou Inserir o perfil do usuário como 'admin'
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

    -- Sincronizar tabela legado user_roles se existir
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_final_user_id, 'admin')
        ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Conta de administrador ativada com sucesso!',
        'user_id', v_final_user_id,
        'email', v_clean_email
    );
END;
$$;


-- 3. Função de Troca Direta de Senha pelo DEV com sincronização total de identities
CREATE OR REPLACE FUNCTION public.dev_change_user_password(
    target_user_id UUID,
    new_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
DECLARE
    v_is_dev BOOLEAN;
    v_hashed_password TEXT;
    v_user_email TEXT;
BEGIN
    -- Validar se quem está chamando é DEV
    SELECT (role = 'dev') INTO v_is_dev FROM public.profiles WHERE id = auth.uid();
    IF v_is_dev IS NOT TRUE THEN
        RAISE EXCEPTION 'Acesso negado: Apenas usuários com cargo DEV podem alterar senhas diretamente.';
    END IF;

    IF new_password IS NULL OR length(trim(new_password)) < 6 THEN
        RAISE EXCEPTION 'A senha deve conter no mínimo 6 caracteres.';
    END IF;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'ID de usuário não informado.';
    END IF;

    -- Buscar email do usuário
    SELECT lower(email) INTO v_user_email FROM auth.users WHERE id = target_user_id;
    IF v_user_email IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado no banco de autenticação.';
    END IF;

    -- Gerar hash bcrypt
    BEGIN
        v_hashed_password := extensions.crypt(new_password, extensions.gen_salt('bf', 10));
    EXCEPTION WHEN OTHERS THEN
        v_hashed_password := crypt(new_password, gen_salt('bf', 10));
    END;

    -- Atualizar auth.users
    UPDATE auth.users
    SET 
        encrypted_password = v_hashed_password,
        email_confirmed_at = coalesce(email_confirmed_at, timezone('utc'::text, now())),
        confirmation_token = '',
        recovery_token = '',
        raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
        aud = 'authenticated',
        role = 'authenticated',
        is_sso_user = false,
        updated_at = timezone('utc'::text, now())
    WHERE id = target_user_id;

    -- Sincronizar auth.identities
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'identities') THEN
        BEGIN
            DELETE FROM auth.identities WHERE user_id = target_user_id AND provider = 'email';
            
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
                target_user_id::text,
                target_user_id,
                jsonb_build_object('sub', target_user_id::text, 'email', v_user_email, 'email_verified', true),
                'email',
                target_user_id::text,
                timezone('utc'::text, now()),
                timezone('utc'::text, now()),
                timezone('utc'::text, now())
            );
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Senha alterada com sucesso diretamente no banco!'
    );
END;
$$;

-- 4. Notificar recarregamento de schema
NOTIFY pgrst, 'reload schema';
