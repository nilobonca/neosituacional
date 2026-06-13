-- =========================================================================
-- Atualizações para Vagas e Propostas
-- =========================================================================

-- 1. Adicionar telefone na tabela de vagas (Trabalhe Conosco)
ALTER TABLE public.job_applications 
ADD COLUMN IF NOT EXISTS phone text;

-- 2. Atualizar a restrição de balancetes (1 a 3 arquivos)
ALTER TABLE public.commercial_proposals
DROP CONSTRAINT IF EXISTS check_proposal_exact_three_files;

ALTER TABLE public.commercial_proposals
ADD CONSTRAINT check_proposal_files_count
CHECK (
  jsonb_array_length(files_urls) >= 1 AND jsonb_array_length(files_urls) <= 3
) NOT VALID;
