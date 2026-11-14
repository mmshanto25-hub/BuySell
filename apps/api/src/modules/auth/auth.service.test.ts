import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AuthService } from './auth.service';

describe('AuthService & Token Security', () => {
  it('generates a valid JWT access token and formatted refresh token', async () => {
    const tokens = await AuthService.generateTokenPair('usr_test_1', 'buyer@marketplace.com', 'CUSTOMER');

    assert.ok(tokens.accessToken);
    assert.ok(tokens.refreshToken);
    assert.strictEqual(tokens.expiresIn, 900); // 15 mins

    // Refresh token format: {family}.{token}
    const parts = tokens.refreshToken.split('.');
    assert.strictEqual(parts.length, 2);
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

    assert.ok(result.user);
    assert.strictEqual(result.user.email, uniqueEmail);
    assert.ok(result.tokens.accessToken);
  });

  it('rejects duplicate email registration', async () => {
    const duplicateEmail = `dup_${Date.now()}@marketplace.com`;
    await AuthService.register({
      firstName: 'First',
      lastName: 'User',
      email: duplicateEmail,
      password: 'StrongP@ssword2026',
    });

    await assert.rejects(
      async () => {
        await AuthService.register({
          firstName: 'Second',
          lastName: 'User',
          email: duplicateEmail,
          password: 'StrongP@ssword2026',
        });
      },
      (err: any) => {
        return err.message === 'An account with this email already exists';
      }
    );
  });

  it('rotates refresh token and issues new access token', async () => {
    const initial = await AuthService.generateTokenPair('usr_rotate', 'rotate@marketplace.com', 'CUSTOMER');
    const rotated = await AuthService.rotateRefreshToken(initial.refreshToken);

    assert.ok(rotated.accessToken);
    assert.ok(rotated.refreshToken);
    assert.notStrictEqual(rotated.refreshToken, initial.refreshToken);
  });
});
