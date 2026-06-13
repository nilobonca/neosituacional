-- =========================================================================
-- Tornar o envio de balancetes Opcional nas Propostas
-- =========================================================================

-- Remove a constraint que obrigava ter exatamente 3 arquivos no array de URLs
ALTER TABLE public.commercial_proposals
DROP CONSTRAINT IF EXISTS check_proposal_exact_three_files;
