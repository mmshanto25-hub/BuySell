import { Router } from 'express';
import { authGuard, requireRole } from '../../common/middleware/authGuard';
import { tenantGuard } from '../../common/middleware/tenantGuard';
import { createProductSchema, restockInventorySchema } from '@marketplace/validators';
import { validateRequest } from '../../common/middleware/validate';
import { Product } from './product.model';
import { ProductVariant } from './variant.model';
import { Inventory } from '../inventory/inventory.model';
import { InventoryMovement } from '../inventory/movement.model';
import { isDatabaseConnected } from '../../common/database/connection';
import { AppError } from '../../common/errors/AppError';
import { slugify, generateSku } from '@marketplace/utils';

export const productRouter = Router();

// ==========================================
// SELLER PRODUCT & INVENTORY MANAGEMENT
// ==========================================

// POST /api/v1/products (Create product with variants and initial stock)
productRouter.post(
  '/products',
  authGuard,
  requireRole('SELLER'),
  tenantGuard,
  validateRequest({ body: createProductSchema }),
  async (req, res, next) => {
    try {
      const {
        title,
        shortDescription,
        description,
        categoryId,
        brandId,
        images,
        basePrice,
        compareAtPrice,
        attributes,
        tags,
        variants,
      } = req.body;

      const slug = slugify(title) + '-' + Math.random().toString(36).substring(2, 7);

      if (isDatabaseConnected()) {
        const product = await Product.create({
          storeId: req.user?.storeId,
          sellerId: req.user?.sellerId,
          title,
          slug,
          shortDescription,
          description,
          categoryId,
          brandId,
          images,
          basePrice,
          compareAtPrice,
          attributes,
          hasVariants: variants.length > 1,
          tags,
          status: 'PUBLISHED',
          moderationStatus: 'PENDING_REVIEW',
        });

        // Create variants and inventory records
        const createdVariants = [];
        for (const v of variants) {
          const variant = await ProductVariant.create({
            productId: product._id,
            storeId: req.user?.storeId,
            sku: v.sku.toUpperCase(),
            title: v.title,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            costPrice: v.costPrice,
            attributes: v.attributes,
            imageUrl: v.imageUrl || images[0].url,
            weightInGrams: v.weightInGrams,
            status: 'ACTIVE',
          });

          // Create inventory record
          const inventory = await Inventory.create({
            variantId: variant._id,
            productId: product._id,
            storeId: req.user?.storeId,
            sku: variant.sku,
            availableStock: v.initialStock,
            reservedStock: 0,
            soldStock: 0,
          });

          // Log movement
          await InventoryMovement.create({
            inventoryId: inventory._id,
            sku: variant.sku,
            type: 'INITIAL',
            quantityChanged: v.initialStock,
            previousAvailable: 0,
            newAvailable: v.initialStock,
            referenceId: product._id.toString(),
            performedBy: req.user?.userId as any,
            reason: 'Initial stock setup on product creation',
          });

          createdVariants.push({ variant, inventory });
        }

        return res.status(201).json({
          success: true,
          statusCode: 201,
          message: 'Product created successfully and submitted for moderation',
          data: {
            product,
            variants: createdVariants,
          },
        });
      }

      // In-memory response
      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Product created successfully and submitted for moderation',
        data: {
          id: 'prod_' + Date.now(),
          title,
          slug,
          storeId: req.user?.storeId,
          moderationStatus: 'PENDING_REVIEW',
          variantsCount: variants.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/seller/products (Tenant Isolated)
productRouter.get(
  '/seller/products',
  authGuard,
  requireRole('SELLER'),
  tenantGuard,
  async (req, res, next) => {
    try {
      if (isDatabaseConnected()) {
        const products = await Product.find({ storeId: req.user?.storeId }).sort({ createdAt: -1 });
        return res.status(200).json({
          success: true,
          statusCode: 200,
          message: 'Seller catalog retrieved',
          data: products,
        });
      }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Seller catalog retrieved',
        data: [
          {
            id: 'prod_1',
            title: 'Apex Premium Leather Formal Shoes',
            sku: 'APX-SH-001',
            basePrice: 4500,
            moderationStatus: 'APPROVED',
          },
        ],
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/v1/inventory/:sku/restock (Restock with Movement Audit Log)
productRouter.patch(
  '/inventory/:sku/restock',
  authGuard,
  requireRole('SELLER'),
  tenantGuard,
  validateRequest({ body: restockInventorySchema }),
  async (req, res, next) => {
    try {
      const { quantity, reason } = req.body;
      const sku = req.params.sku.toUpperCase();

      if (isDatabaseConnected()) {
        const inventory = await Inventory.findOne({ sku, storeId: req.user?.storeId });
        if (!inventory) throw AppError.notFound(`Inventory record for SKU ${sku} not found`);

        const previousAvailable = inventory.availableStock;
        inventory.availableStock += quantity;
        await inventory.save();

        await InventoryMovement.create({
          inventoryId: inventory._id,
          sku,
          type: 'RESTOCK',
          quantityChanged: quantity,
          previousAvailable,
          newAvailable: inventory.availableStock,
          referenceId: 'RESTOCK-' + Date.now(),
          performedBy: req.user?.userId as any,
          reason: reason || 'Merchant manual inventory restock',
        });

        return res.status(200).json({
          success: true,
          statusCode: 200,
          message: `SKU ${sku} restocked successfully (+${quantity} units)`,
          data: inventory,
        });
      }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: `SKU ${sku} restocked successfully (+${quantity} units)`,
        data: { sku, restocked: quantity },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// ADMIN PRODUCT MODERATION
// ==========================================

// GET /api/v1/admin/products/moderation
productRouter.get(
  '/admin/products/moderation',
  authGuard,
  requireRole('SUPER_ADMIN', 'ADMIN', 'PRODUCT_MANAGER'),
  async (req, res, next) => {
    try {
      if (isDatabaseConnected()) {
        const pending = await Product.find({ moderationStatus: 'PENDING_REVIEW' })
          .populate('storeId', 'storeName slug')
          .sort({ createdAt: -1 });

        return res.status(200).json({
          success: true,
          statusCode: 200,
          message: 'Pending product moderation queue retrieved',
          data: pending,
        });
      }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Pending product moderation queue retrieved',
        data: [
          {
            id: 'prod_mod_1',
            title: 'Bengal Heritage Pure Sundarban Honey',
            moderationStatus: 'PENDING_REVIEW',
            storeName: 'Bengal Heritage',
          },
        ],
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/v1/admin/products/:id/moderation
productRouter.patch(
  '/admin/products/:id/moderation',
  authGuard,
  requireRole('SUPER_ADMIN', 'ADMIN', 'PRODUCT_MANAGER'),
  async (req, res, next) => {
    try {
      const { status, rejectionReason } = req.body;
      if (!['APPROVED', 'REJECTED'].includes(status)) {
        throw AppError.badRequest('Status must be APPROVED or REJECTED');
      }

      if (isDatabaseConnected()) {
        const product = await Product.findById(req.params.id);
        if (!product) throw AppError.notFound('Product not found');

        product.moderationStatus = status;
        if (status === 'REJECTED') {
          product.rejectionReason = rejectionReason || 'Content violates catalog guidelines';
        }

        await product.save();

        return res.status(200).json({
          success: true,
          statusCode: 200,
          message: `Product has been ${status.toLowerCase()}`,
          data: product,
        });
      }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: `Product has been ${status.toLowerCase()}`,
        data: { id: req.params.id, status, rejectionReason },
      });
    } catch (error) {
      next(error);
    }
  }
);
