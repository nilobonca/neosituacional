-- =========================================================================
-- Migração: Garantir Suporte Completo no Supabase para o CMS de Conteúdo
-- (Tabelas: site_settings e services, com políticas RLS públicas e de admin)
-- =========================================================================

-- 1. TABELA DE CONFIGURAÇÕES GERAIS E TEXTOS DO SITE (site_settings)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Visitantes e público podem LER as configurações para renderizar as páginas
DROP POLICY IF EXISTS "Leitura publica de configuracoes" ON public.site_settings;
CREATE POLICY "Leitura publica de configuracoes" 
ON public.site_settings 
FOR SELECT 
TO public 
USING (true);

-- Apenas Administradores e Desenvolvedores podem Inserir/Atualizar/Deletar
DROP POLICY IF EXISTS "Admins podem atualizar configuracoes" ON public.site_settings;
CREATE POLICY "Admins podem atualizar configuracoes" 
ON public.site_settings 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'dev')
    )
) 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'dev')
    )
);


-- 2. TABELA DE CARDS DE SERVIÇOS (services)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Star',
    features TEXT[] DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Leitura pública dos serviços (para exibição no site e no rodapé)
DROP POLICY IF EXISTS "Leitura publica de servicos" ON public.services;
CREATE POLICY "Leitura publica de servicos" 
ON public.services 
FOR SELECT 
TO public 
USING (true);

-- Apenas Administradores e Desenvolvedores podem cadastrar/alterar/excluir serviços
DROP POLICY IF EXISTS "Admins podem gerenciar servicos" ON public.services;
CREATE POLICY "Admins podem gerenciar servicos" 
ON public.services 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'dev')
    )
) 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'dev')
    )
);

-- 3. Notificar recarregamento de schema
NOTIFY pgrst, 'reload schema';
