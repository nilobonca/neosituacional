-- ==========================================
-- SCRIPT PARA CONFIGURAÇÃO DO SUPABASE
-- ==========================================

-- 1. TABELA DE POSTS DO BLOG
-- ==========================================
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  image text,
  date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  author text NOT NULL,
  category text NOT NULL,
  views integer DEFAULT 0,
  reading_time text,
  featured boolean DEFAULT false,
  tags text[] DEFAULT '{}'
);

-- Habilitar RLS na tabela de posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Políticas temporárias para permitir DELEÇÃO, EDIÇÃO e CRIAÇÃO pública
-- IMPORTANTE: Para ambiente de produção, modifique para permitir apenas usuários autenticados (Admin)
CREATE POLICY "Permitir leitura pública" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública" ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública" ON public.posts FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão pública" ON public.posts FOR DELETE USING (true);


-- 2. BUCKET DE IMAGENS DO BLOG (STORAGE)
-- ==========================================
-- A criação de buckets e políticas de armazenamento via console SQL frequentemente falha por conta de permissões (Erro 42501).
-- Sendo assim, crie o bucket e as políticas de acesso manualmente:
-- 1. Vá na aba "Storage" no painel do Supabase.
-- 2. Clique em "New bucket".
-- 3. Nomeie como: blog-images
-- 4. Marque a caixa "Public bucket" e clique em Save.
-- 5. Vá em "Policies" (no menu lateral de Storage) e adicione políticas para permitir "SELECT", "INSERT" e "DELETE" para o "blog-images" para que o seu app consiga subir os arquivos.


-- ==========================================
-- SESSÃO DE ADMINISTRAÇÃO AVANÇADA DO SITE
-- ==========================================

-- 3. TABELA DE CLIENTES E PARCEIROS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  logo_url text NOT NULL,
  website_url text,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura pública clientes" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública clientes" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública clientes" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão pública clientes" ON public.clients FOR DELETE USING (true);


-- 4. TABELA DE DEPOIMENTOS (FEEDBACKS)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text,
  content text NOT NULL,
  avatar_url text,
  show_on_home boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura pública depoimentos" ON public.testimonials FOR SELECT USING (true);
-- Permite que usuários enviem feedbacks pela home pública
CREATE POLICY "Permitir inserção pública depoimentos" ON public.testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública depoimentos" ON public.testimonials FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão pública depoimentos" ON public.testimonials FOR DELETE USING (true);


-- 5. TABELA DE CONFIGURAÇÕES GERAIS (Ex: Footer, Carrossel)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura pública settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública settings" ON public.site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública settings" ON public.site_settings FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão pública settings" ON public.site_settings FOR DELETE USING (true);

-- Inserindo configuração padrão do Footer para evitar tela em branco
INSERT INTO public.site_settings (key, value)
VALUES (
  'footer', 
  '{"address": "Rua Exemplo, 123", "phone": "(11) 9999-9999", "email": "contato@neosituacional.com.br", "facebook": "", "instagram": "", "linkedin": ""}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Inserindo configuração padrão do Carrossel 
INSERT INTO public.site_settings (key, value)
VALUES (
  'carousel', 
  '{"items": []}'::jsonb
)
ON CONFLICT (key) DO NOTHING;


-- 6. TABELA DE SERVIÇOS (Página de Serviços)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  icon text,
  features text[] DEFAULT '{}',
  active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura pública serviços" ON public.services FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública serviços" ON public.services FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública serviços" ON public.services FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão pública serviços" ON public.services FOR DELETE USING (true);

-- Dados iniciais (Opcional - para não deixar a página vazia)
INSERT INTO public.services (title, description, icon, features, order_index)
VALUES 
  ('Gestão Financeira', 'Administração completa das finanças do condomínio com transparência e eficiência.', 'Wallet', ARRAY['Controle de receitas e despesas', 'Emissão de boletos', 'Relatórios financeiros mensais', 'Planejamento orçamentário'], 1),
  ('Assessoria Jurídica', 'Suporte legal especializado para todas as questões condominiais.', 'Scale', ARRAY['Consultoria jurídica permanente', 'Elaboração de contratos', 'Representação em assembleias', 'Cobrança judicial'], 2),
  ('Manutenção e Obras', 'Gestão de manutenções preventivas e corretivas com equipe especializada.', 'Wrench', ARRAY['Manutenção preventiva programada', 'Gestão de obras e reformas', 'Controle de prestadores de serviço', 'Inspeções técnicas regulares'], 3),
  ('Comunicação e Portal', 'Plataforma digital para facilitar a comunicação entre administração e moradores.', 'MessageSquare', ARRAY['Portal do condômino', 'Aplicativo mobile', 'Avisos e comunicados digitais', 'Reserva de áreas comuns online'], 4),
  ('Gestão de Pessoas', 'Administração completa de funcionários e prestadores de serviço.', 'Users', ARRAY['Gestão de folha de pagamento', 'Controle de ponto eletrônico', 'Recrutamento e seleção', 'Treinamentos periódicos'], 5),
  ('Segurança e Controle', 'Sistemas e protocolos de segurança para proteção do condomínio.', 'Shield', ARRAY['Gestão de controle de acesso', 'Monitoramento de CFTV', 'Protocolos de emergência', 'Vistorias de segurança'], 6);

