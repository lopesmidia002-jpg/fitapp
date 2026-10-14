# FITCORE PRO — TAREFAS E PROGRESSO (task.md)

## Checklist das 12 Fases de Implementação

- [x] **Inspeção do Workspace**
  - [x] Verificar Node.js (`v24.20.0`), npm (`11.19.0`) e diretório
  - [x] Criar arquivos solicitados pelo usuário: `DOCUMENTAÇÃO.md`, `PASSOS.md`, `PROMPT.md`, `CONTEXTO.md`
  - [x] Confirmar versão do Tailwind CSS (Tailwind v3.4 com usuário)

- [x] **FASE 1: Design System & Fundação UI**
  - [x] Inicializar projeto Vite + React 19 + TypeScript
  - [x] Instalar Tailwind CSS v3.4, PostCSS, Autoprefixer, Lucide React, Recharts, clsx, tailwind-merge
  - [x] Configurar `tailwind.config.js` com os tokens exatos do design system:
    - Fundo principal: `#0B0D10`
    - Superfície: `#14171C`
    - Cards: `#1B2027`
    - Verde destaque: `#B8F34A`
    - Texto principal: `#F5F7FA`
    - Texto secundário: `#9AA3AF`
    - Bordas: `#292F38`
  - [x] Implementar componentes atômicos em `src/components/ui`:
    - `Button` (variantes: default neon, secondary, outline, ghost, danger)
    - `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardDescription`, `CardFooter`
    - `Input` com suporte a ícones, rótulos e estados de erro
    - `Modal` / `Dialog` com backdrop blur e tecla ESC
    - `Badge` (status: primary, success, warning, danger, neutral)
    - `Select` estilizado com chevron
    - `Tabs` com contadores de badge
    - `MetricCard` com indicadores de tendência percentual
    - `EmptyState` e `LoadingSpinner`
    - `ThemeToggle` (Tema Escuro padrão e Tema Claro alternativo)

- [x] **FASE 2: Estrutura da Aplicação, Rotas, Auth e Onboarding**
  - [x] Criar `AppContext` com gerenciamento de múltiplos papéis (`pro`, `student`, `superadmin`)
  - [x] Implementar seletor dinâmico de perfil na barra superior para alternância em tempo real
  - [x] Header com contador de notificações e avatar do usuário
  - [x] Sidebar retrátil e responsiva para Treinador e Administrador

- [x] **FASE 3: Banco de Dados, Multi-Tenancy e Permissões**
  - [x] Script DDL / Migrations em `supabase/migrations/20261014_init_fitcore_schema.sql`
  - [x] 12 entidades relacionais com chaves estrangeiras e índices
  - [x] Políticas de Row Level Security (RLS) para isolamento por `organization_id`
  - [x] Estrutura de auditoria compatível com LGPD

- [x] **FASE 4: Cadastro de Alunos e Dashboard Pro**
  - [x] CRM de alunos com busca textual e filtros de status (Ativo, Inativo, Arquivado)
  - [x] Exportação de listagem de alunos para CSV
  - [x] Modal 360° do aluno com histórico, métricas e notas clínicas restritas
  - [x] Dashboard do Treinador com KPIs reais (Total de alunos, adesão média, MRR, alertas)
  - [x] Gráficos Recharts (Volume de treinos semanais em BarChart e Crescimento em AreaChart)

- [x] **FASE 5: Biblioteca de Exercícios e Módulo de Treinos**
  - [x] Catálogo de exercícios filtrável por grupo muscular e equipamento
  - [x] Modal de cadastro de novos exercícios com orientações e contraindicações
  - [x] Construtor de programas de treino com séries, repetições, carga e intervalos
  - [x] Atribuição de programas a alunos com cálculo de validade

- [x] **FASE 6: Alimentação e Diário Alimentar**
  - [x] Módulo nutricional com distribuição de macronutrientes (Proteínas, Carboidratos, Gorduras)
  - [x] Metas de hidratação diária (ml)
  - [x] Estrutura de refeições por horário com cálculo calórico individualizado
  - [x] Aviso ético sobre elaboração por profissionais habilitados

- [x] **FASE 7: Avaliações, Evolução, Metas e Check-ins**
  - [x] Ficha antropométrica completa (peso, % de gordura, circunferências)
  - [x] Gráficos de evolução física Recharts (Peso vs % de gordura vs Cintura)
  - [x] Check-ins periódicos com níveis de energia, sono, dieta e parecer do treinador
  - [x] Metas gamificadas com barra de progresso dinâmico

- [x] **FASE 8: Insights e Notificações**
  - [x] Motor determinístico FITCORE Insights (risco de churn, avaliação vencendo, marcos de treino)
  - [x] Ações sugeridas e botão de resolução de alertas
  - [x] Assistente de comunicação FITCORE AI para rascunho de mensagens personalizadas
  - [x] Central de notificações com marcação de leitura

- [x] **FASE 9: Planos SaaS e Pagamentos**
  - [x] Planos comerciais STARTER (R$89), PRO (R$179) e BUSINESS (R$349)
  - [x] Barra de medição de capacidade e cota da conta (alunos ativos vs limite)
  - [x] Modal de checkout e upgrade de plano com cálculo dinâmico
  - [x] Histórico de faturas com status de pagamento

- [x] **FASE 10: Painel do Superadministrador**
  - [x] Visão global de todas as organizações da plataforma
  - [x] Métricas financeiras SaaS (MRR global, total de alunos na rede)
  - [x] Tabela de auditoria de segurança com registros imutáveis e IPs

- [x] **FASE 11: PWA e Experiência Mobile**
  - [x] `manifest.webmanifest` com ícones, tema `#0B0D10` e modo standalone
  - [x] Service Worker `sw.js` com cache seguro de recursos estáticos
  - [x] Visão Mobile-First do Aluno com navegação inferior (Início, Treinos, Alimentação, Evolução, Perfil)
  - [x] Player de treino interativo com checklist de séries e timer de descanso em contagem regressiva

- [x] **FASE 12: Testes, Correções e Documentação de Implantação**
  - [x] Testes unitários automatizados com Vitest
  - [x] Documentação técnica completa em `DOCUMENTAÇÃO.md`, `PASSOS.md`, `PROMPT.md`, `CONTEXTO.md`, `architecture.md`, `implementation_plan.md` e `.env.example`
