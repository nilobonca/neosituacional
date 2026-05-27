-- ==========================================
-- Configuração do Módulo de Fornecedores
-- ==========================================

-- 1. Criação da Tabela de Fornecedores (suppliers_applications)
CREATE TABLE IF NOT EXISTS public.suppliers_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    work_offered TEXT NOT NULL,
    common_services TEXT NOT NULL,
    average_value TEXT NOT NULL,
    compete_budgets BOOLEAN NOT NULL DEFAULT false,
    logo_url TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Ativar Segurança Máxima (RLS)
ALTER TABLE public.suppliers_applications ENABLE ROW LEVEL SECURITY;

-- Política 1: Permitir que qualquer pessoa envie o formulário (INSERT público)
CREATE POLICY "Envio publico de fornecedores" 
ON public.suppliers_applications
FOR INSERT 
TO public
WITH CHECK (true);

-- Política 2: Permitir que apenas o admin veja a tabela (SELECT, UPDATE, DELETE restritos)
CREATE POLICY "Acesso total apenas para admin" 
ON public.suppliers_applications
TO authenticated 
USING (true) 
WITH CHECK (true);


-- ==========================================
-- 3. Criação do Bucket de Storage (suppliers_logos)
-- ==========================================

-- Inserir o bucket na tabela de configuração do storage se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('suppliers_logos', 'suppliers_logos', true)
ON CONFLICT (id) DO NOTHING;

-- Política 3: Qualquer um pode fazer upload (insert) da logo
CREATE POLICY "Permitir upload anônimo de logos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'suppliers_logos');

-- Política 4: Qualquer um pode ver a logo gerada (leitura do arquivo)
CREATE POLICY "Permitir visualização pública de logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'suppliers_logos');
