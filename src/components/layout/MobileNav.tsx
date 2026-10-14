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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-lg border-t border-border px-3 py-2 flex items-center justify-around md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 ${
              isActive
                ? 'text-primary scale-105'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted'}`} />
            <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'text-primary font-bold' : 'text-muted'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
