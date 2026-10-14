import { describe, it, expect } from 'vitest';

interface StudentActivityCheck {
  studentId: string;
  studentName: string;
  lastActiveDate: string;
}

export function detectInactivityRisk(student: StudentActivityCheck, referenceDate: Date = new Date()): boolean {
  const lastActive = new Date(student.lastActiveDate);
  const diffDays = Math.floor((referenceDate.getTime() - lastActive.getTime()) / (1000 * 3600 * 24));
  return diffDays >= 7;
}

describe('Omega Insights Deterministic Engine', () => {
  it('should flag student as retention risk if inactive for 7 or more days', () => {
    const today = new Date('2026-10-14T10:00:00Z');

    const activeStudent: StudentActivityCheck = {
      studentId: 'stud-1',
      studentName: 'Marina Rocha',
      lastActiveDate: '2026-10-13T18:00:00Z', // 1 day ago
    };

    const inactiveStudent: StudentActivityCheck = {
      studentId: 'stud-3',
      studentName: 'Fernanda Albuquerque',
      lastActiveDate: '2026-10-02T19:00:00Z', // 12 days ago
    };

    expect(detectInactivityRisk(activeStudent, today)).toBe(false);
    expect(detectInactivityRisk(inactiveStudent, today)).toBe(true);
  });
});
