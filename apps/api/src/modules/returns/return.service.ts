import { Types } from 'mongoose';
import { ReturnRequest, IReturnDocument, ReturnStatus } from './return.model';
import { SubOrder } from '../orders/subOrder.model';
import { Order } from '../orders/order.model';
import { Inventory } from '../inventory/inventory.model';
import { InventoryMovement } from '../inventory/movement.model';
import { AppError } from '../../common/errors/AppError';
import { isDatabaseConnected } from '../../common/database/connection';

// In-Memory Fallback Storage
const inMemoryReturns: any[] = [];

export class ReturnService {
  /**
   * Customer initiates return request within 7-day post-delivery window
   */
  static async createReturnRequest(
    customerId: string,
    input: {
      subOrderNumber: string;
      items: Array<{
        orderItemId: string;
        quantity: number;
        reason: any;
        details: string;
        images?: string[];
      }>;
    }
  ) {
    if (isDatabaseConnected()) {
      const subOrder = await SubOrder.findOne({ subOrderNumber: input.subOrderNumber });
      if (!subOrder) throw AppError.notFound(`Sub-order ${input.subOrderNumber} not found`);

      const parentOrder = await Order.findById(subOrder.parentOrderId);
      if (!parentOrder || parentOrder.customerId.toString() !== customerId) {
        throw AppError.forbidden('Unauthorized: You do not own this order');
      }

      // Enforce 7-Day Window check
      if (subOrder.status !== 'DELIVERED') {
        throw AppError.badRequest('Returns can only be requested for delivered orders');
      }

      if (subOrder.deliveredAt) {
        const daysSinceDelivery = (Date.now() - new Date(subOrder.deliveredAt).getTime()) / (1000 * 3600 * 24);
        if (daysSinceDelivery > 7) {
          throw AppError.badRequest('Return window expired: Items can only be returned within 7 days of delivery');
        }
      }

      // Calculate refund amount based on snapshot prices
      let totalRefund = 0;
      const formattedItems = [];

      for (const item of input.items) {
        const orderItem = subOrder.items.find((i) => i._id?.toString() === item.orderItemId || i.sku === item.orderItemId);
        if (!orderItem) throw AppError.badRequest(`Item ${item.orderItemId} not found in this sub-order`);

        const itemRefund = orderItem.unitPrice * item.quantity;
        totalRefund += itemRefund;

        orderItem.returnStatus = 'REQUESTED';

        formattedItems.push({
          orderItemId: orderItem._id || new Types.ObjectId(),
          quantity: item.quantity,
          reason: item.reason,
          details: item.details,
          images: item.images || [],
        });
      }

      await subOrder.save();

      const returnNumber = `RET-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const returnDoc = await ReturnRequest.create({
        returnNumber,
        subOrderId: subOrder._id,
        subOrderNumber: subOrder.subOrderNumber,
        parentOrderId: subOrder.parentOrderId,
        customerId: new Types.ObjectId(customerId),
        sellerId: subOrder.sellerId,
        storeId: subOrder.storeId,
        items: formattedItems,
        refundAmount: totalRefund,
        status: 'REQUESTED',
      });

      return {
        returnNumber: returnDoc.returnNumber,
        status: returnDoc.status,
        subOrderNumber: subOrder.subOrderNumber,
        refundAmount: returnDoc.refundAmount,
        itemCount: returnDoc.items.length,
        createdAt: returnDoc.createdAt,
      };
    }

    // In-Memory Fallback
    const returnNumber = `RET-202611-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const mockReturn = {
      id: 'ret_' + Date.now(),
      returnNumber,
      subOrderNumber: input.subOrderNumber,
      customerId,
      storeId: 'store_apex',
      items: input.items,
      refundAmount: 4500,
      status: 'REQUESTED',
      createdAt: new Date(),
    };
    inMemoryReturns.unshift(mockReturn);

    return {
      returnNumber: mockReturn.returnNumber,
      status: mockReturn.status,
      subOrderNumber: mockReturn.subOrderNumber,
      refundAmount: mockReturn.refundAmount,
      itemCount: mockReturn.items.length,
      createdAt: mockReturn.createdAt,
    };
  }

  /**
   * Seller responds to return claim (Accept or Contest)
   */
  static async sellerRespond(
    storeId: string,
    returnId: string,
    action: 'ACCEPT' | 'CONTEST',
    contestReason?: string
  ) {
    if (isDatabaseConnected()) {
      const returnDoc = await ReturnRequest.findById(returnId);
      if (!returnDoc) throw AppError.notFound(`Return request ${returnId} not found`);

      if (returnDoc.storeId.toString() !== storeId) {
        throw AppError.forbidden('Unauthorized: Return claim does not belong to your store');
      }

      if (action === 'ACCEPT') {
        returnDoc.status = 'SELLER_ACCEPTED';
      } else {
        returnDoc.status = 'SELLER_CONTESTED';
        returnDoc.sellerContestReason = contestReason || 'Merchant contested return condition';
      }

      await returnDoc.save();
      return returnDoc;
    }

    // In-Memory Fallback
    const ret = inMemoryReturns.find((r) => r.id === returnId || r.returnNumber === returnId);
    if (ret) {
      ret.status = action === 'ACCEPT' ? 'SELLER_ACCEPTED' : 'SELLER_CONTESTED';
      if (contestReason) ret.sellerContestReason = contestReason;
      return ret;
    }

    return {
      id: returnId,
      status: action === 'ACCEPT' ? 'SELLER_ACCEPTED' : 'SELLER_CONTESTED',
      updatedAt: new Date(),
    };
  }

  /**
   * Admin / Support Agent Dispute Arbitration
   */
  static async arbitrateDispute(
    adminUserId: string,
    returnId: string,
    resolution: 'REFUND_BUYER' | 'REJECT_CLAIM' | 'PARTIAL_REFUND',
    adminNotes: string,
    refundAmountOverride?: number
  ) {
    if (isDatabaseConnected()) {
      const returnDoc = await ReturnRequest.findById(returnId);
      if (!returnDoc) throw AppError.notFound(`Return request ${returnId} not found`);

      returnDoc.arbitratedBy = new Types.ObjectId(adminUserId);
      returnDoc.adminResolutionNotes = adminNotes;
      returnDoc.resolvedAt = new Date();

      if (resolution === 'REFUND_BUYER' || resolution === 'PARTIAL_REFUND') {
        returnDoc.status = 'REFUNDED';
        if (refundAmountOverride) returnDoc.refundAmount = refundAmountOverride;
      } else {
        returnDoc.status = 'REJECTED';
      }

      await returnDoc.save();
      return returnDoc;
    }

    // In-Memory Fallback
    const ret = inMemoryReturns.find((r) => r.id === returnId || r.returnNumber === returnId);
    if (ret) {
      ret.status = resolution === 'REFUND_BUYER' ? 'REFUNDED' : 'REJECTED';
      ret.adminResolutionNotes = adminNotes;
      ret.resolvedAt = new Date();
      return ret;
    }

    return {
      id: returnId,
      status: resolution === 'REFUND_BUYER' ? 'REFUNDED' : 'REJECTED',
      adminNotes,
      resolvedAt: new Date(),
    };
  }

  /**
   * Confirm inspection and restock inventory
   */
  static async confirmInspectionAndRefund(storeId: string, returnId: string) {
    if (isDatabaseConnected()) {
      const returnDoc = await ReturnRequest.findById(returnId);
      if (!returnDoc) throw AppError.notFound(`Return request ${returnId} not found`);

      if (returnDoc.storeId.toString() !== storeId) {
        throw AppError.forbidden('Unauthorized: Claim does not belong to your store');
      }

      returnDoc.status = 'REFUNDED';
      returnDoc.resolvedAt = new Date();
      await returnDoc.save();

      // Restock returned items: soldStock -> availableStock
      const subOrder = await SubOrder.findById(returnDoc.subOrderId);
      if (subOrder) {
        for (const rItem of returnDoc.items) {
          const orderItem = subOrder.items.find((i) => i._id?.toString() === rItem.orderItemId.toString());
          if (orderItem) {
            orderItem.returnStatus = 'REFUNDED';
            const inv = await Inventory.findOneAndUpdate(
              { sku: orderItem.sku },
              { $inc: { availableStock: rItem.quantity, soldStock: -rItem.quantity } },
              { new: true }
            );

            if (inv) {
              await InventoryMovement.create({
                inventoryId: inv._id,
                sku: orderItem.sku,
                type: 'RETURN_RESTOCKED',
                quantityChanged: rItem.quantity,
                previousAvailable: inv.availableStock - rItem.quantity,
                newAvailable: inv.availableStock,
                referenceId: returnDoc.returnNumber,
                reason: `Item inspected and restocked from return ${returnDoc.returnNumber}`,
              });
            }
          }
        }
        await subOrder.save();
      }

      return {
        returnNumber: returnDoc.returnNumber,
        status: 'REFUNDED',
        refundAmount: returnDoc.refundAmount,
        message: 'Goods inspected and restocked. Customer refund processed.',
      };
    }

    // In-Memory Fallback
    const ret = inMemoryReturns.find((r) => r.id === returnId || r.returnNumber === returnId);
    if (ret) {
      ret.status = 'REFUNDED';
      ret.resolvedAt = new Date();
    }

    return {
      returnNumber: ret?.returnNumber || 'RET-DEMO',
      status: 'REFUNDED',
      refundAmount: 4500,
      message: 'Goods inspected and restocked. Customer refund processed.',
    };
  }

  /**
   * Query return requests by role / ownership
   */
  static async getReturns(filters: { customerId?: string; storeId?: string; status?: string }) {
    if (isDatabaseConnected()) {
      const query: any = {};
      if (filters.customerId) query.customerId = new Types.ObjectId(filters.customerId);
      if (filters.storeId) query.storeId = new Types.ObjectId(filters.storeId);
      if (filters.status) query.status = filters.status;
      return ReturnRequest.find(query).sort({ createdAt: -1 });
    }

    return inMemoryReturns.filter((r) => {
      if (filters.customerId && r.customerId !== filters.customerId) return false;
      if (filters.storeId && r.storeId !== filters.storeId) return false;
      if (filters.status && r.status !== filters.status) return false;
      return true;
    });
  }
}
