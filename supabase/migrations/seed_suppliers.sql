-- ==========================================
-- Inserção de Dados Falsos (Fornecedores)
-- ==========================================

INSERT INTO public.suppliers_applications (
    company_name, 
    email, 
    phone, 
    work_offered, 
    common_services, 
    average_value, 
    compete_budgets, 
    logo_url, 
    status
)
VALUES 
(
    'EletroLuz Manutenções', 
    'contato@eletroluz.com.br', 
    '(11) 98765-4321', 
    'Manutenção Elétrica e CFTV', 
    'Troca de fiação geral, instalação de quadros elétricos, manutenção de portões e câmeras de segurança.', 
    'R$ 350,00 por visita técnica / Contratos a partir de R$ 1.500,00', 
    true, 
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop', 
    'new'
),
(
    'Jardins & Cia', 
    'orcamento@jardinsecia.com', 
    '(21) 91234-5678', 
    'Jardinagem e Paisagismo', 
    'Poda de árvores, manutenção de gramado, plantio de mudas e paisagismo nas áreas comuns.', 
    'Aproximadamente R$ 800,00 mensais', 
    false, 
    'https://images.unsplash.com/photo-1585320806297-9794b3e4ce11?q=80&w=2070&auto=format&fit=crop', 
    'new'
);
