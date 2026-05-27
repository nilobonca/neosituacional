-- ==========================================
-- Configuração da Página de Propostas Comerciais
-- ==========================================

-- 1. Criação da Tabela de Propostas (commercial_proposals)
CREATE TABLE IF NOT EXISTS public.commercial_proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document TEXT NOT NULL,
    condominium_name TEXT NOT NULL,
    representative_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    blocks INTEGER DEFAULT 0,
    apartments INTEGER DEFAULT 0,
    houses INTEGER DEFAULT 0,
    employees INTEGER DEFAULT 0,
    files_urls JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar Row Level Security (RLS) para proteção
ALTER TABLE public.commercial_proposals ENABLE ROW LEVEL SECURITY;

-- Política: Permitir que qualquer usuário insira uma proposta (anon)
CREATE POLICY "Permitir inserção anônima de propostas" 
ON public.commercial_proposals
FOR INSERT 
TO public
WITH CHECK (true);

-- Política: Apenas usuários autenticados (admin) podem ver as propostas
CREATE POLICY "Apenas admin pode ver propostas" 
ON public.commercial_proposals
FOR SELECT 
TO authenticated
USING (true);


-- ==========================================
-- 2. Criação do Bucket de Storage (proposals)
-- ==========================================

-- Inserir o bucket na tabela de configuração do storage se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('proposals', 'proposals', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Qualquer um pode fazer upload (insert) de balancetes
CREATE POLICY "Permitir upload anônimo de balancetes"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'proposals');

-- Política: Qualquer um pode ver os arquivos (leitura para exibição na dashboard admin)
CREATE POLICY "Permitir visualização pública de balancetes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'proposals');
