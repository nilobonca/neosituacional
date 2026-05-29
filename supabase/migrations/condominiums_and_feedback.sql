-- Criação da tabela de condomínios
CREATE TABLE IF NOT EXISTS public.condominiums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS
ALTER TABLE public.condominiums ENABLE ROW LEVEL SECURITY;

-- Políticas para condominiums
-- Admins podem fazer tudo
DROP POLICY IF EXISTS "Acesso total aos condominios para admin" ON public.condominiums;
CREATE POLICY "Acesso total aos condominios para admin" 
ON public.condominiums
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Leitura pública para popular formulários (cadastro de síndico e feedback)
DROP POLICY IF EXISTS "Leitura publica de condominios ativos" ON public.condominiums;
CREATE POLICY "Leitura publica de condominios ativos"
ON public.condominiums FOR SELECT
TO public
USING (active = true);

-- Modificar tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS condominium_id UUID REFERENCES public.condominiums(id) ON DELETE SET NULL;

-- Modificar tabela testimonials
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS condominium_id UUID REFERENCES public.condominiums(id) ON DELETE CASCADE;

-- Atualizar trigger handle_new_user para capturar condominium_id se existir
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_condo_id UUID;
BEGIN
  -- Tenta pegar o condominium_id dos metadados (se houver e for válido)
  BEGIN
    v_condo_id := (new.raw_user_meta_data->>'condominium_id')::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_condo_id := NULL;
  END;

  INSERT INTO public.profiles (id, email, full_name, role, condominium_id)
  VALUES (
      new.id, 
      new.email, 
      coalesce(new.raw_user_meta_data->>'full_name', ''), 
      'sindico',
      v_condo_id
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ajustar política da tabela testimonials para síndicos lerem seus próprios feedbacks
DROP POLICY IF EXISTS "Sindicos podem ler depoimentos de seus condominios" ON public.testimonials;
CREATE POLICY "Sindicos podem ler depoimentos de seus condominios"
ON public.testimonials FOR SELECT
TO authenticated
USING (
    condominium_id IS NOT NULL 
    AND condominium_id = (SELECT condominium_id FROM public.profiles WHERE id = auth.uid())
);

-- Precisamos permitir também inserção pública de testimonials (antes era só SELECT)
DROP POLICY IF EXISTS "Envio publico de depoimentos" ON public.testimonials;
CREATE POLICY "Envio publico de depoimentos"
ON public.testimonials FOR INSERT
TO public
WITH CHECK (true);
