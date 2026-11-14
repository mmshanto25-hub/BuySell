import { describe, it, expect } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService & Token Security', () => {
  it('generates a valid JWT access token and formatted refresh token', async () => {
    const tokens = await AuthService.generateTokenPair('usr_test_1', 'buyer@marketplace.com', 'CUSTOMER');

    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
    expect(tokens.expiresIn).toBe(900); // 15 mins

    // Refresh token format: {family}.{token}
    const parts = tokens.refreshToken.split('.');
    expect(parts.length).toBe(2);
  });

  it('successfully registers a customer with valid credentials', async () => {
    const uniqueEmail = `test_${Date.now()}@marketplace.com`;
    const result = await AuthService.register({
      firstName: 'Tanvir',
      lastName: 'Hossain',
      email: uniqueEmail,
      phone: '+8801711223399',
      password: 'StrongP@ssword2026',
      role: 'CUSTOMER',
    });

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(uniqueEmail);
    expect(result.tokens.accessToken).toBeDefined();
  });

  it('rejects duplicate email registration', async () => {
    const duplicateEmail = `dup_${Date.now()}@marketplace.com`;
    await AuthService.register({
      firstName: 'First',
      lastName: 'User',
      email: duplicateEmail,
      password: 'StrongP@ssword2026',
    });

    await expect(
      AuthService.register({
        firstName: 'Second',
        lastName: 'User',
        email: duplicateEmail,
        password: 'StrongP@ssword2026',
      })
    ).rejects.toThrow('An account with this email already exists');
  });

  it('rotates refresh token and issues new access token', async () => {
    const initial = await AuthService.generateTokenPair('usr_rotate', 'rotate@marketplace.com', 'CUSTOMER');
    const rotated = await AuthService.rotateRefreshToken(initial.refreshToken);

    expect(rotated.accessToken).toBeDefined();
    expect(rotated.refreshToken).toBeDefined();
    expect(rotated.refreshToken).not.toBe(initial.refreshToken);
  });
});
