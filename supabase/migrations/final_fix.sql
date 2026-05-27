-- ==========================================
-- SCRIPT DE CORREÇÃO DEFINITIVA
-- Por favor, copie tudo isso e rode no SQL Editor!
-- ==========================================

-- 1. Garantir que a tabela existe (caso o primeiro script tenha falhado)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'sindico' CHECK (role IN ('admin', 'sindico')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Limpar QUALQUER política antiga que possa estar causando erro (Loop Infinito)
DROP POLICY IF EXISTS "Usuários podem ver o próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem editar todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar dados básicos do próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Ler proprio perfil" ON public.profiles;

-- 4. Criar as políticas mais simples e seguras possíveis
-- Qualquer usuário logado pode ler o SEU PRÓPRIO perfil. Isso já faz o login funcionar!
CREATE POLICY "Ler proprio perfil" 
ON public.profiles
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Para permitir que admins vejam todos os usuários no futuro, usaremos o JWT ou uma função depois.
-- Por enquanto, o login precisa apenas ler o próprio perfil.

-- 5. Inserir você mesmo e os outros usuários se a tabela estiver vazia
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    au.id, 
    au.email, 
    coalesce(au.raw_user_meta_data->>'full_name', ''), 
    coalesce(ur.role, 'sindico')
FROM auth.users au
LEFT JOIN public.user_roles ur ON au.id = ur.user_id
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

-- 6. Forçar o Supabase a recarregar o cache do banco
NOTIFY pgrst, 'reload schema';
