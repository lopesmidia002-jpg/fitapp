import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SAAS_PLANS } from '../../services/mockData';
import { formatCurrency, formatDate } from '../../lib/utils';
import { CheckoutModal } from '../../components/billing/CheckoutModal';
import {
  CreditCard,
  Check,
  Zap,
  ShieldCheck,
  FileText,
  Download,
  AlertCircle
} from 'lucide-react';

export function BillingView() {
  const { organization, updateOrganization, students } = useApp();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<'starter' | 'pro' | 'business'>('business');

  const currentPlan = SAAS_PLANS.find(p => p.id === organization.planId) || SAAS_PLANS[1];
  const usagePercentage = Math.round((students.length / currentPlan.maxStudents) * 100);

  const mockInvoices = [
    { id: 'inv-101', date: '2026-10-01', amount: currentPlan.priceMonthly, status: 'paid', pdfUrl: '#' },
    { id: 'inv-100', date: '2026-09-01', amount: currentPlan.priceMonthly, status: 'paid', pdfUrl: '#' },
    { id: 'inv-099', date: '2026-08-01', amount: currentPlan.priceMonthly, status: 'paid', pdfUrl: '#' },
  ];

  const handleUpgrade = (planId: 'starter' | 'pro' | 'business') => {
    setSelectedPlanForCheckout(planId);
    setIsCheckoutOpen(true);
  };

  const confirmPlanChange = () => {
    const targetPlan = SAAS_PLANS.find(p => p.id === selectedPlanForCheckout)!;
    updateOrganization({
      planId: selectedPlanForCheckout,
      maxStudents: targetPlan.maxStudents,
    });
    setIsCheckoutOpen(false);
    alert(`Plano alterado para ${targetPlan.name} com sucesso! Limites atualizados.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            Planos & Assinatura Omega Training <span className="text-primary">●</span>
          </h1>
          <p className="text-sm text-muted">
            Gerencie o plano da sua assessoria, limites de alunos e histórico de faturas.
          </p>
        </div>

        <Badge variant="primary" size="md">
          Plano Ativo: {currentPlan.name}
        </Badge>
      </div>

      {/* Usage Meter Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">Utilização da Conta</span>
                <span className="text-xs font-bold text-primary">
                  {students.length} de {currentPlan.maxStudents} alunos ativos
                </span>
              </div>
              <p className="text-xs text-muted">
                Você utilizou {usagePercentage}% da cota máxima do seu plano atual.
              </p>
            </div>

            {usagePercentage >= 75 && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleUpgrade('business')}
                className="flex items-center gap-1.5"
              >
                <Zap className="h-4 w-4" />
                <span>Fazer Upgrade para BUSINESS</span>
              </Button>
            )}
          </div>

          <div className="w-full bg-dark-700 h-2.5 rounded-full mt-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                usagePercentage > 90 ? 'bg-red-400' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(100, usagePercentage)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SAAS_PLANS.map((plan) => {
          const isCurrent = plan.id === organization.planId;

          return (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-200 ${
                plan.isPopular ? 'border-primary shadow-neon-sm' : 'border-border'
              }`}
            >
              {plan.isPopular && (
                <div className="bg-primary text-background text-[10px] uppercase font-black tracking-widest text-center py-1">
                  Mais Escolhido por Treinadores
                </div>
              )}

              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrent && (
                    <Badge variant="primary" size="sm">Plano Atual</Badge>
                  )}
                </div>
                <CardDescription>
                  Até {plan.maxStudents} alunos ativos simultâneos
                </CardDescription>

                <div className="pt-4">
                  <span className="text-4xl font-black text-foreground">
                    {formatCurrency(plan.priceMonthly)}
                  </span>
                  <span className="text-xs text-muted ml-1">/mês</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2.5 text-xs">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-foreground">
                      <div className="p-0.5 rounded-full bg-primary/20 text-primary">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-border">
                  {isCurrent ? (
                    <Button variant="secondary" size="md" className="w-full" disabled>
                      Plano em Uso
                    </Button>
                  ) : (
                    <Button
                      variant={plan.isPopular ? 'primary' : 'outline'}
                      size="md"
                      className="w-full"
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {plan.priceMonthly > currentPlan.priceMonthly ? 'Fazer Upgrade' : 'Mudar para este Plano'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Invoice History & Payment Integrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Cobranças</CardTitle>
            <CardDescription>Faturas e comprovantes de pagamento da assinatura</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockInvoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-3 rounded-xl bg-surface/40 border border-border/60 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-card border border-border text-foreground">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Fatura #{inv.id}</p>
                    <p className="text-muted">{formatDate(inv.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-foreground">{formatCurrency(inv.amount)}</span>
                  <Badge variant="success" size="sm">Pago</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted hover:text-foreground">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Gateways Config */}
        <Card>
          <CardHeader>
            <CardTitle>Integrações de Pagamento</CardTitle>
            <CardDescription>Gateway seguro conectado para cobranças e webhooks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-sm">Stripe Payments</span>
                <Badge variant="primary" size="sm">Modo Seguro</Badge>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Integração configurada para assinaturas recorrentes com webhooks idempotentes no backend Supabase Edge Functions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-sm">Mercado Pago / PIX</span>
                <Badge variant="neutral" size="sm">Disponível</Badge>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Opção de faturamento local via PIX recorrente para consultorias no Brasil.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Realistic Interactive Checkout Modal (PIX & Card) */}
      {selectedPlanForCheckout && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          plan={{
            id: selectedPlanForCheckout,
            name: SAAS_PLANS.find(p => p.id === selectedPlanForCheckout)?.name || 'Plano',
            priceMonthly: SAAS_PLANS.find(p => p.id === selectedPlanForCheckout)?.priceMonthly || 0,
            maxStudents: SAAS_PLANS.find(p => p.id === selectedPlanForCheckout)?.maxStudents || 50,
          }}
          onPaymentSuccess={(result) => {
            const targetPlan = SAAS_PLANS.find(p => p.id === selectedPlanForCheckout)!;
            updateOrganization({
              planId: selectedPlanForCheckout,
              maxStudents: targetPlan.maxStudents,
            });
          }}
        />
      )}
    </div>
  );
}

