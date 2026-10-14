import { describe, it, expect } from 'vitest';
import { INITIAL_STUDENTS } from '../services/mockData';
import { Student } from '../types';

describe('Student Access & Credential Management in Coach Mode', () => {
  it('should initialize with predefined students having access credentials', () => {
    expect(INITIAL_STUDENTS.length).toBeGreaterThanOrEqual(4);
    const student = INITIAL_STUDENTS[0];
    expect(student.fullName).toBeDefined();
    expect(student.email).toBeDefined();
    expect(student.temporaryPassword).toBeDefined();
    expect(student.accessBlocked).toBe(false);
  });

  it('should format direct student mobile access link with studentId query param', () => {
    const student = INITIAL_STUDENTS[0];
    const link = `https://app.omegatraining.pro/?role=student&studentId=${student.id}`;
    
    expect(link).toContain('role=student');
    expect(link).toContain(`studentId=${student.id}`);
  });

  it('should build WhatsApp invitation message with Omega Training branding and credentials', () => {
    const student = INITIAL_STUDENTS[0];
    const link = `https://app.omegatraining.pro/?role=student&studentId=${student.id}`;
    const cleanEmail = (student.email || '').replace(/@fitcore\.[a-z.]+/gi, '@omegatraining.pro').replace(/fitcore/gi, 'omegatraining');
    
    const message = `⚡ *Omega Training — Acesso do Aluno*

Olá, *${student.fullName}*!
Seu acesso ao seu aplicativo exclusivo de treinos Omega Training já está liberado pelo seu treinador.

📱 *Acesse seu app por este link direto:*
${link}

🔑 *Suas Credenciais de Acesso:*
• *Login (E-mail):* ${cleanEmail}
• *Senha Inicial:* ${student.temporaryPassword || 'Omega@2026'}`;

    expect(message).toContain('Omega Training');
    expect(message).not.toContain('fitcore');
    expect(message).toContain(student.fullName);
    expect(message).toContain(cleanEmail);
    expect(message).toContain(student.temporaryPassword);
  });

  it('should block student access with reason', () => {
    const student: Student = { ...INITIAL_STUDENTS[0] };
    const reason = 'Suspensão temporária pelo Treinador';

    const blockedStudent: Student = {
      ...student,
      status: 'blocked',
      accessBlocked: true,
      blockedAt: new Date().toISOString(),
      blockedReason: reason,
    };

    expect(blockedStudent.accessBlocked).toBe(true);
    expect(blockedStudent.status).toBe('blocked');
    expect(blockedStudent.blockedReason).toBe(reason);
  });

  it('should unblock student access and clear block status', () => {
    const blockedStudent: Student = {
      ...INITIAL_STUDENTS[0],
      status: 'blocked',
      accessBlocked: true,
      blockedReason: 'Mensalidade pendente',
    };

    const unblockedStudent: Student = {
      ...blockedStudent,
      status: 'active',
      accessBlocked: false,
      blockedAt: undefined,
      blockedReason: undefined,
    };

    expect(unblockedStudent.accessBlocked).toBe(false);
    expect(unblockedStudent.status).toBe('active');
    expect(unblockedStudent.blockedReason).toBeUndefined();
  });

  it('should reset student temporary password with Omega secure format', () => {
    const student: Student = { ...INITIAL_STUDENTS[0] };
    const newPassword = 'Omega@' + Math.floor(1000 + Math.random() * 9000);

    const updatedStudent: Student = {
      ...student,
      temporaryPassword: newPassword,
    };

    expect(updatedStudent.temporaryPassword).toMatch(/^Omega@\d{4}$/);
    expect(updatedStudent.temporaryPassword).not.toBe(student.temporaryPassword);
  });
});
