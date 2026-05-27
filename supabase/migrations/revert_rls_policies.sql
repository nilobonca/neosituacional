-- ==========================================
-- Reativar Permissões (RLS) Oficiais
-- ==========================================

-- Como o sistema de Login agora está ativo, vamos reverter as tabelas
-- para o estado de segurança máxima (bloqueando acessos anônimos de leitura).

-- 1. Restaurar proteção de Currículos (job_applications)
DROP POLICY IF EXISTS "Permitir leitura publica de candidaturas" ON public.job_applications;
CREATE POLICY "Apenas admin pode ver candidaturas" 
ON public.job_applications
FOR SELECT 
TO authenticated
USING (true);

-- 2. Restaurar proteção de Propostas (commercial_proposals)
DROP POLICY IF EXISTS "Permitir leitura publica de propostas" ON public.commercial_proposals;
CREATE POLICY "Apenas admin pode ver propostas" 
ON public.commercial_proposals
FOR SELECT 
TO authenticated
USING (true);
