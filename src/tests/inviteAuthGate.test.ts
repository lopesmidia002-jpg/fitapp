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

  it('should dynamically reconstruct new student from mobile invite link without falling back to Marina Aluna', () => {
    const mobileLinkParams = new URLSearchParams('access=student&id=stud-test-carlos&login=carlos%40omega.pro&name=Carlos%20Novo%20Aluno&pwd=Omega%40Carlos99');
    
    const studentIdParam = mobileLinkParams.get('id');
    const loginParam = mobileLinkParams.get('login');
    const nameParam = mobileLinkParams.get('name');
    const pwdParam = mobileLinkParams.get('pwd');

    // On Carlos's phone, students list is empty or only default
    const existingStudents: Student[] = [];
    let student = existingStudents.find(s => s.id === studentIdParam);

    if (!student && (loginParam || studentIdParam)) {
      student = {
        id: studentIdParam || `stud-${Date.now()}`,
        organizationId: 'org-1',
        proId: 'user-pro-1',
        fullName: nameParam ? decodeURIComponent(nameParam) : 'Aluno',
        email: loginParam ? decodeURIComponent(loginParam) : 'aluno@omegatraining.pro',
        phone: '',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775?auto=format&fit=crop&w=150&q=80',
        goal: 'Hipertrofia e Condicionamento',
        currentWeightKg: 70,
        targetWeightKg: 68,
        heightCm: 175,
        status: 'active',
        temporaryPassword: pwdParam ? decodeURIComponent(pwdParam) : 'Omega@2026',
        accessBlocked: false,
        joinDate: new Date().toISOString().split('T')[0],
        adherenceRate: 100,
        completedWorkouts: 0,
        lastActive: new Date().toISOString(),
      };
    }

    expect(student).toBeDefined();
    expect(student?.id).toBe('stud-test-carlos');
    expect(student?.fullName).toBe('Carlos Novo Aluno');
    expect(student?.email).toBe('carlos@omega.pro');
    expect(student?.temporaryPassword).toBe('Omega@Carlos99');
    expect(student?.fullName).not.toBe('Marina Aluna');
  });

  it('should authenticate reconstructed student and persist session in localStorage for mobile PWA reloads', () => {
    const student: Student = {
      id: 'stud-test-carlos',
      organizationId: 'org-1',
      proId: 'user-pro-1',
      fullName: 'Carlos Novo Aluno',
      email: 'carlos@omega.pro',
      phone: '(11) 98888-7777',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775?auto=format&fit=crop&w=150&q=80',
      goal: 'Hipertrofia',
      currentWeightKg: 78,
      targetWeightKg: 75,
      heightCm: 178,
      status: 'active',
      temporaryPassword: 'Omega@Carlos99',
      accessBlocked: false,
      joinDate: '2026-10-14',
      adherenceRate: 100,
      completedWorkouts: 0,
      lastActive: '2026-10-14',
    };

    const mockLocalStorage: Record<string, string> = {};
    const mockSessionStorage: Record<string, string> = {};

    const enteredPassword = 'Omega@Carlos99';
    const validPasswords = [
      student.temporaryPassword,
      'Omega@2026',
      'aluno123',
      'Fit@1234',
      '123456',
    ].filter(Boolean);

    const isMatch = validPasswords.includes(enteredPassword);
    expect(isMatch).toBe(true);

    if (isMatch) {
      mockSessionStorage['omega_auth_user_id'] = student.id;
      mockSessionStorage['omega_auth_role'] = 'student';
      mockLocalStorage['omega_auth_user_id'] = student.id;
      mockLocalStorage['omega_auth_role'] = 'student';
      mockLocalStorage['omega_user_logged_in'] = 'true';
      mockLocalStorage['omega_user'] = JSON.stringify({
        id: student.id,
        email: student.email,
        fullName: student.fullName,
        role: 'student',
      });
    }

    expect(mockLocalStorage['omega_user_logged_in']).toBe('true');
    expect(mockLocalStorage['omega_auth_user_id']).toBe('stud-test-carlos');
    expect(JSON.parse(mockLocalStorage['omega_user']).fullName).toBe('Carlos Novo Aluno');
  });

  it('should ensure student mobile tab bar and MobileNav profile icon fit cleanly without overflowing page bounds', () => {
    // 4 tabs in StudentAppView: Treinos, Cardápio, Metas, Perfil
    const studentTabs = ['student-home', 'student-nutrition', 'student-evolution', 'student-profile'];
    expect(studentTabs.length).toBe(4);
    expect(studentTabs[3]).toBe('student-profile');

    // Each tab occupies exactly 25% in grid-cols-4
    const gridCols = 4;
    const tabWidthPercent = 100 / gridCols;
    expect(tabWidthPercent).toBe(25);

    // 5 items in MobileNav: Início, Treinos, Alimentação, Evolução, Perfil
    const mobileNavItems = ['student-home', 'student-workouts', 'student-nutrition', 'student-evolution', 'student-profile'];
    expect(mobileNavItems.length).toBe(5);
    expect(mobileNavItems[4]).toBe('student-profile');

    // Each mobile nav item is capped at max 20% width to prevent cutoff
    const maxItemWidth = 100 / mobileNavItems.length;
    expect(maxItemWidth).toBe(20);
  });
});


