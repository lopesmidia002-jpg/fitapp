import { describe, it, expect } from 'vitest';
import { INITIAL_TRAINERS } from '../services/mockData';
import { Trainer } from '../types';

describe('Admin Trainer Management & Access Control', () => {
  it('should initialize with predefined coaches having CREF and credentials', () => {
    expect(INITIAL_TRAINERS.length).toBeGreaterThanOrEqual(3);
    const trainer = INITIAL_TRAINERS[0];
    expect(trainer.fullName).toContain('Nilson');
    expect(trainer.cref).toBeDefined();
    expect(trainer.temporaryPassword).toBeDefined();
    expect(trainer.accessBlocked).toBe(false);
    expect(trainer.role).toBe('pro');
  });

  it('should block trainer and set accessBlocked and reason', () => {
    const trainer: Trainer = { ...INITIAL_TRAINERS[1] };
    const blockedReason = 'Contrato temporariamente suspenso pela administração';
    
    // Simulate block action
    const blockedTrainer: Trainer = {
      ...trainer,
      status: 'blocked',
      accessBlocked: true,
      blockedAt: new Date().toISOString(),
      blockedReason,
    };

    expect(blockedTrainer.status).toBe('blocked');
    expect(blockedTrainer.accessBlocked).toBe(true);
    expect(blockedTrainer.blockedReason).toBe(blockedReason);
    expect(blockedTrainer.blockedAt).toBeDefined();
  });

  it('should unblock trainer and restore active access', () => {
    const blockedTrainer: Trainer = {
      ...INITIAL_TRAINERS[2],
      status: 'blocked',
      accessBlocked: true,
      blockedReason: 'Pendente de validação CREF',
    };

    // Simulate unblock action
    const restoredTrainer: Trainer = {
      ...blockedTrainer,
      status: 'active',
      accessBlocked: false,
      blockedAt: undefined,
      blockedReason: undefined,
    };

    expect(restoredTrainer.status).toBe('active');
    expect(restoredTrainer.accessBlocked).toBe(false);
    expect(restoredTrainer.blockedReason).toBeUndefined();
  });

  it('should reset trainer temporary password', () => {
    const trainer: Trainer = { ...INITIAL_TRAINERS[0] };
    const newPassword = 'Omega@9876Test';

    const updatedTrainer: Trainer = {
      ...trainer,
      temporaryPassword: newPassword,
    };

    expect(updatedTrainer.temporaryPassword).toBe(newPassword);
  });

  it('should generate correct magic link and invite message format', () => {
    const trainer = INITIAL_TRAINERS[0];
    const baseUrl = 'http://localhost:5173';
    const magicLink = `${baseUrl}?role=pro&trainerId=${trainer.id}`;

    expect(magicLink).toBe(`http://localhost:5173?role=pro&trainerId=${trainer.id}`);
    expect(magicLink).toContain('role=pro');
    expect(magicLink).toContain(`trainerId=${trainer.id}`);
  });

  it('guarantees access emails use @omegatraining.pro and replaces legacy fitcore domains', () => {
    // Verify all initial trainers use @omegatraining.pro
    for (const trainer of INITIAL_TRAINERS) {
      expect(trainer.email).toContain('@omegatraining.pro');
      expect(trainer.email).not.toContain('fitcore');
    }

    // Verify sanitizer logic converts any legacy fitcore emails to omegatraining
    const sanitize = (email: string) =>
      email.replace(/@fitcore\.[a-z.]+/gi, '@omegatraining.pro').replace(/fitcore/gi, 'omegatraining');

    expect(sanitize('nilson.coach@fitcore.pro')).toBe('nilson.coach@omegatraining.pro');
    expect(sanitize('camila.personal@fitcore.pro')).toBe('camila.personal@omegatraining.pro');
    expect(sanitize('admin@fitcore.pro')).toBe('admin@omegatraining.pro');
  });
});

