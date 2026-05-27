-- =========================================================================
-- Tornar o envio de 3 balancetes Obrigatório nas Propostas
-- =========================================================================

-- Adiciona uma constraint garantindo que o array de URLs de arquivos tenha exatamente 3 itens
-- Usamos NOT VALID para não dar erro caso você já tenha propostas antigas de teste sem os 3 arquivos
ALTER TABLE public.commercial_proposals
ADD CONSTRAINT check_proposal_exact_three_files
CHECK (
  jsonb_array_length(files_urls) = 3
) NOT VALID;
