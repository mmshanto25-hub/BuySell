import { Router } from 'express';
import { registerSchema, loginSchema } from '@marketplace/validators';
import { validateRequest } from '../../common/middleware/validate';
import { AuthService } from './auth.service';
import { authGuard } from '../../common/middleware/authGuard';
import { ENV } from '../../common/config/env';

export const authRouter = Router();

// POST /api/v1/auth/register
authRouter.post('/register', validateRequest({ body: registerSchema }), async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body);

    // Set HTTP-only secure cookie for refresh token
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Account registered successfully',
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        expiresIn: result.tokens.expiresIn,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/login
authRouter.post('/login', validateRequest({ body: loginSchema }), async (req, res, next) => {
  try {
    const result = await AuthService.login(req.body);

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Authentication successful',
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        expiresIn: result.tokens.expiresIn,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/refresh
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Refresh token is required',
        },
      });
    }

    const tokens = await AuthService.rotateRefreshToken(refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Token rotated successfully',
      data: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/logout
authRouter.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Logged out successfully',
  });
});

// GET /api/v1/auth/me
authRouter.get('/me', authGuard, (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Current authenticated session retrieved',
    data: {
      user: req.user,
    },
  });
});
