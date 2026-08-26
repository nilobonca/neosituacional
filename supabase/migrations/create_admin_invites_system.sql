-- =========================================================================
-- Migração: Sistema de Convites de Administrador com JWT de Uso Único
-- =========================================================================

-- 1. Habilitar a extensão pgcrypto (no schema extensions ou public)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Tabela para registrar e controlar o ciclo de vida dos convites
CREATE TABLE IF NOT EXISTS public.admin_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'revoked', 'expired')),
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE
);

-- Índices para buscas rápidas por token, status e email
CREATE INDEX IF NOT EXISTS idx_admin_invites_token ON public.admin_invites(token);
CREATE INDEX IF NOT EXISTS idx_admin_invites_email ON public.admin_invites(email);
CREATE INDEX IF NOT EXISTS idx_admin_invites_status ON public.admin_invites(status);

-- 3. Habilitar RLS na tabela de convites
ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de RLS
DROP POLICY IF EXISTS "Admins podem visualizar convites" ON public.admin_invites;
CREATE POLICY "Admins podem visualizar convites" 
ON public.admin_invites
FOR SELECT 
TO authenticated 
USING ( public.is_admin() );

DROP POLICY IF EXISTS "Admins podem criar convites" ON public.admin_invites;
CREATE POLICY "Admins podem criar convites" 
ON public.admin_invites
FOR INSERT 
TO authenticated 
WITH CHECK ( public.is_admin() );

DROP POLICY IF EXISTS "Admins podem atualizar convites" ON public.admin_invites;
CREATE POLICY "Admins podem atualizar convites" 
ON public.admin_invites
FOR UPDATE 
TO authenticated 
USING ( public.is_admin() );

-- =========================================================================
-- 5. Funções Auxiliares para Criptografia e Geração de JWT no PostgreSQL
-- =========================================================================

DROP FUNCTION IF EXISTS public.base64url_encode(BYTEA);
CREATE OR REPLACE FUNCTION public.base64url_encode(input_bytes BYTEA)
RETURNS TEXT AS $$
BEGIN
    RETURN replace(replace(replace(encode(input_bytes, 'base64'), '+', '-'), '/', '_'), '=', '');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

DROP FUNCTION IF EXISTS public.generate_jwt_token(UUID, TEXT, TIMESTAMP WITH TIME ZONE);
CREATE OR REPLACE FUNCTION public.generate_jwt_token(
    p_invite_id UUID,
    p_email TEXT,
    p_expires_at TIMESTAMP WITH TIME ZONE
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
DECLARE
    v_secret TEXT := 'situacional_admin_invite_secret_key_2026_super_secure';
    v_header JSONB;
    v_payload JSONB;
    v_header_b64 TEXT;
    v_payload_b64 TEXT;
    v_signature_input TEXT;
    v_signature_raw BYTEA;
    v_signature_b64 TEXT;
BEGIN
    v_header := jsonb_build_object(
        'alg', 'HS256',
        'typ', 'JWT'
    );
    
    v_payload := jsonb_build_object(
        'jti', p_invite_id::text,
        'email', lower(trim(p_email)),
        'role', 'admin',
        'iat', extract(epoch from now())::bigint,
        'exp', extract(epoch from p_expires_at)::bigint
    );
    
    v_header_b64 := public.base64url_encode(convert_to(v_header::text, 'UTF8'));
    v_payload_b64 := public.base64url_encode(convert_to(v_payload::text, 'UTF8'));
    
    v_signature_input := v_header_b64 || '.' || v_payload_b64;
    
    BEGIN
        v_signature_raw := extensions.hmac(v_signature_input::text, v_secret::text, 'sha256'::text);
    EXCEPTION WHEN OTHERS THEN
        v_signature_raw := hmac(v_signature_input::text, v_secret::text, 'sha256'::text);
    END;
    
    v_signature_b64 := public.base64url_encode(v_signature_raw);
    
    RETURN v_signature_input || '.' || v_signature_b64;
END;
$$;

-- =========================================================================
-- 6. Função RPC: Criar Convite de Admin (create_admin_invite)
-- =========================================================================
DROP FUNCTION IF EXISTS public.create_admin_invite(TEXT, INTEGER);
DROP FUNCTION IF EXISTS public.create_admin_invite;
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
        id,
        email,
        token,
        status,
        invited_by,
        expires_at,
        created_at
    ) VALUES (
        v_invite_id,
        v_clean_email,
        v_token,
        'pending',
        v_admin_id,
        v_expires_at,
        timezone('utc'::text, now())
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

-- =========================================================================
-- 7. Função RPC: Validar Convite (validate_admin_invite)
-- =========================================================================
DROP FUNCTION IF EXISTS public.validate_admin_invite(TEXT);
DROP FUNCTION IF EXISTS public.validate_admin_invite;
CREATE OR REPLACE FUNCTION public.validate_admin_invite(token_jwt TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
DECLARE
    v_invite RECORD;
BEGIN
    IF token_jwt IS NULL OR trim(token_jwt) = '' THEN
        RETURN jsonb_build_object(
            'valid', false,
            'reason', 'Token não informado.'
        );
    END IF;

    SELECT * INTO v_invite 
    FROM public.admin_invites 
    WHERE token = token_jwt;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'valid', false,
            'reason', 'Convite não encontrado ou token inválido.'
        );
    END IF;

    IF v_invite.status = 'used' THEN
        RETURN jsonb_build_object(
            'valid', false,
            'reason', 'Este convite já foi utilizado e não pode ser reutilizado.'
        );
    END IF;

    IF v_invite.status = 'revoked' THEN
        RETURN jsonb_build_object(
            'valid', false,
            'reason', 'Este convite foi cancelado pelo administrador.'
        );
    END IF;

    IF v_invite.expires_at < timezone('utc'::text, now()) THEN
        UPDATE public.admin_invites SET status = 'expired' WHERE id = v_invite.id;
        RETURN jsonb_build_object(
            'valid', false,
            'reason', 'Este convite expirou. Solicite um novo link ao administrador.'
        );
    END IF;

    RETURN jsonb_build_object(
        'valid', true,
        'email', v_invite.email,
        'expires_at', v_invite.expires_at
    );
END;
$$;

-- =========================================================================
-- 8. Função RPC: Aceitar e Consumir Convite de Forma Atômica (accept_admin_invite)
-- =========================================================================
DROP FUNCTION IF EXISTS public.accept_admin_invite(TEXT, UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.accept_admin_invite(TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS public.accept_admin_invite;
CREATE OR REPLACE FUNCTION public.accept_admin_invite(
    token_jwt TEXT,
    target_user_id UUID,
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
    v_hashed_password TEXT;
BEGIN
    IF token_jwt IS NULL OR target_user_id IS NULL THEN
        RAISE EXCEPTION 'Parâmetros obrigatórios ausentes: token_jwt e target_user_id.';
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

    -- 2. Consumir o token de convite de forma atômica (Uso Único)
    UPDATE public.admin_invites
    SET 
        status = 'used',
        used_at = timezone('utc'::text, now()),
        used_by = target_user_id
    WHERE id = v_invite.id AND status = 'pending';

    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
    IF v_updated_rows = 0 THEN
        RAISE EXCEPTION 'Falha ao processar convite: o token já foi consumido por outra requisição.';
    END IF;

    -- 3. Confirmar o e-mail em auth.users e sincronizar senha
    -- Nota: Não atualizamos "confirmed_at" diretamente pois é uma coluna gerada (GENERATED ALWAYS) no Supabase
    IF user_password IS NOT NULL AND length(trim(user_password)) >= 6 THEN
        BEGIN
            v_hashed_password := extensions.crypt(user_password, extensions.gen_salt('bf', 10));
        EXCEPTION WHEN OTHERS THEN
            v_hashed_password := crypt(user_password, gen_salt('bf', 10));
        END;

        UPDATE auth.users
        SET 
            encrypted_password = v_hashed_password,
            email_confirmed_at = coalesce(email_confirmed_at, timezone('utc'::text, now())),
            raw_user_meta_data = jsonb_build_object('full_name', coalesce(target_full_name, '')),
            updated_at = timezone('utc'::text, now())
        WHERE id = target_user_id;
    ELSE
        UPDATE auth.users
        SET 
            email_confirmed_at = coalesce(email_confirmed_at, timezone('utc'::text, now())),
            raw_user_meta_data = jsonb_build_object('full_name', coalesce(target_full_name, '')),
            updated_at = timezone('utc'::text, now())
        WHERE id = target_user_id;
    END IF;

    -- 4. Atualizar ou Inserir o perfil do usuário como 'admin'
    INSERT INTO public.profiles (id, email, full_name, role, created_at)
    VALUES (
        target_user_id,
        v_invite.email,
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
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Convite consumido com sucesso. Conta de administrador ativada!',
        'user_id', target_user_id,
        'email', v_invite.email
    );
END;
$$;

-- =========================================================================
-- 9. Função RPC: Revogar Convite (revoke_admin_invite)
-- =========================================================================
DROP FUNCTION IF EXISTS public.revoke_admin_invite(UUID);
DROP FUNCTION IF EXISTS public.revoke_admin_invite;
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

-- 10. Recarregar o schema do PostgREST
NOTIFY pgrst, 'reload schema';
