-- ==========================================
-- Migração: Criação da Tabela Profiles (Usuários)
-- ==========================================

-- 1. Cria a tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'sindico' CHECK (role IN ('admin', 'sindico')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilita RLS na tabela
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Segurança para Profiles
-- Usuários podem ler seu próprio perfil
CREATE POLICY "Usuários podem ver o próprio perfil" 
ON public.profiles
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio nome e email, MAS NÃO o cargo
CREATE POLICY "Usuários podem atualizar dados básicos do próprio perfil" 
ON public.profiles
FOR UPDATE
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id 
    -- Evita que um usuário mal-intencionado mude sua própria role
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

-- Admins podem ler todos os perfis
CREATE POLICY "Admins podem ver todos os perfis" 
ON public.profiles
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Admins podem editar todos os perfis (incluindo cargo)
CREATE POLICY "Admins podem editar todos os perfis" 
ON public.profiles
FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 4. Migrar dados existentes de user_roles para profiles
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    au.id, 
    au.email, 
    coalesce(au.raw_user_meta_data->>'full_name', ''), 
    coalesce(ur.role, 'sindico')
FROM auth.users au
LEFT JOIN public.user_roles ur ON au.id = ur.user_id
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

-- 5. Atualizar o gatilho de criação de conta (handle_new_user)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insere o novo usuário na tabela profiles como 'sindico'
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
      new.id, 
      new.email, 
      coalesce(new.raw_user_meta_data->>'full_name', ''), 
      'sindico'
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- (O trigger "on_auth_user_created" continua o mesmo, chamando a função acima)

-- 6. Atualizar as políticas que dependiam da user_roles (ex: suppliers_applications)
DROP POLICY IF EXISTS "Admins podem acessar todos os fornecedores" ON public.suppliers_applications;
CREATE POLICY "Admins podem acessar todos os fornecedores" 
ON public.suppliers_applications
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
);

DROP POLICY IF EXISTS "Sindicos podem ver apenas fornecedores aceitos" ON public.suppliers_applications;
CREATE POLICY "Sindicos podem ver apenas fornecedores aceitos" 
ON public.suppliers_applications
FOR SELECT
TO authenticated 
USING (
    status = 'accepted' AND 
    EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'sindico'
    )
);

-- 7. (Opcional, mas recomendado) Remover a tabela antiga após ter certeza de que os dados foram migrados e o código frontend atualizado.
-- Aqui, vamos mantê-la temporariamente por segurança, mas no futuro ela pode ser deletada.
-- DROP TABLE IF EXISTS public.user_roles;
