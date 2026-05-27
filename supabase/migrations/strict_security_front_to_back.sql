-- =========================================================================
-- Reforço Rigoroso de Segurança e Validação de Dados (Igualando ao Front-End)
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. Tabela: commercial_proposals (Propostas de Condomínios)
-- -------------------------------------------------------------------------

-- 1.a Evitar textos vazios ou preenchidos apenas com espaços
ALTER TABLE public.commercial_proposals
ADD CONSTRAINT check_proposal_text_not_empty 
CHECK (
  TRIM(document) <> '' AND 
  TRIM(condominium_name) <> '' AND 
  TRIM(representative_name) <> '' AND 
  TRIM(email) <> '' AND 
  TRIM(phone) <> ''
);

-- 1.b Evitar números negativos
ALTER TABLE public.commercial_proposals
ADD CONSTRAINT check_proposal_numbers_positive 
CHECK (
  blocks >= 0 AND 
  apartments >= 0 AND 
  houses >= 0 AND 
  employees >= 0
);

-- 1.c Garantir que tenha pelo menos casas ou apartamentos
ALTER TABLE public.commercial_proposals
ADD CONSTRAINT check_proposal_has_units
CHECK (
  apartments > 0 OR houses > 0
);


-- -------------------------------------------------------------------------
-- 2. Tabela: job_applications (Currículos)
-- -------------------------------------------------------------------------

-- 2.a Evitar textos vazios ou preenchidos apenas com espaços
ALTER TABLE public.job_applications
ADD CONSTRAINT check_job_app_text_not_empty
CHECK (
  TRIM(name) <> '' AND 
  TRIM(email) <> '' AND 
  TRIM(resume_url) <> ''
);
-- Nota: A validação do departamento já é feita na trigger check_department_and_log()


-- -------------------------------------------------------------------------
-- 3. Tabela: suppliers_applications (Fornecedores)
-- -------------------------------------------------------------------------

-- 3.a Evitar textos vazios ou preenchidos apenas com espaços
ALTER TABLE public.suppliers_applications
ADD CONSTRAINT check_supplier_text_not_empty
CHECK (
  TRIM(company_name) <> '' AND 
  TRIM(email) <> '' AND 
  TRIM(phone) <> '' AND 
  TRIM(work_offered) <> '' AND 
  TRIM(common_services) <> '' AND 
  TRIM(average_value) <> '' AND 
  TRIM(logo_url) <> ''
);
