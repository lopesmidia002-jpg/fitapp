# DOCUMENTAÇÃO TÉCNICA — FITCORE PRO

## 1. Visão Geral da Arquitetura

O **FITCORE PRO** adota uma arquitetura modular em camadas orientada a domínio para aplicações SaaS modernas em React/TypeScript:

```
src/
├── assets/          # Ícones, ilustrações, imagens estáticas
├── components/      # Componentes reutilizáveis do Design System (UI)
│   ├── ui/          # Botões, Cards, Inputs, Modais, Tabelas, Badges, etc.
│   ├── layout/      # Sidebar, Header, MobileNav, Layouts por Perfil
│   └── common/      # Feedback, Notificações, Empty states, Loaders
├── context/         # AuthContext, OrgContext, ThemeContext, ToastContext
├── hooks/           # useAuth, useOrg, useWorkouts, useMetrics, etc.
├── lib/             # Supabase client, utils de formatação, cálculo de métricas
├── modules/         # Módulos funcionais da aplicação
│   ├── auth/        # Login, Cadastro, Recuperação, Onboarding
│   ├── dashboard/   # Dashboard do Profissional e Métricas
│   ├── students/    # CRM de alunos, detalhes, importação CSV
│   ├── workouts/    # Biblioteca de exercícios, fichas e player de treino
│   ├── nutrition/   # Planos alimentares e diário do aluno
│   ├── assessments/ # Avaliações físicas, medidas, fotos e gráficos
│   ├── checkins/    # Formulários periódicos e histórico
│   ├── insights/    # Motor de regras, alertas inteligentes
│   ├── billing/     # Planos SaaS (Starter, Pro, Business), checkout
│   └── superadmin/  # Gestão global de tenants e faturamento
├── types/           # Definições TypeScript globais e contratos de dados
└── services/        # Camada de comunicação com Supabase / API Mock
```

## 2. Paleta de Cores e Identidade Visual (Design System)

- **Fundo Principal (Background):** `#0B0D10`
- **Superfície Secundária (Surface):** `#14171C`
- **Cards e Contêineres:** `#1B2027`
- **Verde Destaque Neon (Accent/Primary):** `#B8F34A`
- **Verde Destaque Hover:** `#A6E039`
- **Texto Principal (Foreground):** `#F5F7FA`
- **Texto Secundário / Muted:** `#9AA3AF`
- **Bordas e Divisores:** `#292F38`
- **Status Positivo:** `#34D399`
- **Status Atenção:** `#FBBF24`
- **Status Alerta/Erro:** `#F87171`

## 3. Modelo de Dados e Multi-Tenancy (Supabase PostgreSQL)

O isolamento é garantido por `organization_id` em cada tabela:
- `organizations`: Dados da academia ou consultoria (`id`, `name`, `slug`, `plan_id`, `created_at`)
- `profiles`: Perfis de usuário com vínculo ao `auth.users` (`id`, `full_name`, `email`, `role`, `avatar_url`)
- `organization_members`: Vínculo entre usuário e organização com papel (`id`, `organization_id`, `user_id`, `role: 'owner' | 'pro' | 'student'`)
- `students`: Dados cadastrais e ficha do aluno (`id`, `organization_id`, `pro_id`, `user_id`, `status: 'active' | 'inactive' | 'archived'`, `birth_date`, `goals`, `notes`)
- `exercises`: Biblioteca de exercícios (`id`, `organization_id` nullable para exercícios padrão globais, `name`, `muscle_group`, `equipment`, `instructions`, `video_url`)
- `workout_plans`: Programas de treino (`id`, `organization_id`, `student_id`, `pro_id`, `title`, `notes`, `valid_until`)
- `workout_sessions`: Registros de sessões executadas pelo aluno (`id`, `workout_plan_id`, `student_id`, `started_at`, `completed_at`, `duration_seconds`)
- `nutrition_plans` & `food_diary`: Planos de dieta e refeições diárias registradas pelo aluno
- `physical_assessments`: Avaliações físicas, medidas corporais, dobras cutâneas e fotos
- `insights`: Alertas e sugestões gerados pelo sistema com base em regras e comportamento
- `subscriptions` & `invoices`: Gestão de planos SaaS e faturamento

## 4. Segurança e LGPD
- Row Level Security (RLS) habilitado em 100% das tabelas.
- Permissões estritas: Aluno só lê seus dados; Pro acessa alunos atribuídos; Owner gerencia a org; SuperAdmin gerencia a plataforma.
- Fotos corporais e anamneses armazenadas em buckets privados com URLs assinadas e expiração curta.
