-- =========================================================================
-- Tornar o envio de currículo obrigatório
-- =========================================================================

-- Adiciona uma constraint garantindo que o curriculo nunca seja nulo nem vazio
ALTER TABLE public.job_applications
ADD CONSTRAINT check_job_application_resume_mandatory
CHECK (
  resume_url IS NOT NULL AND trim(resume_url) <> ''
) NOT VALID;
