# ARQUITETURA TÉCNICA E MODELAGEM — FITCORE PRO

## 1. Visão Arquitetural

```
+---------------------------------------------------------------+
|                       FITCORE PRO SAAS                        |
+-------------------------------+-------------------------------+
|       CLIENT WEB / PWA        |       SUPERADMIN CONSOLE      |
|  (React 19 + Vite + Tailwind) |    (Métricas Globais & Orgs)  |
+-------------------------------+-------------------------------+
|                ESTADO & DOMÍNIO DO FRONTEND                   |
| - AuthContext (Multi-role: Superadmin, Owner, Pro, Student)   |
| - OrgContext (Isolamento por organização & plano ativo)       |
| - WorkoutPlayerState (Temporizador e persistência de séries)  |
| - NotificationsStore (Alertas e badges em tempo real)         |
+---------------------------------------------------------------+
|                       CAMADA DE SERVIÇOS                      |
| - supabaseClient.ts (Conexão autenticada)                     |
| - mockStorageService.ts (Dados semente e fallback offline)    |
| - insightsEngine.ts (Detecção proativa de retenção e riscos)  |
| - billingService.ts (Regras de limites de planos)             |
+---------------------------------------------------------------+
|                      BACKEND / SUPABASE                       |
| - PostgreSQL com Row Level Security (RLS) obrigatório         |
| - Supabase Auth (JWT, Magic link, OAuth, Email/Senha)         |
| - Supabase Storage (Buckets seguros para fotos corporais)     |
| - Edge Functions (Webhooks de pagamento Stripe/MercadoPago)   |
+---------------------------------------------------------------+
```

## 2. Princípios de Multi-Tenancy

1. **Chave de Particionamento Lógico**: Todas as tabelas que contêm dados de clientes possuem uma coluna `organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE`.
2. **Políticas de Acesso (RLS)**:
   - Funções auxiliares `auth.jwt()` e `get_user_organization_id()`.
   - Um profissional só pode consultar e modificar dados da organização a que pertence e alunos designados.
   - Um aluno só pode consultar seus próprios treinos, avaliações e planos vinculados a ele.
   - O `superadmin` possui bypass restrito auditado para monitoramento de saúde do sistema.

## 3. Segurança e LGPD

- **Dados Sensíveis de Saúde**: Medidas corporais, histórico médico e percentuais de gordura são classificados como dados sensíveis. O acesso é restrito ao aluno e aos profissionais formalmente vinculados ao acompanhamento dele.
- **Armazenamento de Imagens**: Fotografias corporais são salvas em bucket privado com acesso exclusivo via URLs pré-assinadas com validade de 5 minutos.
- **Dados Financeiros**: Nenhuma informação de cartão de crédito ou código de segurança (CVV) trafega ou é salva na aplicação. Todos os pagamentos utilizam tokens dos gateways parceiros (Stripe / Mercado Pago).
