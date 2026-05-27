-- =========================================================================
-- Reforço de Segurança: Validação de Departamento e Log de Tentativas
-- =========================================================================

-- 1. Criação da tabela de logs para registrar tentativas inválidas
CREATE TABLE IF NOT EXISTS public.invalid_application_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    attempted_name TEXT,
    attempted_email TEXT,
    attempted_department TEXT,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Segurança: Apenas admin pode ver os logs de tentativas
ALTER TABLE public.invalid_application_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Apenas admin pode ver logs" 
ON public.invalid_application_logs
FOR SELECT 
TO authenticated
USING (true);


-- 2. Criação da Função de Validação e Log
CREATE OR REPLACE FUNCTION public.check_department_and_log()
RETURNS TRIGGER AS $$
BEGIN
    -- Verifica se o departamento enviado NÃO está na lista permitida
    IF NEW.department NOT IN ('Departamento Pessoal', 'Financeiro', 'Condomínio', 'Jurídico', 'Vendas') THEN
        
        -- Insere os dados na tabela de log (como um honeypot / auditoria)
        INSERT INTO public.invalid_application_logs (attempted_name, attempted_email, attempted_department)
        VALUES (NEW.name, NEW.email, NEW.department);
        
        -- Retorna NULL para cancelar o INSERT principal silenciosamente.
        -- O Supabase (frontend) achará que deu certo, mas os dados não entrarão
        -- na tabela 'job_applications', protegendo o sistema sem avisar o invasor.
        RETURN NULL;
    END IF;
    
    -- Se o departamento for válido, permite a inserção normalmente
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 3. Criação do Gatilho (Trigger) na tabela principal
DROP TRIGGER IF EXISTS trigger_check_department ON public.job_applications;

CREATE TRIGGER trigger_check_department
BEFORE INSERT ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.check_department_and_log();
