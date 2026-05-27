-- ==========================================
-- Atualização: Adicionando Departamento
-- ==========================================

-- Adicionar a coluna department à tabela job_applications
ALTER TABLE public.job_applications 
ADD COLUMN IF NOT EXISTS department TEXT;

-- Opcional: Se quiser garantir que os registros futuros tenham departamento obrigatório,
-- você pode adicionar uma restrição (constraint), mas como já há validação no frontend,
-- deixar a coluna aceitar nulo temporariamente evita quebrar dados antigos caso existam.
-- Para forçar a validação no banco de dados, descomente a linha abaixo após atualizar registros antigos:
-- ALTER TABLE public.job_applications ALTER COLUMN department SET NOT NULL;
