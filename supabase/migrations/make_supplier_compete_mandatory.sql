-- =========================================================================
-- Tornar caixa "Quero disputar orçamentos" Obrigatória
-- =========================================================================

-- 1. Primeiro, precisamos corrigir os dados antigos.
-- Como já existem fornecedores cadastrados com a caixa desmarcada (false),
-- o banco de dados estava impedindo a criação da regra para proteger a tabela.
-- Esse comando atualiza todos os fornecedores antigos para "true" para não quebrar a regra.
UPDATE public.suppliers_applications
SET compete_budgets = true
WHERE compete_budgets = false OR compete_budgets IS NULL;

-- 2. Agora sim, adiciona a constraint garantindo que o checkbox deve ser sempre true
-- para todas as inserções e atualizações a partir de agora.
ALTER TABLE public.suppliers_applications
ADD CONSTRAINT check_supplier_compete_budgets_mandatory
CHECK (
  compete_budgets = true
);
