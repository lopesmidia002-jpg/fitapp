# PROMPT ORIGINAL DO PROJETO FITCORE PRO

Abaixo está o registro na íntegra do prompt e especificações fornecidas para a criação do FITCORE PRO:

```markdown
# FITCORE PRO — DESENVOLVIMENTO DE UM SAAS FITNESS COMPLETO COM GOOGLE ANTIGRAVITY

## MISSÃO PRINCIPAL
Você é um engenheiro de software sênior trabalhando dentro do Google Antigravity. Sua missão é desenvolver uma aplicação SaaS real, modular, segura, responsiva e instalável como PWA, chamada provisoriamente FITCORE PRO.

Não se limite a planejar ou apresentar código em respostas. Trabalhe diretamente no workspace do projeto: inspecione os arquivos, crie e edite componentes, implemente funcionalidades, execute comandos de desenvolvimento, rode testes e corrija erros.

Não encerre o trabalho depois de criar a interface inicial. Implemente o sistema de forma incremental, documentando o progresso e verificando cada etapa.

Se o workspace já possuir código, analise sua estrutura antes de modificar arquivos. Preserve funcionalidades existentes e evite alterações destrutivas.

## 1. VISÃO DO PRODUTO
O FITCORE PRO será uma plataforma SaaS destinada a personal trainers, academias, profissionais de nutrição habilitados e consultores fitness.
A plataforma reunirá:
- Gestão e cadastro de alunos.
- Montagem e acompanhamento de treinos.
- Biblioteca de exercícios.
- Planejamento alimentar por profissionais autorizados.
- Diário alimentar.
- Avaliações físicas e medidas corporais.
- Histórico de evolução.
- Metas e check-ins.
- Insights e alertas inteligentes.
- Comunicação com alunos.
- Planos e assinaturas recorrentes.
- Gestão comercial.
- Painel administrativo global.
- Aplicação web instalável como PWA.

A solução deverá atender múltiplas organizações, mantendo os dados de cada empresa separados.
Utilize o nome FITCORE PRO como marca provisória, permitindo personalização posterior.

## 2. MODO DE TRABALHO NO ANTIGRAVITY
1. Inspecione os arquivos e as dependências do workspace.
2. Identifique a stack existente.
3. Crie um plano de implementação dividido em etapas.
4. Defina a arquitetura e os modelos de dados.
5. Identifique as integrações que dependem de credenciais.
6. Implemente a primeira etapa funcional.
7. Execute a aplicação e valide o resultado.
8. Corrija os erros encontrados antes de avançar.

## 3. STACK TÉCNICA
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Lucide
- Recharts
- Supabase com PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Edge Functions ou backend seguro equivalente
- Vitest para testes unitários
- Playwright para testes end-to-end
- Manifesto e Service Worker para PWA

## 4. DESIGN SYSTEM
Paleta:
- Fundo principal: #0B0D10
- Superfície: #14171C
- Cards: #1B2027
- Verde de destaque: #B8F34A
- Texto principal: #F5F7FA
- Texto secundário: #9AA3AF
- Bordas: #292F38
Fonte: Inter ou Manrope.
Tema escuro premium e suporte a tema claro.

## 22. ORDEM OBRIGATÓRIA DE IMPLEMENTAÇÃO
FASE 1 — Inspeção do workspace, planejamento e design system.
FASE 2 — Estrutura da aplicação, rotas, autenticação e onboarding.
FASE 3 — Banco de dados, multi-tenancy e permissões.
FASE 4 — Cadastro de alunos e dashboard.
FASE 5 — Biblioteca de exercícios e módulo de treinos.
FASE 6 — Alimentação e diário alimentar.
FASE 7 — Avaliações, evolução, metas e check-ins.
FASE 8 — Insights e notificações.
FASE 9 — Planos SaaS e pagamentos.
FASE 10 — Painel do superadministrador.
FASE 11 — PWA e experiência mobile.
FASE 12 — Testes, correções e documentação de implantação.
```
