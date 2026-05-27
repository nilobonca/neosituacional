-- ==========================================
-- Gatilho de Atribuição Automática de Cargos
-- ==========================================

-- Função que será executada automaticamente após uma conta ser criada
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insere o novo usuário na tabela user_roles como 'sindico'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'sindico');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove o gatilho caso já exista (para evitar erros ao rodar o script novamente)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Cria o gatilho (Trigger) que escuta a tabela auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

/*
========================================================================
COMO ISSO FUNCIONA:
========================================================================

A partir do momento em que você rodar este script, **QUALQUER** conta nova 
criada no seu sistema (seja pela tela pública de "Cadastre seu condomínio" 
ou seja você criando manualmente pelo painel do Supabase) receberá 
imediatamente o cargo de "sindico".

Como o seu painel Admin verifica se o usuário tem especificamente o cargo 
de "admin", essas novas contas nunca conseguirão acessar a rota /admin.

Eles ficarão presos à rota /area-cliente.
========================================================================
*/
