import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Lock, Eye, EyeOff, AlertTriangle, ShieldCheck, Sparkles, Key } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const { loginAdmin, adminCredentials } = useApp();

  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginInput.trim() || !passwordInput) {
      setErrorMessage('Por favor informe o login e a senha de administrador.');
      return;
    }

    const success = loginAdmin(loginInput, passwordInput);
    if (success) {
      setErrorMessage(null);
      setLoginInput('');
      setPasswordInput('');
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setErrorMessage('Login ou senha incorretos. Verifique suas credenciais de superadministrador.');
    }
  };

  const handleFillDemoCredentials = () => {
    setLoginInput(adminCredentials.email || 'admin@omegatraining.pro');
    setPasswordInput(adminCredentials.password || 'Omega@Admin2026');
    setErrorMessage(null);
  };

  const handleClose = () => {
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-md bg-card border border-border p-6 rounded-3xl shadow-2xl"
    >
      <div className="space-y-6">
        {/* Header with Icon */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-500 shadow-lg shadow-rose-500/10">
            <Lock className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Acesso Restrito — Superadmin</span>
          </div>

          <h3 className="text-xl font-black text-foreground tracking-tight">
            Login do Painel Administrativo
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Área de governança e configurações globais da <strong className="text-foreground">Omega Training</strong>. Digite seu login e senha mestre para continuar.
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2 animate-in fade-in duration-150">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Login ou E-mail do Administrador
            </label>
            <Input
              type="text"
              autoComplete="username"
              placeholder="Ex: admin@omegatraining.pro ou admin"
              value={loginInput}
              onChange={(e) => {
                setLoginInput(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="bg-surface border-border text-sm"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                Senha de Acesso
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? 'Ocultar' : 'Exibir'}</span>
              </button>
            </div>

            <Input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Digite a senha master"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="bg-surface border-border text-sm font-mono tracking-wider"
            />
          </div>

          {/* Quick Credential Box */}
          <div className="p-3 bg-surface/80 border border-border rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" /> Credenciais Padrão:
              </span>
              <button
                type="button"
                onClick={handleFillDemoCredentials}
                className="text-[11px] font-bold text-primary hover:underline"
              >
                Preencher Automaticamente
              </button>
            </div>
            <div className="text-[11px] text-foreground font-mono bg-card px-2.5 py-1.5 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span><strong>Login:</strong> admin@omegatraining.pro</span>
              <span><strong>Senha:</strong> {adminCredentials.password || 'Omega@Admin2026'}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="text-xs font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="text-xs font-bold shadow-neon-sm flex items-center gap-2"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Acessar Painel Admin</span>
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
