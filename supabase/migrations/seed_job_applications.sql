-- ==========================================
-- Inserção de Dados Falsos para Testes
-- ==========================================

INSERT INTO public.job_applications (name, email, department, resume_url, status)
VALUES 
(
    'Ana Clara Silva', 
    'ana.clara.teste@email.com', 
    'Financeiro', 
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 
    'new'
),
(
    'Marcos Vinícius Santos', 
    'marcos.v.santos@email.com', 
    'Jurídico', 
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 
    'new'
);
