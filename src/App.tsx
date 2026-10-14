import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';

// Modules
import { DashboardView } from './modules/dashboard/DashboardView';
import { StudentsView } from './modules/students/StudentsView';
import { WorkoutsView } from './modules/workouts/WorkoutsView';
import { NutritionView } from './modules/nutrition/NutritionView';
import { AssessmentsView } from './modules/assessments/AssessmentsView';
import { CheckInsView } from './modules/checkins/CheckInsView';
import { InsightsView } from './modules/insights/InsightsView';
import { SuperAdminView } from './modules/superadmin/SuperAdminView';
import { StudentAppView } from './modules/student-app/StudentAppView';
import { TacoDietBuilderView } from './modules/nutrition/TacoDietBuilderView';
import { StudentAccessView } from './modules/students/StudentAccessView';

import { Lock, AlertTriangle, ShieldCheck, Phone, Mail, Key } from 'lucide-react';
import { Button } from './components/ui/Button';
import { AdminLoginModal } from './components/auth/AdminLoginModal';
import { InviteLoginGate } from './components/auth/InviteLoginGate';

export function App() {
  const {
    currentRole,
    currentUser,
    trainers,
    switchRole,
    theme,
    isAdminAuthenticated,
    pendingInviteAuth,
  } = useApp();

  // If user arrived via an invite link and needs to validate credentials
  if (pendingInviteAuth) {
    return <InviteLoginGate />;
  }

  // Check if current coach/trainer is blocked
  const currentTrainer = trainers.find(t => t.id === currentUser.id || t.email === currentUser.email);
  const isTrainerBlocked = (currentRole === 'pro' || currentRole === 'owner') && currentTrainer && (currentTrainer.accessBlocked || currentTrainer.status === 'blocked');

  // Tab states for Coach / Admin
  const [proTab, setProTab] = useState<string>('dashboard');

  // Tab states for Student Mobile
  const [studentTab, setStudentTab] = useState<string>('student-home');

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);

  return (
    <div
      data-theme="dark"
      className="min-h-screen flex flex-col transition-colors duration-200 dark bg-[#0B0D10] text-[#F5F7FA]"
    >
      {/* Top Header */}
      <Header
        onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Conditional Sidebar: Coach only */}
        {currentRole !== 'student' && currentRole !== 'superadmin' && (
          <Sidebar
            currentTab={proTab}
            onSelectTab={setProTab}
            isOpenMobile={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* SUPERADMIN VIEW */}
          {currentRole === 'superadmin' && (
            isAdminAuthenticated ? (
              <SuperAdminView />
            ) : (
              <div className="min-h-[70vh] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-card border border-rose-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-500 shadow-lg shadow-rose-500/10">
                    <Lock className="w-8 h-8" />
                  </div>

                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-3">
                    Acesso Restrito ao Superadmin
                  </span>

                  <h2 className="text-xl font-black text-foreground mb-2">
                    Painel Administrativo Bloqueado
                  </h2>

                  <p className="text-sm text-muted mb-6 leading-relaxed">
                    Esta área é restrita a administradores globais da plataforma. Por favor, autentique-se com seu login e senha mestre para desbloquear o console.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button
                      variant="primary"
                      onClick={() => setIsAdminAuthModalOpen(true)}
                      className="shadow-neon-sm font-bold text-xs flex items-center justify-center gap-2"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Inserir Login e Senha</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => switchRole('pro')}
                      className="text-xs font-bold"
                    >
                      Voltar ao Painel Pro
                    </Button>
                  </div>
                </div>
              </div>
            )
          )}

          {/* STUDENT MOBILE-FIRST VIEW */}
          {currentRole === 'student' && (
            <StudentAppView currentTab={studentTab} onSelectTab={setStudentTab} />
          )}

          {/* COACH / PRO VIEWS */}
          {currentRole !== 'student' && currentRole !== 'superadmin' && (
            isTrainerBlocked ? (
              <div className="min-h-[70vh] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-card border border-rose-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-500 shadow-lg shadow-rose-500/10">
                    <Lock className="w-8 h-8" />
                  </div>
                  
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-3">
                    Acesso de Treinador Suspenso
                  </span>

                  <h2 className="text-xl font-black text-foreground mb-2">
                    Acesso Profissional Bloqueado
                  </h2>

                  <p className="text-sm text-muted mb-4 leading-relaxed">
                    O acesso do professor <strong className="text-foreground">{currentTrainer?.fullName}</strong> ao ambiente profissional da <strong className="text-primary font-bold">Omega Training</strong> foi temporariamente suspenso pela administração.
                  </p>

                  {currentTrainer?.blockedReason && (
                    <div className="p-3.5 bg-rose-500/5 border border-rose-500/20 rounded-xl mb-6 text-left">
                      <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Motivo do Bloqueio:</span>
                      </div>
                      <div className="text-xs text-foreground/90 font-medium">
                        {currentTrainer.blockedReason}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t border-border">
                    <p className="text-xs text-muted mb-3">
                      Caso acredite que se trate de um equívoco, entre em contato com a coordenação ou mude de perfil abaixo:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => switchRole('superadmin')}
                        className="text-xs flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                        <span>Abrir Painel Admin</span>
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
                        className="text-xs flex items-center justify-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Falar com o Suporte</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {proTab === 'dashboard' && <DashboardView onNavigate={setProTab} />}
                {proTab === 'students' && <StudentsView />}
                {proTab === 'student-access' && <StudentAccessView />}
                {proTab === 'workouts' && <WorkoutsView />}
                {proTab === 'nutrition' && <NutritionView onNavigate={setProTab} />}
                {proTab === 'taco' && <TacoDietBuilderView onNavigate={setProTab} />}
                {proTab === 'assessments' && <AssessmentsView />}
                {proTab === 'checkins' && <CheckInsView />}
                {proTab === 'insights' && <InsightsView />}
              </>
            )
          )}
        </main>
      </div>

      {/* Student Mobile Bottom Navigation (shown on student view) */}
      {currentRole === 'student' && (
        <MobileNav currentTab={studentTab} onSelectTab={setStudentTab} />
      )}

      {/* Admin Login Modal for unlock gate */}
      <AdminLoginModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
      />
    </div>
  );
}

export default App;
