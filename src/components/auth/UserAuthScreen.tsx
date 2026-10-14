import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  UserCheck,
  Dumbbell,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Key,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export function UserAuthScreen() {
  const { loginUser, registerUser } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [loginEmail, setLoginEmail] = useState('marina.aluna@email.com');
  const [loginPassword, setLoginPassword] = useState('aluno123');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'student' | 'pro'>('student');

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');

  // Status
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = loginUser(loginEmail, loginPassword);
      if (res.success) {
        setSuccessMessage('Acesso autorizado! Carregando seu ambiente...');
      } else {
        setErrorMessage(res.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
        setIsLoading(false);
      }
    }, 300);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (regPassword.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = registerUser({
        fullName: regFullName,
        email: regEmail,
        password: regPassword,
        role: regRole,
      });

      if (res.success) {
        setSuccessMessage('Conta criada com sucesso! Carregando aplicativo...');
      } else {
        setErrorMessage(res.error || 'Erro ao registrar usuário.');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!forgotEmail) {
      setErrorMessage('Por favor, informe seu e-mail cadastrado.');
      return;
    }
    setSuccessMessage(`Instruções de redefinição de senha enviadas para ${forgotEmail}.`);
  };

  const handleQuickLogin = (role: 'pro' | 'student') => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    if (role === 'pro') {
      setLoginEmail('nilson.coach@omegatraining.pro');
      setLoginPassword('treinador123');
      setTimeout(() => {
        const res = loginUser('nilson.coach@omegatraining.pro', 'treinador123');
        if (res.success) {
          setSuccessMessage('Entrando como Treinador Demo...');
        } else {
          setErrorMessage(res.error || 'Erro no login demo');
          setIsLoading(false);
        }
      }, 300);
    } else {
      setLoginEmail('marina.aluna@email.com');
      setLoginPassword('aluno123');
      setTimeout(() => {
        const res = loginUser('marina.aluna@email.com', 'aluno123');
        if (res.success) {
          setSuccessMessage('Entrando como Aluno Demo...');
        } else {
          setErrorMessage(res.error || 'Erro no login demo');
          setIsLoading(false);
        }
      }, 300);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0D10] text-[#F5F7FA] flex items-center justify-center p-3 sm:p-6 md:p-8 relative overflow-y-auto selection:bg-primary selection:text-background py-6 sm:py-10">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Login Card (Perfeitamente Proporcionado e Centralizado) */}
      <div className="w-full max-w-[420px] my-auto bg-[#14171C] border border-[#292F38] shadow-2xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 relative z-10 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-1.5 mb-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.svg"
              alt="Omega Training"
              className="h-10 w-10 rounded-xl shadow-neon-sm ring-2 ring-primary/40"
            />
            <div className="text-left">
              <span className="font-black text-xl tracking-tight text-foreground block leading-none">
                OMEGA <span className="text-primary">TRAINING</span>
              </span>
              <span className="text-[9px] text-muted uppercase font-bold tracking-widest block mt-0.5">
                Consultoria & Treinamento
              </span>
            </div>
          </div>

          <Badge variant="primary" size="sm" className="flex items-center gap-1.5 shadow-sm mt-1">
            <Key className="h-3 w-3" />
            <span>Acesso à Plataforma • Login</span>
          </Badge>
          <p className="text-[11px] text-muted max-w-xs leading-tight">
            Informe suas credenciais para entrar na plataforma.
          </p>
        </div>

        {/* Tab Switcher: Login / Register */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-surface rounded-xl border border-border mb-3.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'login'
                ? 'bg-primary text-background shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'register'
                ? 'bg-primary text-background shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-400 flex items-start gap-2 mb-3 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400 flex items-center gap-2 mb-3 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: LOGIN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">E-mail de Acesso</label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="aluno@email.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Mail className="absolute right-3 top-3 h-4 w-4 text-muted pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-foreground">Senha</label>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('forgot');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-[11px] text-primary hover:underline font-semibold"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-neon-sm cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Validando Acesso...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Omega Training</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            {/* Quick Demo Fill / Direct Entry */}
            <div className="pt-3 border-t border-border space-y-2">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block text-center">
                Acesso Rápido para Demonstração (1 Clique):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('student')}
                  disabled={isLoading}
                  className="text-xs flex items-center gap-1.5 justify-center py-2.5 border-primary/30 hover:bg-primary/10"
                >
                  <UserCheck className="h-3.5 w-3.5 text-primary" />
                  <span className="font-bold">Aluno Demo</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('pro')}
                  disabled={isLoading}
                  className="text-xs flex items-center gap-1.5 justify-center py-2.5 border-border hover:bg-card"
                >
                  <Dumbbell className="h-3.5 w-3.5 text-primary" />
                  <span className="font-bold">Treinador Demo</span>
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: REGISTER */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Tipo de Perfil</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole('student')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    regRole === 'student'
                      ? 'bg-primary/15 border-primary text-primary'
                      : 'bg-surface border-border text-muted hover:text-foreground'
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Aluno</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('pro')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    regRole === 'pro'
                      ? 'bg-primary/15 border-primary text-primary'
                      : 'bg-surface border-border text-muted hover:text-foreground'
                  }`}
                >
                  <Dumbbell className="h-4 w-4" />
                  <span>Treinador / Coach</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Nome Completo</label>
              <Input
                type="text"
                placeholder="Ex: João da Silva"
                value={regFullName}
                onChange={e => setRegFullName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">E-mail</label>
              <Input
                type="email"
                placeholder="seu.email@exemplo.com"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Senha (mínimo 6 caracteres)</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-neon-sm cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Criando Conta...</span>
                </>
              ) : (
                <>
                  <span>Cadastrar e Acessar</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}

        {/* TAB 3: FORGOT PASSWORD */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">E-mail Cadastrado</label>
              <Input
                type="email"
                placeholder="seu.email@exemplo.com"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                required
              />
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Enviaremos um link de redefinição de senha para o e-mail cadastrado ou você pode contatar diretamente seu treinador da Omega Training para redefinição imediata.
            </p>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
            >
              <span>Enviar Link de Recuperação</span>
            </Button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-xs text-primary hover:underline font-semibold"
              >
                ← Voltar para a tela de Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
