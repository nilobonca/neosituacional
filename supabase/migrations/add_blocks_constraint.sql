-- ==========================================
-- Migração: Tornar a quantidade de blocos obrigatória apenas se houver apartamentos
-- ==========================================

-- Adiciona uma restrição (CHECK constraint) na tabela de propostas comerciais
-- A regra é: Se a quantidade de apartamentos for maior que 0, a quantidade de blocos DEVE ser maior que 0.
ALTER TABLE public.commercial_proposals
ADD CONSTRAINT check_blocks_required_if_apartments 
CHECK (apartments = 0 OR blocks > 0);
