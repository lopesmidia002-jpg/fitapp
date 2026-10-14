import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Bell, ShieldCheck, Dumbbell, UserCheck, Menu, X, Lock, LogIn, LogOut } from 'lucide-react';
import { UserRole } from '../../types';
import { AdminLoginModal } from '../auth/AdminLoginModal';
import { UserAuthModal } from '../auth/UserAuthModal';


export interface HeaderProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Header({ onToggleMobileMenu, isMobileMenuOpen }: HeaderProps) {
  const {
    currentUser,
    currentRole,
    switchRole,
    organization,
    notifications,
    markNotificationAsRead,
    isAdminAuthenticated,
    logoutAdmin,
    logoutUser,
  } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isUserAuthModalOpen, setIsUserAuthModalOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;


  return (
    <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      {/* Brand & Organization */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu Toggle Button (Coach only, hidden for superadmin) */}
        {currentRole !== 'student' && currentRole !== 'superadmin' && onToggleMobileMenu && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMobileMenu}
            className="md:hidden text-muted hover:text-foreground h-9 w-9 p-0 -ml-1"
            aria-label={isMobileMenuOpen ? "Fechar menu principal" : "Abrir menu principal"}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-primary" />
            ) : (
              <Menu className="h-5 w-5 text-foreground" />
            )}
          </Button>
        )}

        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="Omega Training" className="h-9 w-9 rounded-xl shadow-sm" />
          <span className="font-extrabold text-lg tracking-tight text-foreground hidden sm:inline-block">
            OMEGA <span className="text-primary font-black">TRAINING</span>
          </span>
        </div>

        <div className="hidden md:flex items-center h-5 w-px bg-border mx-2" />

        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-card border border-border text-foreground">
            {organization.name}
          </span>
        </div>
      </div>

      {/* Center/Right: Role Switcher Demo Bar & Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Student Environment Isolation Badge & Logout */}
        {currentRole === 'student' ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary shadow-xs">
              <UserCheck className="h-3.5 w-3.5" />
              <span>Ambiente do Aluno</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={logoutUser}
              className="text-xs h-8 px-2.5 border-border hover:bg-card flex items-center gap-1.5 text-muted hover:text-foreground"
              title="Encerrar sessão e sair do aplicativo"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        ) : (currentRole === 'pro' && ((typeof window !== 'undefined' && sessionStorage.getItem('omega_auth_role') === 'pro') || currentUser.id.startsWith('trainer-'))) ? (
          /* Dedicated Trainer Environment Isolation Badge & Logout */
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary shadow-xs">
              <Dumbbell className="h-3.5 w-3.5" />
              <span>Ambiente do Treinador</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={logoutUser}
              className="text-xs h-8 px-2.5 border-border hover:bg-card flex items-center gap-1.5 text-muted hover:text-foreground"
              title="Encerrar sessão do treinador"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        ) : (
          /* Multi-Role Switcher Bar (with Admin password lock) */
          <div className="flex items-center bg-card p-1 rounded-xl border border-border text-xs">
            <button
              type="button"
              onClick={() => switchRole('pro')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                currentRole === 'pro'
                  ? 'bg-primary text-background font-bold shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
              title="Alternar para visão do Treinador/Personal"
            >
              <Dumbbell className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Treinador</span>
            </button>

            <button
              type="button"
              onClick={() => switchRole('student')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                (currentRole as string) === 'student'
                  ? 'bg-primary text-background font-bold shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
              title="Alternar para visão do Aluno (Mobile PWA)"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Aluno</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (currentRole === 'superadmin') return;
                if (isAdminAuthenticated) {
                  switchRole('superadmin');
                } else {
                  setIsAdminLoginModalOpen(true);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                currentRole === 'superadmin'
                  ? 'bg-primary text-background font-bold shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
              title={isAdminAuthenticated ? "Alternar para visão Superadmin Global" : "Acessar painel Admin (Requer Senha)"}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Admin</span>
              {!isAdminAuthenticated && currentRole !== 'superadmin' && (
                <Lock className="h-2.5 w-2.5 opacity-60 ml-0.5" />
              )}
            </button>
          </div>
        )}

        {/* Superadmin Lock/Logout Button */}
        {currentRole === 'superadmin' && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={logoutAdmin}
            className="text-xs h-8 px-2.5 border-rose-500/30 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-1.5"
            title="Bloquear sessão e sair do Painel de Administrador"
          >
            <Lock className="h-3 w-3" />
            <span className="hidden md:inline">Sair do Admin</span>
          </Button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-muted hover:text-foreground"
            aria-label="Notificações"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-foreground">Notificações</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-primary/20 text-primary font-bold">
                      {unreadCount} novas
                    </span>
                  )}
                </div>
                <button
                  onClick={() => notifications.forEach(n => markNotificationAsRead(n.id))}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Marcar todas lidas
                </button>
              </div>

              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-muted text-center py-4">Nenhuma notificação no momento.</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                        notif.isRead
                          ? 'bg-surface/40 border-border/60 text-muted'
                          : 'bg-primary/5 border-primary/30 text-foreground'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold">{notif.title}</span>
                        {!notif.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-muted mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Current User Pill & Auth Launcher */}
        <button
          type="button"
          onClick={() => setIsUserAuthModalOpen(true)}
          className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl border-l border-border hover:bg-card/80 transition-all text-left group"
          title="Clique para entrar, criar conta ou trocar de usuário"
        >
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={currentUser.fullName}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/40 group-hover:ring-primary transition-all"
          />
          <div className="hidden lg:block text-left">
            <div className="flex items-center gap-1">
              <p className="text-xs font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                {currentUser.fullName}
              </p>
              <LogIn className="h-3 w-3 text-muted group-hover:text-primary transition-colors" />
            </div>
            <p className="text-[10px] text-muted capitalize">
              {currentUser.role === 'pro' ? 'Personal Trainer' : currentUser.role}
            </p>
          </div>
        </button>
      </div>

      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccess={() => switchRole('superadmin')}
      />

      <UserAuthModal
        isOpen={isUserAuthModalOpen}
        onClose={() => setIsUserAuthModalOpen(false)}
      />
    </header>
  );
}

