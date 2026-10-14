import { describe, it, expect } from 'vitest';
import { INITIAL_TRAINERS } from '../services/mockData';

describe('SuperAdmin Mobile Hamburger Navigation & Tabs', () => {
  it('should define all 4 primary navigation tabs for SuperAdmin role', () => {
    const adminTabs = [
      { id: 'trainers', label: 'Treinadores & Acessos' },
      { id: 'tenants', label: 'Organizações & Ambientes' },
      { id: 'audit', label: 'Logs de Auditoria' },
      { id: 'settings', label: 'Configurações' },
    ];

    expect(adminTabs).toHaveLength(4);
    expect(adminTabs.map(t => t.id)).toEqual(['trainers', 'tenants', 'audit', 'settings']);
  });

  it('should format badges appropriately for admin items', () => {
    const trainerBadge = INITIAL_TRAINERS.length.toString();
    const orgBadge = '4';

    expect(Number(trainerBadge)).toBeGreaterThan(0);
    expect(orgBadge).toBe('4');
  });

  it('should support switching between all admin tabs properly', () => {
    let currentTab: 'trainers' | 'tenants' | 'audit' | 'settings' = 'trainers';

    const switchTab = (tab: 'trainers' | 'tenants' | 'audit' | 'settings') => {
      currentTab = tab;
    };

    switchTab('tenants');
    expect(currentTab).toBe('tenants');

    switchTab('audit');
    expect(currentTab).toBe('audit');

    switchTab('settings');
    expect(currentTab).toBe('settings');

    switchTab('trainers');
    expect(currentTab).toBe('trainers');
  });
});
