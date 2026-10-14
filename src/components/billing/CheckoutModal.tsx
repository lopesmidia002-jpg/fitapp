import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { formatCurrency } from '../../lib/utils';
import { paymentService, PaymentResult } from '../../lib/supabase';
import {
  QrCode,
  CreditCard,
  Copy,
  Check,
  ShieldCheck,
  Lock,
  Clock,
  Sparkles,
  Zap,
  Building,
  CheckCircle2,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: 'starter' | 'pro' | 'business';
    name: string;
    priceMonthly: number;
    maxStudents: number;
  };
  onPaymentSuccess: (result: PaymentResult) => void;
}

export function CheckoutModal({ isOpen, onClose, plan, onPaymentSuccess }: CheckoutModalProps) {
  const [method, setMethod] = useState<'pix' | 'credit_card'>('pix');
  const [copiedPix, setCopiedPix] = useState(false);
  const [pixTimeRemaining, setPixTimeRemaining] = useState(15 * 60); // 15 minutes in seconds
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedPayment, setCompletedPayment] = useState<PaymentResult | null>(null);

  // Credit card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [installments, setInstallments] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');

  const pixData = paymentService.generatePixCode(plan.priceMonthly, `Assinatura Plano ${plan.name}`);

  // Countdown timer for PIX
  useEffect(() => {
    if (!isOpen || method !== 'pix' || completedPayment) return;
    const interval = setInterval(() => {
      setPixTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, method, completedPayment]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixData.copyPasteKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleSimulatePixSuccess = async () => {
    setIsProcessing(true);
    try {
      const result = await paymentService.confirmPixPayment(plan.priceMonthly);
      setCompletedPayment(result);
      onPaymentSuccess(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao processar PIX.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsProcessing(true);

    try {
      const result = await paymentService.processCreditCard({
        cardNumber,
        cardHolder,
        expiryDate: expiry,
        cvv,
        installments,
        amount: plan.priceMonthly,
      });
      setCompletedPayment(result);
      onPaymentSuccess(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao processar pagamento com cartão.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAndClose = () => {
    setCompletedPayment(null);
    setErrorMessage('');
    setCardNumber('');
    setCardHolder('');
    setExpiry('');
    setCvv('');
    onClose();
  };

  const formatCardInput = (val: string) => {
    const numbers = val.replace(/\D/g, '').slice(0, 16);
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryInput = (val: string) => {
    const numbers = val.replace(/\D/g, '').slice(0, 4);
    if (numbers.length >= 3) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}`;
    }
    return numbers;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={completedPayment ? "Assinatura Confirmada!" : `Checkout Seguro: Plano ${plan.name}`}
      description={
        completedPayment
          ? "Sua assinatura foi ativada com sucesso. Aproveite todos os recursos liberados!"
          : "Escolha seu método de pagamento preferido para ativação imediata."
      }
    >
      {completedPayment ? (
        <div className="py-6 flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary animate-bounce">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div>
            <h3 className="text-xl font-black text-foreground">Plano {plan.name} Ativo</h3>
            <p className="text-xs text-muted mt-1">Limite expandido para até {plan.maxStudents} alunos ativos.</p>
          </div>

          <div className="w-full bg-surface border border-border rounded-xl p-4 text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-muted">ID da Transação:</span>
              <span className="font-mono font-bold text-foreground">{completedPayment.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Valor Confirmado:</span>
              <span className="font-bold text-primary">{formatCurrency(completedPayment.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Método:</span>
              <span className="font-bold text-foreground capitalize">
                {completedPayment.method === 'pix' ? 'PIX Instantâneo' : 'Cartão de Crédito'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Data e Hora:</span>
              <span className="text-foreground">{new Date(completedPayment.paidAt).toLocaleString('pt-BR')}</span>
            </div>
          </div>

          <Button variant="primary" className="w-full mt-2" onClick={resetAndClose}>
            Acessar Plataforma com Novo Plano
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Plan Summary Header */}
          <div className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Plano Selecionado
              </span>
              <p className="text-base font-extrabold text-foreground">{plan.name}</p>
              <p className="text-xs text-muted">Até {plan.maxStudents} alunos • Gestão completa</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-primary">{formatCurrency(plan.priceMonthly)}</span>
              <span className="text-[11px] text-muted block">/mês</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-dark-700/60 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => { setMethod('pix'); setErrorMessage(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                method === 'pix'
                  ? 'bg-primary text-background shadow-md'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <QrCode className="h-4 w-4" />
              <span>PIX Instantâneo</span>
            </button>

            <button
              type="button"
              onClick={() => { setMethod('credit_card'); setErrorMessage(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                method === 'credit_card'
                  ? 'bg-primary text-background shadow-md'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>Cartão de Crédito</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {errorMessage}
            </div>
          )}

          {/* TAB 1: PIX */}
          {method === 'pix' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center p-4 bg-surface rounded-xl border border-border space-y-3">
                {/* Visual QR Code Generator */}
                <div className="p-3 bg-white rounded-xl shadow-lg border border-white/20 flex flex-col items-center justify-center">
                  <svg className="w-40 h-40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="100" fill="white"/>
                    {/* Top-Left Corner */}
                    <rect x="10" y="10" width="24" height="24" fill="#0B0D10"/>
                    <rect x="14" y="14" width="16" height="16" fill="white"/>
                    <rect x="18" y="18" width="8" height="8" fill="#0B0D10"/>
                    {/* Top-Right Corner */}
                    <rect x="66" y="10" width="24" height="24" fill="#0B0D10"/>
                    <rect x="70" y="14" width="16" height="16" fill="white"/>
                    <rect x="74" y="18" width="8" height="8" fill="#0B0D10"/>
                    {/* Bottom-Left Corner */}
                    <rect x="10" y="66" width="24" height="24" fill="#0B0D10"/>
                    <rect x="14" y="70" width="16" height="16" fill="white"/>
                    <rect x="18" y="74" width="8" height="8" fill="#0B0D10"/>
                    {/* Center & Data matrix pattern */}
                    <rect x="42" y="15" width="6" height="6" fill="#0B0D10"/>
                    <rect x="52" y="15" width="6" height="6" fill="#0B0D10"/>
                    <rect x="42" y="27" width="6" height="6" fill="#0B0D10"/>
                    <rect x="15" y="42" width="6" height="6" fill="#0B0D10"/>
                    <rect x="27" y="42" width="6" height="6" fill="#0B0D10"/>
                    <rect x="39" y="39" width="22" height="22" fill="#0B0D10"/>
                    <rect x="44" y="44" width="12" height="12" fill="#B8F34A"/>
                    <rect x="67" y="42" width="6" height="6" fill="#0B0D10"/>
                    <rect x="79" y="42" width="6" height="6" fill="#0B0D10"/>
                    <rect x="42" y="69" width="6" height="6" fill="#0B0D10"/>
                    <rect x="54" y="69" width="6" height="6" fill="#0B0D10"/>
                    <rect x="66" y="66" width="8" height="8" fill="#0B0D10"/>
                    <rect x="78" y="66" width="12" height="8" fill="#0B0D10"/>
                    <rect x="66" y="78" width="14" height="12" fill="#0B0D10"/>
                    <rect x="84" y="78" width="6" height="12" fill="#0B0D10"/>
                  </svg>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-muted">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>Código expira em: <strong className="text-foreground">{formatTimer(pixTimeRemaining)}</strong></span>
                </div>
              </div>

              {/* PIX Copy & Paste Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Código PIX Copia e Cola:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={pixData.copyPasteKey}
                    className="flex-1 bg-surface border border-border text-muted text-xs rounded-xl px-3 py-2 font-mono truncate focus:outline-none"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPix}
                    className="shrink-0 flex items-center gap-1.5 text-xs font-bold"
                  >
                    {copiedPix ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-primary" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-start gap-2.5 text-xs text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Abra o aplicativo do seu banco, escolha <strong>Pagar via PIX</strong> e aponte a câmera para o QR Code ou cole o código acima.
                </span>
              </div>

              <Button
                variant="primary"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleSimulatePixSuccess}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span>Validando compensação no Banco Central...</span>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Confirmar Pagamento PIX (Compensação Imediata)</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* TAB 2: CREDIT CARD */}
          {method === 'credit_card' && (
            <form onSubmit={handleProcessCard} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Número do Cartão</label>
                <div className="relative">
                  <Input
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardInput(e.target.value))}
                    required
                    maxLength={19}
                  />
                  <CreditCard className="absolute right-3 top-3 h-4 w-4 text-muted" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Nome Impresso no Cartão</label>
                <Input
                  placeholder="EX: NILTON LOPES"
                  value={cardHolder}
                  onChange={e => setCardHolder(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Validade</label>
                  <Input
                    placeholder="MM/AA"
                    value={expiry}
                    onChange={e => setExpiry(formatExpiryInput(e.target.value))}
                    required
                    maxLength={5}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Código de Segurança (CVV)</label>
                  <div className="relative">
                    <Input
                      placeholder="123"
                      type="password"
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      required
                      maxLength={4}
                    />
                    <Lock className="absolute right-3 top-3 h-3.5 w-3.5 text-muted" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Opções de Parcelamento</label>
                <select
                  value={installments}
                  onChange={e => setInstallments(Number(e.target.value))}
                  className="w-full bg-surface border border-border text-foreground text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value={1}>1x de {formatCurrency(plan.priceMonthly)} (Sem juros)</option>
                  <option value={3}>3x de {formatCurrency(plan.priceMonthly / 3)} (Sem juros)</option>
                  <option value={6}>6x de {formatCurrency(plan.priceMonthly / 6)} (Sem juros)</option>
                  <option value={12}>12x de {formatCurrency(plan.priceMonthly / 12)} (Sem juros)</option>
                </select>
              </div>

              <div className="p-3 bg-surface border border-border rounded-xl flex items-center justify-between text-xs">
                <span className="text-muted">Total a Pagar Hoje:</span>
                <span className="font-extrabold text-foreground">{formatCurrency(plan.priceMonthly)}</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full flex items-center justify-center gap-2 mt-2"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span>Processando transação com operadora...</span>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Pagar {formatCurrency(plan.priceMonthly)} e Ativar Imediatamente</span>
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="flex items-center justify-center gap-2 text-[11px] text-muted pt-2 border-t border-border">
            <Lock className="h-3 w-3 text-primary" />
            <span>Transação 100% Criptografada SSL / Certificação PCI-DSS Nível 1</span>
          </div>
        </div>
      )}
    </Modal>
  );
}
