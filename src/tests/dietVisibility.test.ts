import { describe, it, expect } from 'vitest';
import { NutritionPlan } from '../types';

describe('Diet Visibility Logic for Students', () => {
  const initialPlans: NutritionPlan[] = [
    {
      id: 'plan-1',
      organizationId: 'org-1',
      studentId: 'stud-1',
      proId: 'pro-1',
      title: 'Plano Hipertrofia Limpa',
      targetCalories: 2600,
      targetProteinG: 160,
      targetCarbsG: 280,
      targetFatsG: 70,
      waterIntakeMl: 3500,
      validUntil: '2026-12-31',
      meals: [],
      isHiddenForStudent: false,
    },
    {
      id: 'plan-2',
      organizationId: 'org-1',
      studentId: 'stud-2',
      proId: 'pro-1',
      title: 'Plano Definição e Queima',
      targetCalories: 1850,
      targetProteinG: 140,
      targetCarbsG: 160,
      targetFatsG: 50,
      waterIntakeMl: 3000,
      validUntil: '2026-12-31',
      meals: [],
      isHiddenForStudent: true,
    }
  ];

  it('should toggle isHiddenForStudent for a plan by plan id', () => {
    let plans = [...initialPlans];

    const toggleDietVisibility = (idOrStudentId: string) => {
      plans = plans.map(p => {
        if (p.id === idOrStudentId || p.studentId === idOrStudentId) {
          return { ...p, isHiddenForStudent: !p.isHiddenForStudent };
        }
        return p;
      });
    };

    // Toggle plan-1 from false -> true (hidden)
    toggleDietVisibility('plan-1');
    expect(plans.find(p => p.id === 'plan-1')?.isHiddenForStudent).toBe(true);

    // Toggle back from true -> false (visible)
    toggleDietVisibility('plan-1');
    expect(plans.find(p => p.id === 'plan-1')?.isHiddenForStudent).toBe(false);
  });

  it('should toggle isHiddenForStudent for a plan by student id', () => {
    let plans = [...initialPlans];

    const toggleDietVisibility = (idOrStudentId: string) => {
      plans = plans.map(p => {
        if (p.id === idOrStudentId || p.studentId === idOrStudentId) {
          return { ...p, isHiddenForStudent: !p.isHiddenForStudent };
        }
        return p;
      });
    };

    // Toggle plan-2 via student id 'stud-2' (was true -> becomes false)
    toggleDietVisibility('stud-2');
    expect(plans.find(p => p.studentId === 'stud-2')?.isHiddenForStudent).toBe(false);
  });

  it('should preserve isHiddenForStudent in JSON serialization', () => {
    const serialized = JSON.stringify(initialPlans);
    const parsed: NutritionPlan[] = JSON.parse(serialized);

    expect(parsed[0].isHiddenForStudent).toBe(false);
    expect(parsed[1].isHiddenForStudent).toBe(true);
  });
});
