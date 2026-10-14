# CONTEXTO DO PROJETO FITCORE PRO

## 1. O Que é o FITCORE PRO
O **FITCORE PRO** é uma plataforma SaaS (Software as a Service) B2B/B2C para ecossistemas fitness, concebida para atender:
1. **Personal Trainers e Consultores Fitness Independentes**
2. **Academias, Boxes e Studios de Treinamento**
3. **Nutricionistas Esportivos e Clínicos Habilitados**
4. **Alunos/Atletas (B2C final via Web e PWA Mobile-First)**
5. **Superadministradores da Plataforma SaaS**

## 2. Princípios de Arquitetura e Engenharia
- **Multi-tenancy Rígido**: Isolamento total de dados por `organization_id` em nível de banco de dados (Row Level Security - RLS).
- **Segurança & LGPD**: Dados de saúde e medidas protegidos com criptografia e políticas de acesso granulares; fotos e documentos com URLs assinadas temporárias.
- **Offline-First & PWA**: Acesso rápido mesmo em ambientes de academia com sinal fraco; manifesto web, service workers e cache inteligente.
- **Design System de Alto Padrão**: Estética moderna voltada para o mercado fitness premium (paleta escura com `#0B0D10`, acentos em verde neon `#B8F34A`, tipografia refinada e micro-interações).
- **Gamificação e Retenção Saudável**: Metas, check-ins e insights inteligentes baseados em regras reais e IA sem prescrições médicas automáticas irresponsáveis.

## 3. Estado do Workspace
- Workspace em: `c:\Users\Nilto\OneDrive\Documentos\Fitapp`.
- Ambiente: Node.js `v24.20.0`, npm `11.19.0`, Windows OS.
- Stack: React + TypeScript + Vite, Tailwind CSS v3.4, Lucide Icons, Recharts, Supabase PostgreSQL RLS.
