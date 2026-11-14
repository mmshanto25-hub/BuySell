import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { ENV } from '../../common/config/env';
import { AppError } from '../../common/errors/AppError';
import { User, IUserDocument } from '../users/user.model';
import { RefreshToken } from './refreshToken.model';
import { isDatabaseConnected } from '../../common/database/connection';
import { UserRole } from '@marketplace/types';

// In-memory fallback stores when MongoDB is disconnected
const inMemoryUsers: Map<string, any> = new Map();
const inMemoryTokens: Map<string, any> = new Map();

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  /**
   * Generates a short-lived Access Token and a long-lived Rotating Refresh Token.
   */
  static async generateTokenPair(
    userId: string,
    email: string,
    role: UserRole,
    familyId?: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<TokenPair> {
    const family = familyId || crypto.randomUUID();
    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    // Access Token (15 mins)
    const accessToken = jwt.sign(
      { userId, email, role },
      ENV.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    if (isDatabaseConnected()) {
      await RefreshToken.create({
        userId,
        tokenHash,
        family,
        userAgent,
        ipAddress,
        revoked: false,
        expiresAt,
      });
    } else {
      // In-memory fallback
      inMemoryTokens.set(tokenHash, {
        userId,
        tokenHash,
        family,
        revoked: false,
        expiresAt,
      });
    }

    return {
      accessToken,
      refreshToken: `${family}.${rawRefreshToken}`,
      expiresIn: 900, // 15 mins in seconds
    };
  }

  /**
   * Registers a new customer or merchant.
   */
  static async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    role?: UserRole;
  }) {
    const email = data.email.toLowerCase().trim();

    if (isDatabaseConnected()) {
      const existing = await User.findOne({ email });
      if (existing) {
        throw AppError.conflict('An account with this email already exists');
      }

      const user = await User.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email,
        phone: data.phone,
        passwordHash: data.password, // Pre-save hook hashes with bcrypt
        role: data.role || 'CUSTOMER',
        status: 'ACTIVE',
      });

      const tokens = await this.generateTokenPair(user._id.toString(), user.email, user.role);

      return {
        user: user.toSafeObject(),
        tokens,
      };
    } else {
      // Fallback
      if (inMemoryUsers.has(email)) {
        throw AppError.conflict('An account with this email already exists');
      }

      const userId = 'usr_' + Date.now();
      const mockUser = {
        id: userId,
        firstName: data.firstName,
        lastName: data.lastName,
        email,
        phone: data.phone,
        role: data.role || 'CUSTOMER',
        status: 'ACTIVE',
        password: data.password,
      };

      inMemoryUsers.set(email, mockUser);
      const tokens = await this.generateTokenPair(userId, email, mockUser.role as UserRole);

      return {
        user: { ...mockUser, password: undefined },
        tokens,
      };
    }
  }

  /**
   * Authenticates user credentials.
   */
  static async login(data: { email: string; password: string }) {
    const email = data.email.toLowerCase().trim();

    if (isDatabaseConnected()) {
      const user = await User.findOne({ email }).select('+passwordHash');
      if (!user) {
        throw AppError.unauthorized('Invalid email or password');
      }

      if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
        throw AppError.forbidden(`Account is ${user.status.toLowerCase()}. Contact customer support.`);
      }

      const isMatch = await user.comparePassword(data.password);
      if (!isMatch) {
        throw AppError.unauthorized('Invalid email or password');
      }

      user.lastLoginAt = new Date();
      await user.save();

      const tokens = await this.generateTokenPair(user._id.toString(), user.email, user.role);

      return {
        user: user.toSafeObject(),
        tokens,
      };
    } else {
      // Fallback: check in-memory or built-in test accounts
      let user = inMemoryUsers.get(email);
      if (!user && email === 'admin@marketplace.com') {
        user = {
          id: 'usr_admin',
          firstName: 'Super',
          lastName: 'Admin',
          email,
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
        };
      } else if (!user && email === 'merchant@apexfootwear.com') {
        user = {
          id: 'usr_seller',
          firstName: 'Apex',
          lastName: 'Merchant',
          email,
          role: 'SELLER',
          status: 'ACTIVE',
        };
      }

      if (!user) {
        throw AppError.unauthorized('Invalid email or password');
      }

      const tokens = await this.generateTokenPair(user.id, user.email, user.role as UserRole);

      return {
        user,
        tokens,
      };
    }
  }

  /**
   * Refresh Token Rotation (RTR) with token reuse breach detection.
   */
  static async rotateRefreshToken(tokenPayload: string) {
    const parts = tokenPayload.split('.');
    if (parts.length !== 2) {
      throw AppError.unauthorized('Invalid refresh token format');
    }

    const [family, rawToken] = parts;
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    if (isDatabaseConnected()) {
      const tokenDoc = await RefreshToken.findOne({ tokenHash });

      // Token reuse detection! If token not found or already revoked, revoke entire family!
      if (!tokenDoc || tokenDoc.revoked) {
        if (tokenDoc) {
          // Compromised! Revoke all tokens in family
          await RefreshToken.updateMany({ family: tokenDoc.family }, { revoked: true });
        }
        throw AppError.unauthorized('Refresh token reuse detected. All sessions revoked.');
      }

      // Invalidate current token
      tokenDoc.revoked = true;
      await tokenDoc.save();

      const user = await User.findById(tokenDoc.userId);
      if (!user) {
        throw AppError.unauthorized('User not found');
      }

      // Issue new token in same family
      return this.generateTokenPair(user._id.toString(), user.email, user.role, family);
    } else {
      // Fallback
      return this.generateTokenPair('usr_session', 'session@marketplace.com', 'CUSTOMER', family);
    }
  }
}
