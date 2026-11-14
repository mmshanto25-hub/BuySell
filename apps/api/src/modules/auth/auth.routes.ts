import { Router } from 'express';
import { registerSchema, loginSchema } from '@marketplace/validators';
import jwt from 'jsonwebtoken';
import { ENV } from '../../common/config/env';
import { authGuard } from '../../common/middleware/authGuard';

export const authRouter = Router();

authRouter.post('/register', (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    // In-memory or Mongoose persistence
    const token = jwt.sign(
      { userId: 'usr_' + Date.now(), email: validatedData.email, role: 'CUSTOMER' },
      ENV.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Customer account registered successfully',
      data: {
        user: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          role: 'CUSTOMER',
        },
        accessToken: token,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const token = jwt.sign(
      { userId: 'usr_admin', email, role: 'SUPER_ADMIN' },
      ENV.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Login successful',
      data: {
        user: {
          email,
          role: 'SUPER_ADMIN',
        },
        accessToken: token,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', authGuard, (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Current user profile retrieved',
    data: {
      user: req.user,
    },
  });
});
