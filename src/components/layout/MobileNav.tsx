import React from 'react';
import { Home, Dumbbell, Utensils, LineChart, User } from 'lucide-react';

interface MobileNavProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
}

export function MobileNav({ currentTab, onSelectTab }: MobileNavProps) {
  const navItems = [
    { id: 'student-home', label: 'Início', icon: Home },
    { id: 'student-workouts', label: 'Treinos', icon: Dumbbell },
    { id: 'student-nutrition', label: 'Alimentação', icon: Utensils },
    { id: 'student-evolution', label: 'Evolução', icon: LineChart },
    { id: 'student-profile', label: 'Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-lg border-t border-border px-1 sm:px-3 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around md:hidden max-w-full">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id)}
            id={`mobile-nav-${item.id}`}
            className={`flex-1 min-w-0 max-w-[20%] flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-150 ${
              isActive
                ? 'text-primary scale-105'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary' : 'text-muted'}`} />
            <span className={`text-[10px] mt-1 font-semibold truncate max-w-full text-center ${isActive ? 'text-primary font-bold' : 'text-muted'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
