# PLANO DE IMPLEMENTAÇÃO — FITCORE PRO

## Visão Geral
Este documento define o plano arquitetural e de engenharia para o desenvolvimento do **FITCORE PRO**, SaaS fitness multi-tenant com foco em experiência mobile e desktop de alto impacto estético e funcional.

## Arquitetura de Fases

### Fase 1: Fundação do Design System & Identidade Visual
- Configuração do Tailwind CSS v3.4 com tokens exatos:
  - Background principal: `#0B0D10`
  - Superfície: `#14171C`
  - Cards: `#1B2027`
  - Acento verde neon: `#B8F34A`
  - Texto principal: `#F5F7FA`
  - Texto secundário: `#9AA3AF`
  - Bordas: `#292F38`
- Componentes atômicos:
  - Botões com variantes (Primário Neon com glow sutil, Secundário, Outline, Danger)
  - Cards com bordas sutis e fundo `#1B2027`
  - Inputs, Seletores e Modais responsivos com foco e acessibilidade
  - Badges de status (Ativo, Pendente, Atrasado, Concluído)
  - Indicadores e Cards de Métricas com percentual de variação
  - Suporte a alternância de tema Escuro / Claro
- Validação no navegador e testes de renderização.

### Fase 2: Estrutura da Aplicação, Rotas e Autenticação
- Roteamento completo com `react-router-dom`:
  - Rotas públicas: Landing promocional, Login, Registro, Recuperação de senha
  - Rotas autenticadas do Profissional / Dono de Org: `/dashboard`, `/students`, `/workouts`, `/nutrition`, `/assessments`, `/checkins`, `/insights`, `/billing`, `/settings`
  - Rotas autenticadas do Aluno (PWA Mobile): `/app`, `/app/workouts`, `/app/nutrition`, `/app/progress`, `/app/profile`
  - Rotas do Superadministrador: `/superadmin`, `/superadmin/organizations`, `/superadmin/plans`, `/superadmin/audit`
- Mecanismo de Auth Mock com troca instantânea de papéis para desenvolvimento/demo e conexão com Supabase Auth.

### Fase 3: Banco de Dados, Multi-Tenancy e Permissões (PostgreSQL / Supabase)
- Script DDL / Migrations com RLS (Row Level Security) completo:
  - `organizations`, `profiles`, `organization_members`
  - `students`, `exercises`, `workout_plans`, `workout_sessions`, `exercise_logs`
  - `nutrition_plans`, `food_diary`, `physical_assessments`, `goals`, `checkins`
  - `insights`, `notifications`, `subscriptions`, `invoices`, `audit_logs`
- Isolamento por `organization_id` em consultas e inserções.

### Fase 4: Gestão de Alunos (CRM) e Dashboard do Profissional
- CRM com paginação, filtros (Ativo, Em pausa, Em atraso, Novo), busca rápida e tags.
- Importação de alunos via CSV e exportação segura.
- Perfil 360° do aluno integrando treinos, dieta, histórico de avaliações e observações clínicas restritas.
- Dashboard com KPIs calculados (Alunos ativos, novos no mês, treinos concluídos, taxa de adesão, MRR real) e gráficos interativos com Recharts.

### Fase 5: Módulo de Treinos e Biblioteca de Exercícios
- Catálogo com mais de 50 exercícios cadastrados previamente com grupo muscular, equipamento, orientações de execução e cuidados.
- Editor de programas de treino (divisão A/B/C/Fullbody, séries, repetições, carga, descanso, notas).
- Área do Aluno: Player de treino interativo com cronômetro de descanso em tempo real, registro de repetições/cargas realizadas e conclusão de sessão.

### Fase 6: Módulo Nutricional e Diário Alimentar
- Montador de planos alimentares com cálculo estimado de calorias e distribuição de macronutrientes (Proteínas, Carboidratos, Gorduras).
- Diário alimentar interativo para o aluno registrar refeições, fotos do prato, ingestão de água e observações.

### Fase 7: Avaliações Físicas, Metas e Check-ins
- Ficha de avaliação física: medidas (tórax, cintura, quadril, braços, coxas), dobras cutâneas e peso.
- Gráficos comparativos de evolução corporal.
- Formulários periódicos de check-in com perguntas personalizadas e acompanhamento de adesão.

### Fase 8: Motor de Insights Inteligentes e Central de Notificações
- Regras determinísticas:
  - Aluno sem treino há mais de 7 dias
  - Check-in pendente de resposta
  - Avaliação física vencendo
  - Frequência em queda (> 30% em relação ao histórico)
- Central de notificações com status de leitura e ações rápidas.

### Fase 9: Planos SaaS e Pagamentos
- Três planos: STARTER, PRO e BUSINESS com limites e benefícios configuráveis.
- Tela de checkout e gestão de faturamento.
- Estrutura pronta para webhooks de pagamento (Stripe / Mercado Pago) com validação de status e idempotência.

### Fase 10: Painel do Superadministrador
- Visão agregada de todas as organizações e usuários.
- Métricas financeiras globais (ARR, MRR, churn, volume de treinos na plataforma).
- Configuração de planos globais e logs de auditoria.

### Fase 11: PWA e Experiência Mobile do Aluno
- `manifest.webmanifest`, ícones e Service Worker com cache para operação ágil e offline seguro da interface.
- Layout Mobile-First com Bottom Navigation e ações em poucos toques.

### Fase 12: Testes Automatizados e Documentação Final
- Testes unitários com Vitest para regras críticas (cálculo de métricas, limites de planos, motor de insights).
- Documentação de deploy e `.env.example`.
