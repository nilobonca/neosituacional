-- ==========================================
-- Configuração do Módulo de Carreiras
-- ==========================================

-- 1. Criação da Tabela de Candidaturas (job_applications)
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    resume_url TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar Row Level Security (RLS) para proteção
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Política: Permitir que qualquer usuário insira uma candidatura (anon)
CREATE POLICY "Permitir inserção anônima de candidaturas" 
ON public.job_applications
FOR INSERT 
TO public
WITH CHECK (true);

-- Política: Apenas usuários autenticados (admin) podem ver as candidaturas
CREATE POLICY "Apenas admin pode ver candidaturas" 
ON public.job_applications
FOR SELECT 
TO authenticated
USING (true);


-- ==========================================
-- 2. Criação do Bucket de Storage (resumes)
-- ==========================================

-- Inserir o bucket na tabela de configuração do storage se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Qualquer um pode fazer upload (insert) de currículos
CREATE POLICY "Permitir upload anônimo de currículos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'resumes');

-- Política: Qualquer um pode ver os arquivos (leitura)
CREATE POLICY "Permitir visualização pública de currículos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resumes');
