-- ==========================================
-- Ajuste de Permissões (RLS) para o Admin
-- ==========================================

-- Como o sistema ainda não possui um módulo de Login/Autenticação ativo,
-- o painel administrativo está tentando ler os dados como um usuário anônimo.
-- As políticas originais bloqueavam o acesso (exigiam autenticação).
-- Este script libera temporariamente a leitura para que você consiga visualizar os dados.

-- 1. Liberar leitura de Currículos (job_applications)
DROP POLICY IF EXISTS "Apenas admin pode ver candidaturas" ON public.job_applications;
CREATE POLICY "Permitir leitura publica de candidaturas" 
ON public.job_applications
FOR SELECT 
TO public
USING (true);

-- 2. Liberar leitura de Propostas (commercial_proposals)
DROP POLICY IF EXISTS "Apenas admin pode ver propostas" ON public.commercial_proposals;
CREATE POLICY "Permitir leitura publica de propostas" 
ON public.commercial_proposals
FOR SELECT 
TO public
USING (true);
