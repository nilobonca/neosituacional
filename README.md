# 🏢 NeoSituacional - Plataforma de Administração Condominial

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Storage-3ECF8E?logo=supabase)](https://supabase.com/)

**NeoSituacional** é uma solução completa e moderna para **Administração Condominial**, oferecendo um portal público elegante para divulgação institucional, captação de clientes e fornecedores, uma **Área do Cliente** intuitiva para condomínios e condôminos, e um poderoso **Painel Administrativo (CMS)** para gestão integral de conteúdos, propostas e serviços.

---

## 📌 Sumário

- [Visão Geral e Módulos](#-visão-geral-e-módulos)
  - [1. Portal Público](#1-portal-público)
  - [2. Área do Cliente](#2-área-do-cliente)
  - [3. Painel Administrativo (CMS)](#3-painel-administrativo-cms)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Executar o Projeto](#-como-executar-o-projeto)
  - [Pré-requisitos](#pré-requisitos)
  - [Passo a Passo](#passo-a-passo)
- [Configuração do Banco de Dados (Supabase)](#-configuração-do-banco-de-dados-supabase)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Licença](#-licença)

---

## 🚀 Visão Geral e Módulos

O ecossistema NeoSituacional está estruturado em três grandes áreas operacionais:

### 1. Portal Público
- **Home (`/`)**: Apresentação da administradora, carrossel de parceiros/clientes, destaque de serviços, depoimentos de clientes e formulários de contato/ajuda.
- **Quem Somos (`/quem-somos`)**: História, missão, visão, valores e diferenciais da administradora.
- **Serviços (`/servicos`)**: Apresentação detalhada dos serviços prestados (Gestão Financeira, Assessoria Jurídica, Manutenção e Obras, Comunicação e Portal, Gestão de Pessoas, Segurança).
- **Blog (`/blog`, `/blog/:id`)**: Artigos informativos e novidades da área condominial, com busca, filtros por categoria, tags e tempo de leitura.
- **Solicitação de Proposta (`/proposta`)**: Formulário interativo para condomínios solicitarem cotações de administração.
- **Trabalhe Conosco / Carreiras (`/carreiras`)**: Mural de vagas e cadastro de currículos.
- **Portal de Fornecedores (`/fornecedores`)**: Cadastro e homologação de prestadores de serviço.
- **Feedback & Avaliações (`/feedback`)**: Envio de depoimentos e sugestões por moradores e síndicos.

### 2. Área do Cliente (`/area-cliente`)
- **Autenticação**: Login, cadastro, recuperação e redefinição de senha (`/area-cliente/login`, `/area-cliente/cadastro`, etc.).
- **Dashboard Condominial (`/area-cliente`)**: Visão consolidada para o síndico e moradores acompanharem informativos, comunicados e solicitações.
- **Guia de Fornecedores Homologados (`/area-cliente/fornecedores`)**: Consulta direta a fornecedores parceiros recomendados pela administradora.

### 3. Painel Administrativo - CMS (`/admin`)
- **Autenticação Admin (`/admin/login`)**: Acesso restrito para gerentes e gestores do site.
- **Dashboard (`/admin`)**: Indicadores gerais e resumo de atividades.
- **Editor de Blog (`/admin/blog`)**: Gestão de artigos usando editor WYSIWYG/Blocos rico ([BlockNote](https://www.blocknotejs.org/)) com suporte a upload de imagens via Supabase Storage.
- **Gestão de Serviços (`/admin/services`)**: Inclusão e personalização de serviços, ícones e tópicos.
- **Gestão de Clientes & Depoimentos (`/admin/clients`, `/admin/testimonials`)**: Aprovação e publicação de parceiros e avaliações na homepage.
- **Gestão de Propostas e Fornecedores (`/admin/proposals`, `/admin/suppliers`)**: Acompanhamento e triagem de propostas recebidas e cadastros de parceiros.
- **Gestão de Vagas (`/admin/careers`)**: Publicação e gerenciamento de oportunidades de trabalho.
- **Configurações Gerais (`/admin/settings`)**: Edição dos dados de rodapé, redes sociais e itens do carrossel.

---

## 🛠 Tecnologias Utilizadas

### Frontend
- **[React 18](https://react.dev/)**: Biblioteca principal de UI.
- **[TypeScript](https://www.typescriptlang.org/)**: Tipagem estática para maior segurança no desenvolvimento.
- **[Vite](https://vitejs.dev/)**: Build tool ultrarrápido para desenvolvimento frontend.
- **[React Router v7](https://reactrouter.com/)**: Roteamento declarativo de páginas e layouts aninhados.
- **[Tailwind CSS v4](https://tailwindcss.com/)**: Framework CSS utilitário de alta performance.
- **[Radix UI](https://www.radix-ui.com/)**: Primitivas acessíveis de UI (Modais, Dialogs, Dropdowns, Tabs, etc.).
- **[Lucide React](https://lucide.dev/)**: Biblioteca moderna de ícones vetoriais.
- **[BlockNote](https://www.blocknotejs.org/)**: Editor de texto em bloco extensível baseado em ProseMirror/TipTap.
- **[Framer Motion / Motion](https://motion.dev/)**: Animações fluídas para interface.
- **[Sonner](https://sonner.emilkowal.ski/)**: Sistema de notificações (Toast).

### Backend & Banco de Dados
- **[Supabase](https://supabase.com/)**: Backend-as-a-Service integrado fornecendo:
  - Banco de dados **PostgreSQL** com Row Level Security (RLS).
  - **Storage** para armazenamento público e seguro de imagens.

---

## 📁 Estrutura do Projeto

```text
neosituacional/
├── public/                 # Arquivos estáticos públicos
├── src/
│   ├── app/
│   │   ├── components/     # Componentes reutilizáveis (Header, Footer, BlockEditor, ImagePicker, UI Primitives)
│   │   ├── data/           # Dados de fallback e mock Data (mockData.ts)
│   │   ├── layouts/        # Layouts de página (AdminLayout, CondoLayout)
│   │   ├── pages/          # Páginas públicas, administrativas e de clientes
│   │   ├── routes.ts       # Configuração de rotas da aplicação (React Router)
│   │   └── App.tsx         # Componente raiz com o RouterProvider
│   ├── graphics/           # Vetores e ilustrações
│   ├── lib/
│   │   ├── supabase.ts     # Cliente de conexão com o Supabase
│   │   └── supabase_schema.sql # Script DDL de criação das tabelas e políticas RLS
│   ├── styles/             # Estilos globais e CSS personalizado
│   └── main.tsx            # Ponto de entrada da aplicação React
├── supabase/               # Migrações e configurações do Supabase
├── .env                    # Variáveis de ambiente (URL e Anon Key do Supabase)
├── index.html              # HTML base da aplicação
├── package.json            # Dependências e scripts do projeto
├── vite.config.ts          # Configurações do Vite
└── README.md               # Documentação do projeto
```

---

## 💻 Como Executar o Projeto

### Pré-requisitos

Certifique-se de ter instalado em sua máquina:
- **Node.js** (versão 18.x ou superior)
- Gerenciador de pacotes **npm**, **pnpm** ou **yarn**

### Passo a Passo

1. **Clonar o repositório ou acessar a pasta do projeto:**
   ```bash
   cd neosituacional
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Configurar as variáveis de ambiente:**
   Crie ou edite o arquivo `.env` na raiz do projeto informando as credenciais do seu projeto no Supabase:
   ```env
   VITE_SUPABASE_URL=https://seusupabase.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
   ```

4. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acessar no navegador:**
   Abra [http://localhost:5173](http://localhost:5173) no seu navegador.

---

## 📜 Scripts Disponíveis

No arquivo `package.json`, os principais scripts configurados são:

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor local de desenvolvimento com Hot Module Replacement (Vite). |
| `npm run build` | Compila os arquivos para produção na pasta `dist/`. |

---

## 📝 Licença

Projeto desenvolvido para a **NeoSituacional - Administração Condominial**. Todos os direitos reservados.