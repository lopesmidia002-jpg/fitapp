import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useApp } from '../../context/AppContext';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Dumbbell,
  UserCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UserAuthModal({ isOpen, onClose, onSuccess }: UserAuthModalProps) {
  const { loginUser, registerUser, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'pro' | 'student'>('student');

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const res = loginUser(loginEmail, loginPassword);
    if (res.success) {
      setSuccessMessage('Login efetuado com sucesso!');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 700);
    } else {
      setErrorMessage(res.error || 'Credenciais inválidas.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (regPassword.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    const res = registerUser({
      fullName: regFullName,
      email: regEmail,
      password: regPassword,
      role: regRole,
    });

    if (res.success) {
      setSuccessMessage('Conta criada com sucesso! Sessão iniciada.');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 800);
    } else {
      setErrorMessage(res.error || 'Erro ao registrar usuário.');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!forgotEmail) {
      setErrorMessage('Por favor, informe seu e-mail.');
      return;
    }
    setSuccessMessage(`Enviamos um link de recuperação para ${forgotEmail}.`);
  };

  const handleQuickFill = (role: 'pro' | 'student' | 'admin') => {
    setErrorMessage('');
    setSuccessMessage('');
    if (role === 'admin') {
      setLoginEmail('admin@omegatraining.pro');
      setLoginPassword('Omega@Admin2026');
    } else if (role === 'pro') {
      setLoginEmail('nilson.coach@omegatraining.pro');
      setLoginPassword('treinador123');
    } else {
      setLoginEmail('marina.aluna@email.com');
      setLoginPassword('aluno123');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        activeTab === 'login'
          ? 'Acessar Conta Omega Training'
          : activeTab === 'register'
          ? 'Criar Nova Conta'
          : 'Recuperar Acesso'
      }
      description={
        activeTab === 'login'
          ? 'Informe seu e-mail e senha para acessar treinos, alunos e dietas.'
          : activeTab === 'register'
          ? 'Preencha seus dados para começar a usar a plataforma.'
          : 'Digite seu e-mail para receber as instruções de redefinição.'
      }
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-dark-700/60 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'login'
                ? 'bg-primary text-background shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'register'
                ? 'bg-primary text-background shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Error / Success Alerts */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: LOGIN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">E-mail</label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  required
                />
                <Mail className="absolute right-3 top-3 h-4 w-4 text-muted" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-foreground">Senha</label>
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot')}
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

            <Button type="submit" variant="primary" className="w-full flex items-center justify-center gap-2 mt-2">
              <span>Entrar no Omega Training</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            {/* Demo Quick-Fill Buttons */}
            <div className="pt-3 border-t border-border space-y-2">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block text-center">
                Acesso Rápido para Demonstração:
              </span>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFill('student')}
                  className="text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 justify-center py-2 px-1 border-primary/30 hover:bg-primary/10"
                >
                  <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">Aluno Demo</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFill('pro')}
                  className="text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 justify-center py-2 px-1 border-border hover:bg-card"
                >
                  <Dumbbell className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">Treinador Demo</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFill('admin')}
                  className="text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 justify-center py-2 px-1 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">Admin Demo</span>
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: REGISTER */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Tipo de Perfil</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole('student')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    regRole === 'student'
                      ? 'bg-primary/10 border-primary text-primary'
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
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-surface border-border text-muted hover:text-foreground'
                  }`}
                >
                  <Dumbbell className="h-4 w-4" />
                  <span>Treinador / Personal</span>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Nome Completo</label>
              <Input
                placeholder="Ex: João da Silva"
                value={regFullName}
                onChange={e => setRegFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">E-mail</label>
              <Input
                type="email"
                placeholder="joao@exemplo.com"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Senha (mínimo 6 dígitos)</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" variant="primary" className="w-full flex items-center justify-center gap-2 mt-2">
              <Sparkles className="h-4 w-4" />
              <span>Criar Conta e Acessar</span>
            </Button>
          </form>
        )}

        {/* TAB 3: FORGOT PASSWORD */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">E-mail Cadastrado</label>
              <Input
                type="email"
                placeholder="seu.email@exemplo.com"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Enviar Instruções de Redefinição
            </Button>

            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className="w-full text-center text-xs text-muted hover:text-foreground block pt-2"
            >
              Voltar para o Login
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
}
