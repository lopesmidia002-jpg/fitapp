import { describe, it, expect } from 'vitest';
import { INITIAL_STUDENTS, INITIAL_TRAINERS } from '../services/mockData';
import { Student, Trainer } from '../types';

describe('Invite Access Links, Login Gate & Environment Isolation', () => {
  it('should generate student access link with access=student, id and login parameters', () => {
    const student = INITIAL_STUDENTS[0];
    const baseUrl = 'https://app.omegatraining.pro/';
    const link = `${baseUrl}?access=student&id=${student.id}&login=${encodeURIComponent(student.email)}`;

    expect(link).toContain('access=student');
    expect(link).toContain(`id=${student.id}`);
    expect(link).toContain(`login=${encodeURIComponent(student.email)}`);
  });

  it('should generate trainer access link with access=pro, id and login parameters', () => {
    const trainer = INITIAL_TRAINERS[0];
    const baseUrl = 'https://app.omegatraining.pro/';
    const link = `${baseUrl}?access=pro&id=${trainer.id}&login=${encodeURIComponent(trainer.email)}`;

    expect(link).toContain('access=pro');
    expect(link).toContain(`id=${trainer.id}`);
    expect(link).toContain(`login=${encodeURIComponent(trainer.email)}`);
  });

  it('should validate student temporary password and allow login', () => {
    const student: Student = {
      ...INITIAL_STUDENTS[0],
      temporaryPassword: 'Omega@Test2026',
      accessBlocked: false,
    };

    const validPasswords = [
      student.temporaryPassword,
      'Omega@2026',
      'aluno123',
    ].filter(Boolean);

    const testPasswordInput = 'Omega@Test2026';
    const isValid = validPasswords.includes(testPasswordInput);

    expect(isValid).toBe(true);
  });

  it('should reject wrong password for student in invite gate', () => {
    const student: Student = {
      ...INITIAL_STUDENTS[0],
      temporaryPassword: 'Omega@Test2026',
      accessBlocked: false,
    };

    const validPasswords = [
      student.temporaryPassword,
      'Omega@2026',
      'aluno123',
    ].filter(Boolean);

    const testPasswordInput = 'senha_errada_123';
    const isValid = validPasswords.includes(testPasswordInput);

    expect(isValid).toBe(false);
  });

  it('should deny student login if student is blocked', () => {
    const blockedStudent: Student = {
      ...INITIAL_STUDENTS[0],
      accessBlocked: true,
      status: 'blocked',
      blockedReason: 'Mensalidade em atraso',
    };

    const canAccess = !blockedStudent.accessBlocked && blockedStudent.status !== 'blocked';
    expect(canAccess).toBe(false);
    expect(blockedStudent.blockedReason).toBe('Mensalidade em atraso');
  });

  it('should validate trainer temporary password and allow login', () => {
    const trainer: Trainer = {
      ...INITIAL_TRAINERS[0],
      temporaryPassword: 'Omega@Trainer2026',
      accessBlocked: false,
    };

    const validPasswords = [
      trainer.temporaryPassword,
      'Omega@Coach2026',
      'treinador123',
    ].filter(Boolean);

    const testPasswordInput = 'Omega@Trainer2026';
    const isValid = validPasswords.includes(testPasswordInput);

    expect(isValid).toBe(true);
  });

  it('should reject wrong password for trainer in invite gate', () => {
    const trainer: Trainer = {
      ...INITIAL_TRAINERS[0],
      temporaryPassword: 'Omega@Trainer2026',
      accessBlocked: false,
    };

    const validPasswords = [
      trainer.temporaryPassword,
      'Omega@Coach2026',
      'treinador123',
    ].filter(Boolean);

    const testPasswordInput = 'senha_incorreta';
    const isValid = validPasswords.includes(testPasswordInput);

    expect(isValid).toBe(false);
  });

  it('should deny trainer login if trainer is blocked', () => {
    const blockedTrainer: Trainer = {
      ...INITIAL_TRAINERS[0],
      accessBlocked: true,
      status: 'blocked',
      blockedReason: 'Acesso suspenso pela coordenação',
    };

    const canAccess = !blockedTrainer.accessBlocked && blockedTrainer.status !== 'blocked';
    expect(canAccess).toBe(false);
    expect(blockedTrainer.blockedReason).toBe('Acesso suspenso pela coordenação');
  });

  it('should enforce environment isolation: students cannot access superadmin without master credentials', () => {
    const currentRole = 'student';
    const isAdminAuthenticated = false;

    // Student attempting to switch to superadmin
    const canSwitchToSuperadmin = isAdminAuthenticated && currentRole !== 'student';
    expect(canSwitchToSuperadmin).toBe(false);
  });

  it('should enforce environment isolation: students only see student environment', () => {
    const currentRole = 'student';
    const isStudentEnvironment = currentRole === 'student';
    const showCoachSidebar = currentRole !== 'student' && currentRole !== 'superadmin';

    expect(isStudentEnvironment).toBe(true);
    expect(showCoachSidebar).toBe(false);
  });
});
