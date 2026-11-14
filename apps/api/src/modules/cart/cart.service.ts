import { Types } from 'mongoose';
import { Cart, ICartDocument } from './cart.model';
import { Product } from '../catalog/product.model';
import { ProductVariant } from '../catalog/variant.model';
import { Store } from '../sellers/store.model';
import { Inventory } from '../inventory/inventory.model';
import { Coupon } from '../orders/coupon.model';
import { isDatabaseConnected } from '../../common/database/connection';

export interface CartCalculationResult {
  cartId?: string;
  items: any[];
  sellerGroups: {
    storeId: string;
    storeName: string;
    items: any[];
    subtotal: number;
    estimatedShipping: number;
  }[];
  itemsSubtotal: number;
  totalShippingFee: number;
  discountAmount: number;
  grandTotal: number;
  couponCode?: string | null;
}

// In-memory fallback cart store for offline / mock testing
const inMemoryCarts = new Map<string, {
  id: string;
  userId?: string | null;
  sessionId?: string | null;
  items: Array<{
    productId: string;
    variantId: string;
    storeId: string;
    sku: string;
    quantity: number;
  }>;
  couponCode?: string | null;
}>();

export class CartService {
  /**
   * Find or create cart for user or guest session
   */
  static async getOrCreateCart(userId?: string, sessionId?: string): Promise<any> {
    if (isDatabaseConnected()) {
      let cart: ICartDocument | null = null;

      if (userId) {
        cart = await Cart.findOne({ userId: new Types.ObjectId(userId) });
        
        // If user logged in and has guest cart session, merge guest items
        if (sessionId) {
          const guestCart = await Cart.findOne({ sessionId });
          if (guestCart && guestCart.items.length > 0) {
            if (!cart) {
              guestCart.userId = new Types.ObjectId(userId);
              guestCart.sessionId = null;
              await guestCart.save();
              return guestCart;
            } else {
              for (const gItem of guestCart.items) {
                const existing = cart.items.find((i) => i.variantId.toString() === gItem.variantId.toString());
                if (existing) {
                  existing.quantity += gItem.quantity;
                } else {
                  cart.items.push(gItem);
                }
              }
              await guestCart.deleteOne();
              await cart.save();
            }
          }
        }

        if (!cart) {
          cart = await Cart.create({
            userId: new Types.ObjectId(userId),
            items: [],
          });
        }
      } else if (sessionId) {
        cart = await Cart.findOne({ sessionId });
        if (!cart) {
          cart = await Cart.create({
            sessionId,
            items: [],
          });
        }
      }

      return cart;
    }

    // In-Memory Fallback
    const key = userId || sessionId || 'default_session';
    let memCart = inMemoryCarts.get(key);
    if (!memCart) {
      memCart = {
        id: 'cart_' + Date.now(),
        userId: userId || null,
        sessionId: sessionId || null,
        items: [
          {
            productId: 'prod_apex_01',
            variantId: 'var_apex_01_blk_42',
            storeId: 'store_apex',
            sku: 'APX-SHOE-BLK-42',
            quantity: 1,
          },
          {
            productId: 'prod_aarong_01',
            variantId: 'var_aarong_01_wht_40',
            storeId: 'store_aarong',
            sku: 'ARG-PANJ-WHT-40',
            quantity: 1,
          },
        ],
        couponCode: null,
      };
      inMemoryCarts.set(key, memCart);
    }
    return memCart;
  }

  /**
   * Calculate cart details with live product/inventory enrichment and vendor grouping
   */
  static async calculateCart(cart: any): Promise<CartCalculationResult> {
    if (isDatabaseConnected() && cart?.items) {
      const enrichedItems: any[] = [];
      const storeMap = new Map<string, { storeName: string; items: any[]; subtotal: number }>();

      for (const item of cart.items) {
        const variant = await ProductVariant.findById(item.variantId);
        const product = await Product.findById(item.productId);
        const store = await Store.findById(item.storeId);
        const inventory = await Inventory.findOne({ sku: item.sku });

        const price = variant?.price ?? product?.basePrice ?? 0;
        const availableStock = inventory?.availableStock ?? 0;
        const storeName = store?.storeName || 'Official Merchant';

        const enrichedItem = {
          id: item._id?.toString(),
          productId: item.productId.toString(),
          variantId: item.variantId.toString(),
          storeId: item.storeId.toString(),
          storeName,
          productTitle: product?.title || 'Catalog Product',
          variantTitle: variant?.title || 'Standard',
          sku: item.sku,
          imageUrl: variant?.imageUrl || product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=300',
          unitPrice: price,
          quantity: item.quantity,
          availableStock,
          totalPrice: price * item.quantity,
        };

        enrichedItems.push(enrichedItem);

        const storeIdStr = item.storeId.toString();
        if (!storeMap.has(storeIdStr)) {
          storeMap.set(storeIdStr, {
            storeName,
            items: [],
            subtotal: 0,
          });
        }

        const group = storeMap.get(storeIdStr)!;
        group.items.push(enrichedItem);
        group.subtotal += enrichedItem.totalPrice;
      }

      const sellerGroups = Array.from(storeMap.entries()).map(([storeId, data]) => ({
        storeId,
        storeName: data.storeName,
        items: data.items,
        subtotal: data.subtotal,
        estimatedShipping: 60,
      }));

      const itemsSubtotal = sellerGroups.reduce((acc, g) => acc + g.subtotal, 0);
      const totalShippingFee = sellerGroups.length * 60;

      let discountAmount = 0;
      if (cart.couponCode) {
        const coupon = await Coupon.findOne({
          code: cart.couponCode.toUpperCase(),
          isActive: true,
          expiresAt: { $gt: new Date() },
        });

        if (coupon && itemsSubtotal >= coupon.minOrderSubtotal) {
          if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = (itemsSubtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
              discountAmount = coupon.maxDiscountAmount;
            }
          } else {
            discountAmount = Math.min(coupon.discountValue, itemsSubtotal);
          }
        }
      }

      const grandTotal = Math.max(0, itemsSubtotal + totalShippingFee - discountAmount);

      return {
        cartId: cart._id?.toString(),
        items: enrichedItems,
        sellerGroups,
        itemsSubtotal,
        totalShippingFee,
        discountAmount,
        grandTotal,
        couponCode: cart.couponCode,
      };
    }

    // High fidelity fallback calculation
    const fallbackStoreNames: Record<string, string> = {
      store_apex: 'Apex Footwear Official',
      store_aarong: 'Aarong Artisan Crafts',
    };

    const fallbackProductInfo: Record<string, { title: string; price: number; img: string }> = {
      'APX-SHOE-BLK-42': {
        title: 'Apex Premium Leather Formal Shoes (Black / 42)',
        price: 4500,
        img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=300',
      },
      'ARG-PANJ-WHT-40': {
        title: 'Aarong Hand-Embroidered Jamdani Silk Panjabi (White / 40)',
        price: 6800,
        img: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&q=80&w=300',
      },
    };

    const enrichedItems = (cart.items || []).map((i: any) => {
      const info = fallbackProductInfo[i.sku] || {
        title: 'Selected Marketplace Item',
        price: 2500,
        img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=300',
      };
      return {
        id: 'ci_' + i.sku,
        productId: i.productId,
        variantId: i.variantId,
        storeId: i.storeId,
        storeName: fallbackStoreNames[i.storeId] || 'Merchant Store',
        productTitle: info.title,
        variantTitle: i.sku,
        sku: i.sku,
        imageUrl: info.img,
        unitPrice: info.price,
        quantity: i.quantity,
        availableStock: 50,
        totalPrice: info.price * i.quantity,
      };
    });

    const storeMap = new Map<string, any>();
    for (const item of enrichedItems) {
      if (!storeMap.has(item.storeId)) {
        storeMap.set(item.storeId, {
          storeId: item.storeId,
          storeName: item.storeName,
          items: [],
          subtotal: 0,
          estimatedShipping: 60,
        });
      }
      const grp = storeMap.get(item.storeId);
      grp.items.push(item);
      grp.subtotal += item.totalPrice;
    }

    const sellerGroups = Array.from(storeMap.values());
    const itemsSubtotal = sellerGroups.reduce((acc, g) => acc + g.subtotal, 0);
    const totalShippingFee = sellerGroups.length * 60;
    let discountAmount = 0;

    if (cart.couponCode === 'PLATFORM10' || cart.couponCode === 'EID2026') {
      discountAmount = Math.round(itemsSubtotal * 0.1);
    }

    const grandTotal = Math.max(0, itemsSubtotal + totalShippingFee - discountAmount);

    return {
      cartId: cart.id || 'cart_demo',
      items: enrichedItems,
      sellerGroups,
      itemsSubtotal,
      totalShippingFee,
      discountAmount,
      grandTotal,
      couponCode: cart.couponCode,
    };
  }

  /**
   * Add item to cart
   */
  static async addItem(cart: any, productId: string, variantId: string, quantity: number): Promise<CartCalculationResult> {
    if (isDatabaseConnected()) {
      const product = await Product.findById(productId);
      if (!product) throw new Error('Product not found');

      const variant = await ProductVariant.findById(variantId);
      if (!variant) throw new Error('Product variant not found');

      const inventory = await Inventory.findOne({ sku: variant.sku });
      const availableStock = inventory?.availableStock ?? 0;

      const existingIndex = cart.items.findIndex((i: any) => i.variantId.toString() === variantId);
      const currentQty = existingIndex >= 0 ? cart.items[existingIndex].quantity : 0;
      const requestedTotal = currentQty + quantity;

      if (requestedTotal > availableStock) {
        throw new Error(`Insufficient stock. Only ${availableStock} units available for SKU ${variant.sku}`);
      }

      if (existingIndex >= 0) {
        cart.items[existingIndex].quantity = requestedTotal;
      } else {
        cart.items.push({
          productId: new Types.ObjectId(productId),
          variantId: new Types.ObjectId(variantId),
          storeId: new Types.ObjectId(variant.storeId),
          sku: variant.sku,
          quantity,
          addedAt: new Date(),
        });
      }

      await cart.save();
      return this.calculateCart(cart);
    }

    // In-memory fallback
    const existing = cart.items.find((i: any) => i.variantId === variantId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        variantId,
        storeId: 'store_apex',
        sku: 'SKU-' + variantId,
        quantity,
      });
    }
    return this.calculateCart(cart);
  }

  /**
   * Update item quantity
   */
  static async updateItemQuantity(cart: any, variantId: string, quantity: number): Promise<CartCalculationResult> {
    if (isDatabaseConnected()) {
      const index = cart.items.findIndex((i: any) => i.variantId.toString() === variantId);
      if (index === -1) {
        throw new Error('Item not found in cart');
      }

      if (quantity <= 0) {
        cart.items.splice(index, 1);
      } else {
        const item = cart.items[index];
        const inventory = await Inventory.findOne({ sku: item.sku });
        const availableStock = inventory?.availableStock ?? 0;
        if (quantity > availableStock) {
          throw new Error(`Insufficient stock. Only ${availableStock} units available for SKU ${item.sku}`);
        }
        item.quantity = quantity;
      }

      await cart.save();
      return this.calculateCart(cart);
    }

    // In-memory fallback
    const index = cart.items.findIndex((i: any) => i.variantId === variantId);
    if (index >= 0) {
      if (quantity <= 0) {
        cart.items.splice(index, 1);
      } else {
        cart.items[index].quantity = quantity;
      }
    }
    return this.calculateCart(cart);
  }

  /**
   * Remove item
   */
  static async removeItem(cart: any, variantId: string): Promise<CartCalculationResult> {
    if (isDatabaseConnected()) {
      cart.items = cart.items.filter((i: any) => i.variantId.toString() !== variantId);
      await cart.save();
      return this.calculateCart(cart);
    }

    cart.items = cart.items.filter((i: any) => i.variantId !== variantId);
    return this.calculateCart(cart);
  }

  /**
   * Apply coupon
   */
  static async applyCoupon(cart: any, code: string): Promise<CartCalculationResult> {
    const cleanCode = code.trim().toUpperCase();
    if (isDatabaseConnected()) {
      const coupon = await Coupon.findOne({
        code: cleanCode,
        isActive: true,
        expiresAt: { $gt: new Date() },
      });

      if (!coupon) {
        throw new Error('Invalid or expired coupon code');
      }

      cart.couponCode = coupon.code;
      await cart.save();
      return this.calculateCart(cart);
    }

    if (cleanCode === 'PLATFORM10' || cleanCode === 'EID2026') {
      cart.couponCode = cleanCode;
      return this.calculateCart(cart);
    }
    throw new Error('Invalid coupon code: ' + cleanCode);
  }

  /**
   * Remove coupon
   */
  static async removeCoupon(cart: any): Promise<CartCalculationResult> {
    cart.couponCode = null;
    if (isDatabaseConnected()) {
      await cart.save();
    }
    return this.calculateCart(cart);
  }
}
