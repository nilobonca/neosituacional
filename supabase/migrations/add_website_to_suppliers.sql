-- Adiciona a coluna website (opcional) na tabela de fornecedores
ALTER TABLE public.suppliers_applications 
ADD COLUMN IF NOT EXISTS website TEXT;
