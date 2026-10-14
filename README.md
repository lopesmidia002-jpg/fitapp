# OMEGA TRAINING — Plataforma SaaS Fitness Multi-Tenant de Alto Desempenho

![Omega Training](https://img.shields.io/badge/Omega%20Training-SaaS%20Fitness-brightgreen?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-100%25%20Containerized-blue?style=for-the-badge&logo=docker)
![React](https://img.shields.io/badge/React-19%20%7C%20TypeScript-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-Build%20Fast-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS%203.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20Alpine-336791?style=for-the-badge&logo=postgresql)
![Tests](https://img.shields.io/badge/Vitest-48%20Passing-success?style=for-the-badge&logo=vitest)

O **Omega Training** é uma plataforma SaaS completa voltada para personal trainers, consultorias esportivas, academias e nutricionistas, integrando PWA mobile-first para alunos, console administrativo para treinadores e painel mestre de Superadministrador para governança multi-tenant.

---

## 📑 Sumário

- [Visão Geral](#-visão-geral)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Execução 100% no Docker](#-execução-100-no-docker-recomendado)
- [Execução Local (Desenvolvimento)](#-execução-local-desenvolvimento)
- [Credenciais e Acessos](#-credenciais-e-acessos)
- [Módulos da Plataforma](#-módulos-da-plataforma)
- [Biblioteca Cardio & Ergômetros](#-biblioteca-cardio--ergômetros)
- [Suíte de Testes Automatizados](#-suíte-de-testes-automatizados)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Documentação Complementar](#-documentação-complementar)

---

## 🌟 Visão Geral

A plataforma foi desenhada com foco em experiência mobile e desktop premium:
- **Tema Dark Nativo:** Design esportivo sofisticado com fundo `#0B0D10`, cartões `#13171F` e acentos voltados à performance (`#B8F34A`), livre de alternâncias visuais indesejadas.
- **Isolamento Multi-Tenant:** Cada academia ou treinador opera sua organização de forma independente, com limites configuráveis de alunos e planos SaaS.
- **Mobile First & PWA:** Totalmente adaptado para smartphones, com botões protegidos contra quebra de texto, caixas de diálogo responsivas e ausência de scrolls laterais desnecessários.
- **Proteção e Governança:** Painel Superadmin protegido por autenticação segura com senha mestre.

---

## 🚀 Execução 100% no Docker (Recomendado)

A aplicação conta com orquestração completa em **Docker Compose**, executando o frontend compilado em Nginx de alta performance e um banco de dados PostgreSQL 16 pré-configurado.

### Pré-requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e em execução.

### Subir a Aplicação

Basta executar na raiz do projeto:

```powershell
docker compose up -d --build
```

O comando irá:
1. Compilar o frontend com Node 22 e empacotar no servidor Nginx ultraleve (`fitapp-app`).
2. Inicializar o banco de dados PostgreSQL 16 (`omega_training_db`).
3. Executar automaticamente o script [`docker/init-db.sql`](docker/init-db.sql), criando todas as 9 tabelas relacionais com dados e usuário de demonstração inicial.

### Endereços de Acesso

| Serviço | URL / Host | Porta | Descrição |
| :--- | :--- | :--- | :--- |
| **Aplicação Web (Nginx)** | [http://localhost:5173](http://localhost:5173) | `5173` | Porta padrão Vite/Nginx |
| **Aplicação Web (Alternativa)** | [http://localhost:3000](http://localhost:3000) | `3000` | Porta alternativa padrão web |
| **Banco PostgreSQL** | `localhost` | `5432` | Banco `omegatraining`, user `postgres` |

### Comandos de Gestão Docker

- **Ver status dos contêineres e health checks:**
  ```powershell
  docker compose ps
  ```
- **Acompanhar logs:**
  ```powershell
  docker compose logs -f
  ```
- **Parar todos os serviços:**
  ```powershell
  docker compose down
  ```
- **Acessar o banco de dados via terminal:**
  ```powershell
  docker compose exec -it postgres psql -U postgres -d omegatraining
  ```

---

## 💻 Execução Local (Desenvolvimento)

Caso deseje rodar a aplicação no ambiente local sem Docker:

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
cp .env.example .env
```

### 3. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse em: `http://localhost:5173`

### 4. Build de Produção
```bash
npm run build
```

---

## 🔐 Credenciais e Acessos

### Painel Superadmin (Administração Geral)
- **Como acessar:** No cabeçalho superior direito, selecione o perfil **Admin**.
- **Senha padrão:** `admin123`
- *Dica:* O modal conta com botão de "Preenchimento Rápido" para demonstração e teste imediato.
- **Redefinição:** Dentro do painel Superadmin, na aba **Configurações**, é possível consultar e alterar a senha de acesso a qualquer momento.

---

## 📱 Módulos da Plataforma

1. **Área do Aluno (PWA):**
   - Check-in de treino rápido.
   - Execução de treinos com cronômetro, séries, repetições e cargas.
   - Visualização de planos alimentares, metas de macronutrientes e hidratação.
   - Histórico de avaliações físicas e evolução antropométrica.

2. **Área do Treinador / Consultoria:**
   - Gestão de alunos ativos, inativos e limites do plano.
   - Montagem de fichas de treino personalizadas.
   - Prescrição nutricional com controle de visibilidade (ocultação de dieta opcional).
   - Avaliações físicas (peso, dobras, circunferências corporais).

3. **Painel do Superadministrador:**
   - **Visão Geral:** Métricas SaaS (MRR, Tenants ativos, Alunos totais).
   - **Tenants:** Criação, edição, bloqueio e auditoria de academias/organizações.
   - **Planos SaaS:** Gestão de limites de alunos e preços dos planos.
   - **Configurações:** Segurança, parâmetros da plataforma e alteração da senha mestre.
   - *Mobile:* Grade 2x2 com acesso direto a todas as seções sem menus laterais cortados.

---

## 🏃 Biblioteca Cardio & Ergômetros

No menu **Treinos**, a categoria **Cardio** oferece suporte completo aos principais ergômetros de academia, incluindo:

| Ergômetro | Foco | Equipamento |
| :--- | :--- | :--- |
| **Esteira Elétrica** | Corrida contínua e treinos HIIT | Esteira ergométrica profissional |
| **Esteira com Inclinação** | Condicionamento metabólico e glúteos | Esteira com ajuste de rampa de 8% a 15% |
| **Bicicleta Ergométrica** | Resistência cardiovascular com baixo impacto | Bike vertical com assento ergonômico |
| **Bike de Spinning** | Ciclismo indoor de alta intensidade | Bicicleta de spinning com roda de inércia |
| **Elíptico (Transport)** | Treino metabólico sem impacto articular | Aparelho elíptico com manoplas móveis |
| **Simulador de Escada** | Alta demanda calórica e força de membros inferiores | Stairmaster / Simulador de degraus contínuos |
| **Remo Seco (Air Rower)** | Potência aeróbica e condicionamento de corpo inteiro | Máquina de remo ergométrico a ar |

Cada exercício apresenta:
- 📋 **Equipamentos necessários** especificados detalhadamente.
- 🎯 **Instruções biomecânicas de execução** passo a passo.
- ⚠️ **Cuidados posturais e ergonômicos essenciais** (posicionamento de coluna, quadril, joelhos e respiração).

---

## 🧪 Suíte de Testes Automatizados

O projeto conta com testes unitários e de integração desenvolvidos com **Vitest** cobrindo todas as regras de negócio críticas:

```bash
npm test
```

### Resultados dos Testes:
```
✓ src/tests/trainersAdmin.test.ts (6 tests)
✓ src/tests/saasLimits.test.ts (2 tests)
✓ src/tests/studentAccess.test.ts (6 tests)
✓ src/tests/anthropometry.test.ts (7 tests)
✓ src/tests/formatters.test.ts (1 test)
✓ src/tests/themeToggle.test.ts (6 tests)
✓ src/tests/superadminNav.test.ts (3 tests)
✓ src/tests/insightsEngine.test.ts (1 test)
✓ src/tests/adminAuth.test.ts (5 tests)
✓ src/tests/dietVisibility.test.ts (3 tests)
✓ src/tests/exerciseVideos.test.ts (8 tests)

Test Files  11 passed (11)
     Tests  48 passed (48)
```

---

## 📂 Estrutura do Projeto

```
Fitapp/
├── .github/                # Configurações de CI/CD (se aplicável)
├── docker/
│   └── init-db.sql         # Script SQL inicial de tabelas, extensões e seeds
├── public/                 # Favicons, ícones do PWA e assets estáticos
├── src/
│   ├── components/         # Componentes UI reutilizáveis (Layout, Modais, Cards)
│   │   ├── auth/           # Modais de login e autenticação de segurança
│   │   ├── layout/         # Header, Sidebar, BottomNav
│   │   └── ui/             # Botões, diálogos, tabelas, inputs
│   ├── context/            # Estado global (AppContext: Auth, Dados, Treinos)
│   ├── data/               # Dados mockados, biblioteca de exercícios e seed
│   ├── modules/            # Módulos centrais da plataforma
│   │   ├── student/        # Área do Aluno (PWA)
│   │   ├── trainer/        # Painel do Treinador (Prescrições, Alunos, Avaliações)
│   │   └── superadmin/     # Painel Master Multi-Tenant (Tenants, Planos, Métricas)
│   ├── tests/              # Suíte de testes com Vitest
│   ├── types/              # Interfaces e tipos TypeScript
│   ├── App.tsx             # Componente raiz com roteamento e guards
│   ├── main.tsx            # Ponto de entrada React 19
│   └── index.css           # Estilos globais e tokens Tailwind CSS
├── .dockerignore           # Exclusões de build Docker
├── .gitignore              # Regras de versionamento Git
├── Dockerfile              # Construção multi-stage da imagem da aplicação
├── docker-compose.yml      # Orquestrador do container Nginx e PostgreSQL
├── nginx.conf              # Configuração Nginx com suporte a SPA e Gzip
├── package.json            # Scripts e dependências do projeto
├── PASSOS.md               # Histórico detalhado de todas as 26 fases de desenvolvimento
└── README.md               # Este documento de apresentação
```

---

## 📚 Documentação Complementar

- [PASSOS.md](PASSOS.md): Histórico completo de desenvolvimento e validações das 26 fases.
- [DOCUMENTAÇÃO.md](DOCUMENTAÇÃO.md): Especificação de banco de dados, regras LGPD e segurança.
- [PROMPT.md](PROMPT.md): Requisitos originais do projeto e diretrizes de produto.
- [architecture.md](architecture.md): Diagrama arquitetural e fluxos de dados.

---

© 2026 **Omega Training**. Todos os direitos reservados.
