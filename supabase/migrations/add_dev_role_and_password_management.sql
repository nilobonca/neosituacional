-- =========================================================================
-- Migração: Criação da Role DEV e Funções de Gestão e Redefinição de Senhas
-- =========================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Atualizar restrição de cargos na tabela profiles para incluir 'dev'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'sindico', 'dev'));

-- Se a tabela legado user_roles existir, atualizar também
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
        ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
        ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check CHECK (role IN ('admin', 'sindico', 'dev'));
    END IF;
END $$;

-- 3. Atualizar a função is_admin() para conceder acesso total também ao DEV
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

-- 4. Função auxiliar is_dev() para checar se o usuário atual é especificamente DEV
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
-- 5. RPC: dev_change_user_password (Troca Direta de Senha no Banco)
-- Permite ao DEV alterar a senha de qualquer usuário ou admin diretamente
-- =========================================================================
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

    -- Gerar o hash bcrypt usando pgcrypto da extensão extensions
    BEGIN
        v_hashed_password := extensions.crypt(new_password, extensions.gen_salt('bf', 10));
    EXCEPTION WHEN OTHERS THEN
        v_hashed_password := crypt(new_password, gen_salt('bf', 10));
    END;

    -- Atualizar a senha criptografada na tabela auth.users do Supabase
    UPDATE auth.users
    SET 
        encrypted_password = v_hashed_password,
        updated_at = timezone('utc'::text, now())
    WHERE id = target_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuário não encontrado.';
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Senha alterada com sucesso diretamente no banco!'
    );
END;
$$;

-- =========================================================================
-- 6. RPC: dev_list_all_users (Listagem Central de Contas para o DEV)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.dev_list_all_users()
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    email_confirmed_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_is_dev BOOLEAN;
BEGIN
    SELECT (p.role = 'dev') INTO v_is_dev FROM public.profiles p WHERE p.id = auth.uid();
    IF v_is_dev IS NOT TRUE THEN
        RAISE EXCEPTION 'Acesso negado: Apenas DEV pode acessar a listagem de usuários do sistema.';
    END IF;

    RETURN QUERY
    SELECT 
        u.id,
        u.email::TEXT,
        coalesce(p.full_name, u.raw_user_meta_data->>'full_name', '')::TEXT as full_name,
        coalesce(p.role, 'sindico')::TEXT as role,
        u.created_at,
        u.last_sign_in_at,
        u.email_confirmed_at
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    ORDER BY u.created_at DESC;
END;
$$;

-- =========================================================================
-- 7. RPC: dev_update_user_role (Alteração de Cargos: sindico, admin, dev)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.dev_update_user_role(
    target_user_id UUID,
    new_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_is_dev BOOLEAN;
BEGIN
    SELECT (role = 'dev') INTO v_is_dev FROM public.profiles WHERE id = auth.uid();
    IF v_is_dev IS NOT TRUE THEN
        RAISE EXCEPTION 'Acesso negado: Apenas DEV pode alterar cargos de usuários.';
    END IF;

    IF new_role NOT IN ('sindico', 'admin', 'dev') THEN
        RAISE EXCEPTION 'Cargo inválido. Opções: sindico, admin, dev.';
    END IF;

    UPDATE public.profiles
    SET role = new_role
    WHERE id = target_user_id;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, new_role)
        ON CONFLICT (user_id) DO UPDATE SET role = new_role;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Cargo atualizado com sucesso!'
    );
END;
$$;

-- 8. Recarregar o schema do PostgREST
NOTIFY pgrst, 'reload schema';
