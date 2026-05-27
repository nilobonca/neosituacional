-- ==========================================
-- Fechamento Total de Segurança (RLS Máximo)
-- ==========================================

-- Este script garante que TODAS as tabelas do projeto só possam ser
-- LIDAS (SELECT), INSERIDAS (INSERT), ATUALIZADAS (UPDATE) ou DELETADAS (DELETE)
-- por usuários autenticados (logados no painel).

-- ATENÇÃO: Ao rodar este script, a página inicial do seu site (pública) 
-- não conseguirá mais carregar os "Clientes" e "Depoimentos", pois os visitantes 
-- não estão logados. Veja o comentário no final do arquivo caso queira consertar isso.

-- 1. Tabela de Currículos
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir inserção anônima de candidaturas" ON public.job_applications;
DROP POLICY IF EXISTS "Permitir leitura publica de candidaturas" ON public.job_applications;
DROP POLICY IF EXISTS "Apenas admin pode ver candidaturas" ON public.job_applications;
CREATE POLICY "Acesso total apenas para admin" ON public.job_applications TO authenticated USING (true) WITH CHECK (true);

-- 2. Tabela de Propostas
ALTER TABLE public.commercial_proposals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir inserção anônima de propostas" ON public.commercial_proposals;
DROP POLICY IF EXISTS "Permitir leitura publica de propostas" ON public.commercial_proposals;
DROP POLICY IF EXISTS "Apenas admin pode ver propostas" ON public.commercial_proposals;
CREATE POLICY "Acesso total apenas para admin" ON public.commercial_proposals TO authenticated USING (true) WITH CHECK (true);

-- 3. Tabela de Logs de Invasão
ALTER TABLE public.invalid_application_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Apenas admin pode ver logs" ON public.invalid_application_logs;
CREATE POLICY "Acesso total apenas para admin" ON public.invalid_application_logs TO authenticated USING (true) WITH CHECK (true);

-- 4. Tabela de Clientes
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total apenas para admin" ON public.clients;
CREATE POLICY "Acesso total apenas para admin" ON public.clients TO authenticated USING (true) WITH CHECK (true);

-- 5. Tabela de Depoimentos
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total apenas para admin" ON public.testimonials;
CREATE POLICY "Acesso total apenas para admin" ON public.testimonials TO authenticated USING (true) WITH CHECK (true);

-- 6. Tabela de Configurações
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total apenas para admin" ON public.site_settings;
CREATE POLICY "Acesso total apenas para admin" ON public.site_settings TO authenticated USING (true) WITH CHECK (true);


/*
========================================================================
SOLUÇÃO PARA A PÁGINA INICIAL NÃO QUEBRAR
========================================================================
Se o seu site público parar de exibir os "Clientes" e "Depoimentos" 
(porque eles agora exigem login para serem lidos), rode os 4 comandos abaixo 
para abrir APENAS a leitura dessas duas tabelas e manter o resto blindado:

CREATE POLICY "Leitura publica de clientes" ON public.clients FOR SELECT TO public USING (true);
CREATE POLICY "Leitura publica de depoimentos" ON public.testimonials FOR SELECT TO public USING (true);

E como os currículos e propostas precisam ser ENVIADOS por pessoas anônimas:
CREATE POLICY "Envio publico de curriculos" ON public.job_applications FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Envio publico de propostas" ON public.commercial_proposals FOR INSERT TO public WITH CHECK (true);
*/
