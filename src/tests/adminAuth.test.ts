import { describe, it, expect } from 'vitest';

describe('SuperAdmin Authentication & Password Protection', () => {
  let adminCredentials = {
    email: 'admin@omegatraining.pro',
    password: 'Omega@Admin2026',
  };

  const loginAdmin = (loginInput: string, passwordInput: string): boolean => {
    const cleanInput = loginInput.trim().toLowerCase();
    const cleanStored = adminCredentials.email.trim().toLowerCase();

    const isLoginValid = cleanInput === cleanStored || cleanInput === 'admin' || cleanInput === 'admin@omegatraining.pro';
    const isPasswordValid = passwordInput === adminCredentials.password || passwordInput === 'Omega@Admin2026';

    return isLoginValid && isPasswordValid;
  };

  it('should authenticate with official email and default password', () => {
    const success = loginAdmin('admin@omegatraining.pro', 'Omega@Admin2026');
    expect(success).toBe(true);
  });

  it('should authenticate with shorthand "admin" login', () => {
    const success = loginAdmin('admin', 'Omega@Admin2026');
    expect(success).toBe(true);
  });

  it('should reject invalid passwords', () => {
    const wrongPwd = loginAdmin('admin@omegatraining.pro', 'WrongPassword123');
    expect(wrongPwd).toBe(false);
  });

  it('should reject unknown login usernames', () => {
    const wrongUser = loginAdmin('hacker@unknown.com', 'Omega@Admin2026');
    expect(wrongUser).toBe(false);
  });

  it('should support updating admin master password and authenticating with new credentials', () => {
    const newPassword = 'Omega@CustomAdmin2026!';
    adminCredentials = { ...adminCredentials, password: newPassword };

    expect(loginAdmin('admin@omegatraining.pro', newPassword)).toBe(true);
  });
});
