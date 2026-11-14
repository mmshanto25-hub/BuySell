import { Router } from 'express';
import { authGuard, requireRole } from '../../common/middleware/authGuard';
import { addressSchema } from '@marketplace/validators';
import { validateRequest } from '../../common/middleware/validate';
import { User } from './user.model';
import { UserAddress } from './address.model';
import { isDatabaseConnected } from '../../common/database/connection';
import { AppError } from '../../common/errors/AppError';

export const userRouter = Router();

// ==========================================
// CUSTOMER PROFILE & ADDRESS BOOK
// ==========================================

// GET /api/v1/addresses
userRouter.get('/addresses', authGuard, async (req, res, next) => {
  try {
    if (isDatabaseConnected()) {
      const addresses = await UserAddress.find({ userId: req.user?.userId }).sort({ isDefault: -1, createdAt: -1 });
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Saved delivery addresses retrieved',
        data: addresses,
      });
    }

    // In-memory sample
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Saved delivery addresses retrieved',
      data: [
        {
          id: 'addr_1',
          userId: req.user?.userId,
          type: 'SHIPPING',
          recipientName: 'Rahim Chowdhury',
          phone: '+8801711223344',
          streetAddress: 'House 14, Road 5, Dhanmondi',
          city: 'Dhaka',
          division: 'Dhaka',
          postalCode: '1205',
          isDefault: true,
        },
      ],
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/addresses
userRouter.post('/addresses', authGuard, validateRequest({ body: addressSchema }), async (req, res, next) => {
  try {
    if (isDatabaseConnected()) {
      const address = await UserAddress.create({
        ...req.body,
        userId: req.user?.userId,
      });

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Delivery address created successfully',
        data: address,
      });
    }

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Delivery address created successfully',
      data: {
        id: 'addr_' + Date.now(),
        ...req.body,
        userId: req.user?.userId,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// ADMIN USER GOVERNANCE
// ==========================================

// GET /api/v1/admin/users
userRouter.get('/admin/users', authGuard, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    if (isDatabaseConnected()) {
      const users = await User.find().select('-passwordHash -twoFactorSecret').sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'User registry retrieved',
        data: users,
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'User registry retrieved',
      data: [
        {
          id: 'usr_admin',
          firstName: 'Super',
          lastName: 'Administrator',
          email: 'admin@marketplace.com',
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
        },
        {
          id: 'usr_seller',
          firstName: 'Apex',
          lastName: 'Merchant',
          email: 'merchant@apexfootwear.com',
          role: 'SELLER',
          status: 'ACTIVE',
        },
      ],
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/admin/users/:id/status
userRouter.patch('/admin/users/:id/status', authGuard, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'SUSPENDED', 'BANNED'].includes(status)) {
      throw AppError.badRequest('Invalid status value');
    }

    if (isDatabaseConnected()) {
      const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
      if (!user) throw AppError.notFound('User not found');
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: `User status updated to ${status}`,
        data: user.toSafeObject(),
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: `User status updated to ${status}`,
      data: { id: req.params.id, status },
    });
  } catch (error) {
    next(error);
  }
});
