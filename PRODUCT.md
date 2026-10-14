# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Personal trainers, consultores fitness independentes e gestores de studios de treinamento que precisam prescrever treinos, dietas, acompanhar avaliações físicas e cobrar mensalidades de alunos sem fragmentação. Secundariamente, alunos e atletas atendidos por esses profissionais que utilizam a interface mobile para executar treinos, registrar alimentação e check-ins.

## Product Purpose
O FITCORE PRO é uma plataforma SaaS B2B/B2C desenvolvida para transformar a consultoria fitness e a operação de studios, reunindo gestão comercial, montagem ágil de treinos, planejamento nutricional, acompanhamento antropométrico e retenção inteligente de alunos em um único ambiente de alta performance.

## Positioning
Diferente de planilhas dispersas ou aplicativos genéricos de academia focados apenas em cronômetro, o FITCORE PRO combina multi-tenancy rigoroso com isolamento RLS, motor determinístico de retenção (detecção proativa de risco de churn e evasão) e experiência PWA mobile-first que empodera tanto o treinador na gestão quanto o aluno na consistência diária.

## Operating Context
- Treinador/Coach: Utiliza em desktop/tablet para gerenciar carteira de alunos, criar e versionar fichas de treino (divisões A/B/C/Fullbody), prescrever macronutrientes, analisar gráficos de evolução física e responder check-ins.
- Aluno: Utiliza prioritariamente em smartphone (PWA instalável) no ambiente da academia para seguir o treino do dia, dar check em séries, disparar timer de descanso e registrar hábitos/hidratação.
- Gestor/Superadmin: Painel administrativo para acompanhamento do MRR global da plataforma SaaS, organizações ativas e logs de segurança.

## Capabilities and Constraints
- Multi-tenancy absoluto com chave `organization_id` e políticas de Row Level Security (RLS) no PostgreSQL/Supabase.
- Fichas de treino com séries, repetições, intervalos de descanso com timer regressivo e carga.
- Planos alimentares com divisão de macronutrientes (Proteínas, Carboidratos, Gorduras) e hidratação.
- Avaliações físicas antropométricas (Pollock 7 Dobras, Bioimpedância) e gráficos de evolução temporal.
- Motor FITCORE Insights com regras determinísticas para identificar alunos inativos (> 7 dias) e avaliações a vencer.
- Modelo comercial SaaS em 3 planos: STARTER (15 alunos), PRO (50 alunos) e BUSINESS (200 alunos).
- Restrição ética e LGPD: Não prescrever condutas médicas/clínicas automáticas sem intervenção profissional; fotos e notas anamnese protegidas em storage privado.

## Brand Commitments
- Nome provisório: FITCORE PRO.
- Tom de voz: Profissional, energizante, de alta performance e rigor técnico.
- Identidade visual estabelecida: Paleta escura premium (`#0B0D10` background, `#14171C` superfície, `#1B2027` cards) com acento neon dinâmico (`#B8F34A`) e tipografia moderna (Inter/Manrope).

## Evidence on Hand
- Código-fonte funcional em React 19 + TypeScript + Vite.
- Design System completo implementado em `src/components/ui/`.
- Migração DDL PostgreSQL em `supabase/migrations/20261014_init_fitcore_schema.sql`.
- Suíte de testes unitários Vitest 100% aprovada (`src/tests/`).
- Service Worker e manifesto PWA em `public/`.

## Product Principles
1. Consistência e Velocidade: Ações rotineiras do treinador (prescrição) e do aluno (marcação de série) devem ser executadas com o menor número de cliques possível.
2. Isolamento e Integridade: Nenhum dado de aluno ou métrica financeira de uma organização pode ser exposto a outra.
3. Retenção Ativa: Antecipar desmotivação e evasão antes que o aluno cancele o plano.
4. Clareza e Transparência: Sem números fictícios ou métricas maquiadas; dados reais e auditáveis.

## Accessibility & Inclusion
- Alto contraste entre texto (`#F5F7FA`) e fundo escuro (`#0B0D10`).
- Foco acessível via teclado em botões e modais com trap de foco e suporte a ESC.
- Suporte a tema claro alternativo para usuários com sensibilidade a interfaces escuras.
