-- =========================================================================
-- Tornar Logo de Fornecedores Opcional
-- =========================================================================

-- 1. Remove a constraint de validação rigorosa anterior
ALTER TABLE public.suppliers_applications
DROP CONSTRAINT IF EXISTS check_supplier_text_not_empty;

-- 2. Recria a constraint retirando a obrigatoriedade da 'logo_url' não ser vazia
ALTER TABLE public.suppliers_applications
ADD CONSTRAINT check_supplier_text_not_empty
CHECK (
  TRIM(company_name) <> '' AND 
  TRIM(email) <> '' AND 
  TRIM(phone) <> '' AND 
  TRIM(work_offered) <> '' AND 
  TRIM(common_services) <> '' AND 
  TRIM(average_value) <> ''
);

-- Como logo_url aceitará textos vazios, a segurança continuará ativa 
-- nos outros campos, e o front-end mandará um texto vazio quando não houver imagem.
