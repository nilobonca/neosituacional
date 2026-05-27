-- ==========================================
-- Sistema de Cargos (Roles) e Acesso
-- ==========================================

-- 1. Tabela de Cargos dos Usuários
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('admin', 'sindico'))
);

-- Ativar segurança na tabela de roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Política: Usuários logados podem ler o próprio cargo
CREATE POLICY "Usuarios podem ver o proprio cargo" 
ON public.user_roles
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Política: Apenas admins podem ler todos os cargos
CREATE POLICY "Admins podem ver todos os cargos" 
ON public.user_roles
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- ==========================================
-- 2. Atualização de Acesso: Fornecedores
-- ==========================================

-- O Sindico pode visualizar a tabela de fornecedores, mas APENAS os aprovados.
-- A politica do admin já está ativa ("Acesso total apenas para admin" que afeta authenticated),
-- Precisamos ajustar para que o Sindico também possa ler, mas com filtro.

DROP POLICY IF EXISTS "Acesso total apenas para admin" ON public.suppliers_applications;

-- Nova política 1: Admins podem ver/editar TUDO
CREATE POLICY "Admins podem acessar todos os fornecedores" 
ON public.suppliers_applications
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Nova política 2: Sindicos podem ver APENAS os fornecedores aceitos
CREATE POLICY "Sindicos podem ver apenas fornecedores aceitos" 
ON public.suppliers_applications
FOR SELECT
TO authenticated 
USING (
    status = 'accepted' AND 
    EXISTS (
        SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'sindico'
    )
);


/*
========================================================================
COMO DEFINIR O CARGO DAS CONTAS APÓS RODAR ESTE SCRIPT:
========================================================================

1. Acesse Authentication > Users no Supabase e copie o "User UID" da sua conta atual de admin.
2. Rode o seguinte comando no SQL Editor para se tornar admin (substitua o ID abaixo pelo seu):

   INSERT INTO public.user_roles (user_id, role) VALUES ('SEU-UID-AQUI', 'admin');

3. Toda vez que você criar uma conta para um síndico, pegue o UID dele lá no Authentication e rode:

   INSERT INTO public.user_roles (user_id, role) VALUES ('UID-DO-SINDICO-AQUI', 'sindico');

========================================================================
*/
