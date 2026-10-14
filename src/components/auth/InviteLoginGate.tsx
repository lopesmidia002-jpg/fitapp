import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import {
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Dumbbell,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Phone,
  Key
} from 'lucide-react';

export function InviteLoginGate() {
  const { pendingInviteAuth, authenticateInvite, clearInviteAuth } = useApp();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!pendingInviteAuth) return null;

  const isStudent = pendingInviteAuth.role === 'student';
  const targetName = isStudent
    ? pendingInviteAuth.student?.fullName || 'Aluno'
    : pendingInviteAuth.trainer?.fullName || 'Treinador';

  const targetEmail = isStudent
    ? pendingInviteAuth.student?.email || 'aluno@omegatraining.pro'
    : pendingInviteAuth.trainer?.email || 'treinador@omegatraining.pro';

  const targetAvatar = isStudent
    ? pendingInviteAuth.student?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    : pendingInviteAuth.trainer?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80';

  const expectedPassword = isStudent
    ? pendingInviteAuth.student?.temporaryPassword || 'Omega@2026'
    : pendingInviteAuth.trainer?.temporaryPassword || 'Omega@Coach2026';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const res = authenticateInvite(password);
    if (res.success) {
      setIsSuccess(true);
    } else {
      setErrorMessage(res.error || 'Credenciais inválidas.');
    }
  };

  const handleQuickFill = () => {
    setPassword(expectedPassword);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F5F7FA] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-primary selection:text-background">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-card border border-border shadow-2xl rounded-3xl p-6 sm:p-8 relative z-10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="Omega Training" className="h-10 w-10 rounded-xl shadow-neon-sm ring-1 ring-primary/40" />
            <span className="font-black text-xl tracking-tight text-foreground">
              OMEGA <span className="text-primary">TRAINING</span>
            </span>
          </div>

          <Badge
            variant={isStudent ? 'primary' : 'success'}
            size="md"
            className="flex items-center gap-1.5 shadow-sm mt-1"
          >
            {isStudent ? <UserCheck className="h-3.5 w-3.5" /> : <Dumbbell className="h-3.5 w-3.5" />}
            <span>
              {isStudent ? 'Portal do Aluno • Login de Acesso' : 'Console do Treinador • Acesso Profissional'}
            </span>
          </Badge>
        </div>

        {/* Personalized Welcome Card */}
        <div className="p-4 rounded-2xl bg-surface border border-border flex items-center gap-3.5 mb-5">
          <img
            src={targetAvatar}
            alt={targetName}
            className="h-14 w-14 rounded-2xl object-cover ring-2 ring-primary/50 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
              {isStudent ? 'Acesso Exclusivo do Aluno' : 'Acesso Profissional'}
            </span>
            <h2 className="text-sm font-bold text-foreground truncate" title={targetName}>
              Olá, {targetName}!
            </h2>
            <p className="text-xs text-muted truncate mt-0.5">{targetEmail}</p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2.5 mb-4 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSuccess && (
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-center gap-2.5 mb-4 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Senha validada com sucesso! Redirecionando para seu ambiente...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Login / E-mail</label>
            <Input
              type="email"
              value={targetEmail}
              disabled
              className="bg-surface/50 text-muted cursor-not-allowed opacity-80"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-foreground">
                Digite sua Senha de Acesso *
              </label>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
                title="Preencher com a senha configurada no convite"
              >
                <Sparkles className="h-3 w-3" />
                <span>Preencher Senha Demo</span>
              </button>
            </div>

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Insira sua senha..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoFocus
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted hover:text-foreground p-0.5"
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold shadow-neon-sm"
          >
            <span>{isStudent ? 'Entrar no Meu Ambiente de Aluno' : 'Entrar no Painel do Treinador'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* Security & Help Footer */}
        <div className="mt-6 pt-4 border-t border-border flex flex-col items-center space-y-2.5 text-center text-xs text-muted">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Ambiente seguro e protegido • Acesso restrito com criptografia</span>
          </div>

          <button
            type="button"
            onClick={clearInviteAuth}
            className="text-xs text-muted hover:text-foreground underline transition-colors"
          >
            Não é você? Entrar com outra conta
          </button>
        </div>
      </div>
    </div>
  );
}
