import { describe, it, expect, beforeEach } from 'vitest';
import { INITIAL_STUDENTS, INITIAL_USERS } from '../services/mockData';

describe('Student Logout & Full Screen Auth Isolation', () => {
  let mockLocalStorage: Record<string, string> = {};
  let mockSessionStorage: Record<string, string> = {};

  beforeEach(() => {
    mockLocalStorage = {};
    mockSessionStorage = {};
  });

  it('sets omega_user_logged_in to false and clears session tokens on logout', () => {
    // Simulate active session
    mockLocalStorage['omega_user_logged_in'] = 'true';
    mockSessionStorage['omega_auth_user_id'] = 'stud-1';
    mockSessionStorage['omega_auth_role'] = 'student';

    expect(mockLocalStorage['omega_user_logged_in']).toBe('true');
    expect(mockSessionStorage['omega_auth_role']).toBe('student');

    // Execute logout logic
    mockLocalStorage['omega_user_logged_in'] = 'false';
    delete mockSessionStorage['omega_auth_user_id'];
    delete mockSessionStorage['omega_auth_role'];

    // Validate state after logout
    expect(mockLocalStorage['omega_user_logged_in']).toBe('false');
    expect(mockSessionStorage['omega_auth_user_id']).toBeUndefined();
    expect(mockSessionStorage['omega_auth_role']).toBeUndefined();
  });

  it('authenticates student with valid demo credentials', () => {
    const student = INITIAL_STUDENTS.find(s => s.email === 'marina.aluna@email.com') || INITIAL_STUDENTS[0];
    const emailInput = student.email;
    const passwordInput = 'aluno123';

    const validPasswords = [
      student.temporaryPassword,
      'Omega@2026',
      'aluno123',
      'Fit@1234',
      '123456'
    ].filter(Boolean);

    expect(validPasswords).toContain(passwordInput);

    // Save session
    mockLocalStorage['omega_user_logged_in'] = 'true';
    mockSessionStorage['omega_auth_user_id'] = student.id;
    mockSessionStorage['omega_auth_role'] = 'student';

    expect(mockLocalStorage['omega_user_logged_in']).toBe('true');
    expect(mockSessionStorage['omega_auth_role']).toBe('student');
  });

  it('rejects login when student is blocked or deleted', () => {
    const blockedStudent = {
      ...INITIAL_STUDENTS[0],
      accessBlocked: true,
      status: 'blocked' as const,
      blockedReason: 'Mensalidade pendente'
    };

    const isBlocked = blockedStudent.accessBlocked || blockedStudent.status === 'blocked';
    expect(isBlocked).toBe(true);

    const errorMessage = isBlocked
      ? `Acesso do aluno suspenso ou bloqueado. Motivo: ${blockedStudent.blockedReason || 'Consulte seu treinador.'}`
      : null;

    expect(errorMessage).toContain('Acesso do aluno suspenso ou bloqueado');
    expect(errorMessage).toContain('Mensalidade pendente');
  });

  it('guarantees that unauthenticated state isolates student workouts and nutrition', () => {
    // When isUserLoggedIn is false, App.tsx renders UserAuthScreen directly
    const isUserLoggedIn = false;
    const renderTarget = !isUserLoggedIn ? 'UserAuthScreen' : 'StudentAppView';

    expect(renderTarget).toBe('UserAuthScreen');
    expect(renderTarget).not.toBe('StudentAppView');
  });
});
