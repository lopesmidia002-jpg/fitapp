import React from 'react';
import {
  LayoutDashboard,
  Users,
  Key,
  Dumbbell,
  Utensils,
  LineChart,
  ClipboardCheck,
  Sparkles,
  Settings,
  X,
  BookOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';

export interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ currentTab, onSelectTab, isOpenMobile = false, onCloseMobile }: SidebarProps) {
  const { insights, students } = useApp();
  const activeInsightsCount = insights.filter(i => i.status === 'active').length;

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Alunos (CRM)', icon: Users, badge: students.length.toString() },
    { id: 'student-access', label: 'Cadastramento & Acesso de Alunos', icon: Key, badge: students.length.toString() },
    { id: 'workouts', label: 'Treinos & Exercícios', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrição & Dietas', icon: Utensils },
    { id: 'taco', label: 'Tabela TACO', icon: BookOpen },
    { id: 'assessments', label: 'Avaliações Físicas', icon: LineChart },
    { id: 'checkins', label: 'Metas & Check-ins', icon: ClipboardCheck },
    { id: 'insights', label: 'Omega Insights', icon: Sparkles, badge: activeInsightsCount > 0 ? activeInsightsCount : undefined, badgeColor: 'bg-primary text-background' },
  ];

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full">
      <div className="p-4 space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-muted uppercase tracking-wider mb-2">
            Menu Principal
          </p>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-primary text-background shadow-neon-sm font-bold'
                    : 'text-muted hover:text-foreground hover:bg-card'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-background' : 'text-muted'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                      isActive
                        ? 'bg-background text-primary'
                        : item.badgeColor || 'bg-card text-muted border border-border'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Static Sidebar */}
      <aside className="w-64 border-r border-border bg-surface/50 flex flex-col justify-between hidden md:flex shrink-0">
        {navContent}
      </aside>

      {/* 2. Mobile Drawer Mode (When open) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu principal de navegação"
            className="relative z-10 w-72 max-w-[85vw] bg-card border-r border-border flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200 h-full overflow-y-auto"
          >
            {/* Drawer Header with Close Button */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="Omega Training" className="h-7 w-7 rounded-lg" />
                <span className="font-extrabold text-sm tracking-tight text-foreground">
                  OMEGA <span className="text-primary font-black">TRAINING</span>
                </span>
              </div>

              {onCloseMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onCloseMobile}
                  className="h-8 w-8 text-muted hover:text-foreground"
                  aria-label="Fechar menu"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Drawer Nav Items */}
            <div className="flex-1 overflow-y-auto">
              {navContent}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
