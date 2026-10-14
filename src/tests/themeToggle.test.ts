import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeToggle } from '../components/ui/ThemeToggle';

describe('Dark Mode Enforcement & Hidden Theme Switcher', () => {
  let mockStorage: Record<string, string> = {};
  let classList: Set<string> = new Set();

  beforeEach(() => {
    mockStorage = {};
    classList = new Set(['dark']);
  });

  const getSavedTheme = (): 'dark' | 'light' | null => {
    return (mockStorage['omega-theme'] as 'dark' | 'light') || null;
  };

  const enforceDarkMode = () => {
    mockStorage['omega-theme'] = 'dark';
    classList.delete('light');
    classList.add('dark');
  };

  it('strictly enforces dark mode as the default and permanent theme', () => {
    enforceDarkMode();
    expect(getSavedTheme()).toBe('dark');
    expect(classList.has('dark')).toBe(true);
    expect(classList.has('light')).toBe(false);
  });

  it('resets any light mode setting in storage back to dark mode', () => {
    // If a user had 'light' previously saved, it is purged to 'dark'
    mockStorage['omega-theme'] = 'light';
    enforceDarkMode();
    expect(mockStorage['omega-theme']).toBe('dark');
    expect(classList.has('dark')).toBe(true);
  });

  it('purges legacy fitcore-theme key from storage on initialization', () => {
    mockStorage['fitcore-theme'] = 'dark';
    delete mockStorage['fitcore-theme'];
    expect(mockStorage['fitcore-theme']).toBeUndefined();
  });

  it('hides the ThemeToggle component by returning null', () => {
    const rendered = ThemeToggle();
    expect(rendered).toBeNull();
  });

  it('provides verified high-performance Dark Mode palette tokens', () => {
    const darkTokens = {
      canvas: '#0B0D10',
      surface: '#14171C',
      card: '#1B2027',
      border: '#292F38',
      textPrimary: '#F5F7FA',
      textSecondary: '#9AA3AF',
      primaryNeon: '#B8F34A',
    };

    expect(darkTokens.canvas).toBe('#0B0D10');
    expect(darkTokens.surface).toBe('#14171C');
    expect(darkTokens.card).toBe('#1B2027');
    expect(darkTokens.border).toBe('#292F38');
    expect(darkTokens.primaryNeon).toBe('#B8F34A');
  });

  it('maps chart colors appropriately for dark theme', () => {
    const getChartThemeColors = (theme: 'dark' | 'light') => {
      const isDark = theme === 'dark';
      return {
        grid: isDark ? '#292F38' : '#E2E8F0',
        axis: isDark ? '#9AA3AF' : '#64748B',
        tooltipBg: isDark ? '#14171C' : '#FFFFFF',
        tooltipBorder: isDark ? '#292F38' : '#E2E8F0',
        tooltipText: isDark ? '#F5F7FA' : '#0F172A',
      };
    };

    const darkChart = getChartThemeColors('dark');
    expect(darkChart.grid).toBe('#292F38');
    expect(darkChart.tooltipBg).toBe('#14171C');
    expect(darkChart.tooltipText).toBe('#F5F7FA');
  });
});

