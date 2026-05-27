-- ==========================================
-- Inserção de Dados Falsos (3 Propostas de Condomínios) para Teste do Fluxo
-- ==========================================

-- Limpar propostas existentes para evitar duplicação (Opcional, comente se não quiser)
-- TRUNCATE public.commercial_proposals;

INSERT INTO public.commercial_proposals (
    document, 
    condominium_name, 
    representative_name, 
    email, 
    phone, 
    blocks, 
    apartments, 
    houses, 
    employees, 
    files_urls, 
    status,
    created_at
)
VALUES 
-- Proposta 1: Condomínio Residencial (Novo)
(
    '12.345.678/0001-90', 
    'Condomínio Residencial Acácias', 
    'Carlos Eduardo', 
    'sindico.acacias@gmail.com', 
    '(11) 98765-4321', 
    3, 
    120, 
    0, 
    5, 
    '["https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"]'::jsonb, 
    'new',
    now() - interval '2 days'
),
-- Proposta 2: Condomínio Horizontal (Em Análise)
(
    '87.654.321/0001-09', 
    'Residencial Vale Verde', 
    'Mariana Alves Oliveira', 
    'contato@valeverde.com.br', 
    '(21) 91234-5678', 
    0, 
    0, 
    85, 
    12, 
    '["https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"]'::jsonb, 
    'in_progress',
    now() - interval '5 days'
),
-- Proposta 3: Prédio Comercial (Aceito)
(
    '45.987.123/0001-88',
    'Edifício Comercial JK',
    'Roberto Ferraz',
    'administracao@edificiojk.com',
    '(11) 3456-7890',
    1,
    45,
    0,
    3,
    '[]'::jsonb,
    'accepted',
    now() - interval '10 days'
);
