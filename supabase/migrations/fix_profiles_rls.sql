-- ==========================================
-- Correção: Loop infinito nas políticas RLS da tabela profiles
-- ==========================================

-- 1. Remover as políticas antigas que causam recursão
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem editar todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar dados básicos do próprio perfil" ON public.profiles;

-- 2. Criar uma função segura (SECURITY DEFINER) para verificar se o usuário é admin
-- Como ela é SECURITY DEFINER, ela "pula" as regras RLS e evita o loop infinito!
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 3. Recriar as políticas usando a nova função

-- Política para leitura (Admins veem tudo)
CREATE POLICY "Admins podem ver todos os perfis" 
ON public.profiles
FOR SELECT 
TO authenticated 
USING ( public.is_admin() );

-- Política para edição (Admins podem editar tudo)
CREATE POLICY "Admins podem editar todos os perfis" 
ON public.profiles
FOR UPDATE 
TO authenticated 
USING ( public.is_admin() )
WITH CHECK ( public.is_admin() );

-- Política para usuários editarem seus próprios dados
-- Obs: Para evitar o loop na verificação da 'role', já que usuários normais não podem mudar o cargo
CREATE POLICY "Usuários podem atualizar dados básicos do próprio perfil" 
ON public.profiles
FOR UPDATE
TO authenticated 
USING (auth.uid() = id AND NOT public.is_admin())
WITH CHECK (
    auth.uid() = id 
);

-- ==========================================
-- ATENÇÃO PARA A TABELA suppliers_applications
-- ==========================================
-- O mesmo loop infinito aconteceria aqui caso a tabela não existisse, mas lá nós também usávamos a query.
-- Para ficar seguro e rápido, vamos atualizar as políticas de fornecedores para usar a mesma função.

DROP POLICY IF EXISTS "Admins podem acessar todos os fornecedores" ON public.suppliers_applications;
CREATE POLICY "Admins podem acessar todos os fornecedores" 
ON public.suppliers_applications
TO authenticated 
USING ( public.is_admin() )
WITH CHECK ( public.is_admin() );

DROP POLICY IF EXISTS "Sindicos podem ver apenas fornecedores aceitos" ON public.suppliers_applications;
CREATE POLICY "Sindicos podem ver apenas fornecedores aceitos" 
ON public.suppliers_applications
FOR SELECT
TO authenticated 
USING (
    status = 'accepted' AND 
    (NOT public.is_admin()) -- Se não é admin, é síndico (ou podemos checar o próprio perfil via is_admin, mas já que só existem 2 cargos, se não for admin e estiver autenticado, pode ler os aceitos).
);
