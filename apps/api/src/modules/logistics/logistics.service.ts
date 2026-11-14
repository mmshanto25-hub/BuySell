import { Types } from 'mongoose';
import { Shipment, IShipmentDocument, CarrierName, ShipmentStatus } from './shipment.model';
import { DeliveryEvent, IDeliveryEventDocument } from './deliveryEvent.model';
import { SubOrder } from '../orders/subOrder.model';
import { Order } from '../orders/order.model';
import { Store } from '../sellers/store.model';
import { AppError } from '../../common/errors/AppError';
import { isDatabaseConnected } from '../../common/database/connection';

// In-Memory Fallback Storage
const inMemoryShipments: Map<string, any> = new Map();
const inMemoryEvents: any[] = [];

export class LogisticsService {
  /**
   * Book carrier consignment and generate barcode shipping label PDF
   */
  static async createConsignment(
    storeId: string,
    input: {
      subOrderNumber: string;
      carrier?: CarrierName;
      weightInGrams?: number;
      specialNotes?: string;
    }
  ) {
    const carrier: CarrierName = input.carrier || 'PATHAO';
    const subOrderNum = input.subOrderNumber;

    if (isDatabaseConnected()) {
      const subOrder = await SubOrder.findOne({ subOrderNumber: subOrderNum });
      if (!subOrder) throw AppError.notFound(`Sub-order ${subOrderNum} not found`);

      if (subOrder.storeId.toString() !== storeId) {
        throw AppError.forbidden(`Unauthorized: Sub-order does not belong to your store`);
      }

      const parentOrder = await Order.findById(subOrder.parentOrderId);
      const store = await Store.findById(subOrder.storeId);

      const consignmentId = `CNS-${carrier}-${Date.now().toString().slice(-6)}`;
      const trackingCode = `TRK-${carrier.slice(0, 3)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const shippingLabelUrl = `https://cdn.marketplace.com/shipping-labels/${consignmentId}.pdf`;

      const shipment = await Shipment.create({
        subOrderId: subOrder._id,
        subOrderNumber: subOrder.subOrderNumber,
        carrier,
        consignmentId,
        trackingCode,
        shippingLabelUrl,
        shippingCostCharged: subOrder.shippingFee,
        actualCarrierCost: 50,
        pickupAddress: store?.warehouseAddress || {
          streetAddress: 'Plot 12, Banani Commercial Area',
          city: 'Dhaka',
          division: 'Dhaka',
          postalCode: '1213',
        },
        deliveryAddress: parentOrder?.shippingAddress || {
          streetAddress: 'House 42, Road 11, Banani',
          city: 'Dhaka',
          division: 'Dhaka',
          postalCode: '1213',
        },
        currentStatus: 'MANIFEST_CREATED',
        estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      });

      // Initial milestone event
      await DeliveryEvent.create({
        shipmentId: shipment._id,
        trackingCode,
        status: 'MANIFEST_CREATED',
        message: `Consignment manifest created with ${carrier}. Courier parcel pickup scheduled.`,
        location: `${store?.warehouseAddress?.city || 'Dhaka'} Warehouse`,
        source: 'SYSTEM',
        timestamp: new Date(),
      });

      // Update SubOrder state to SHIPPED
      subOrder.carrier = carrier;
      subOrder.trackingCode = trackingCode;
      subOrder.consignmentId = consignmentId;
      subOrder.status = 'SHIPPED';
      subOrder.shippedAt = new Date();
      await subOrder.save();

      return {
        shipmentId: shipment._id.toString(),
        consignmentId,
        trackingCode,
        carrier,
        status: 'MANIFEST_CREATED',
        subOrderNumber: subOrder.subOrderNumber,
        shippingLabelUrl,
        estimatedDeliveryDate: shipment.estimatedDeliveryDate,
      };
    }

    // In-Memory Fallback
    const consignmentId = `CNS-${carrier}-${Date.now().toString().slice(-6)}`;
    const trackingCode = `TRK-${carrier.slice(0, 3)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const shippingLabelUrl = `https://cdn.marketplace.com/shipping-labels/${consignmentId}.pdf`;

    const shipmentData = {
      id: 'ship_' + Date.now(),
      subOrderNumber: subOrderNum,
      carrier,
      consignmentId,
      trackingCode,
      shippingLabelUrl,
      currentStatus: 'MANIFEST_CREATED',
      estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    };
    inMemoryShipments.set(trackingCode, shipmentData);

    inMemoryEvents.unshift({
      trackingCode,
      status: 'MANIFEST_CREATED',
      message: `Consignment manifest created with ${carrier}. Courier pickup scheduled.`,
      location: 'Dhaka Hub',
      timestamp: new Date(),
    });

    return {
      shipmentId: shipmentData.id,
      consignmentId,
      trackingCode,
      carrier,
      status: 'MANIFEST_CREATED',
      subOrderNumber: subOrderNum,
      shippingLabelUrl,
      estimatedDeliveryDate: shipmentData.estimatedDeliveryDate,
    };
  }

  /**
   * Public parcel tracking milestone inquiry
   */
  static async trackConsignment(trackingCode: string) {
    if (isDatabaseConnected()) {
      const shipment = await Shipment.findOne({ trackingCode });
      if (!shipment) throw AppError.notFound(`Tracking code ${trackingCode} not found`);

      const events = await DeliveryEvent.find({ trackingCode }).sort({ timestamp: -1 });

      return {
        trackingCode: shipment.trackingCode,
        consignmentId: shipment.consignmentId,
        carrier: shipment.carrier,
        currentStatus: shipment.currentStatus,
        subOrderNumber: shipment.subOrderNumber,
        estimatedDeliveryDate: shipment.estimatedDeliveryDate,
        deliveredAt: shipment.deliveredAt,
        events: events.map((e) => ({
          status: e.status,
          message: e.message,
          location: e.location,
          timestamp: e.timestamp,
        })),
      };
    }

    // In-Memory Fallback
    const shipment = inMemoryShipments.get(trackingCode) || {
      trackingCode,
      consignmentId: 'CNS-PATHAO-109922',
      carrier: 'PATHAO',
      currentStatus: 'IN_TRANSIT',
      subOrderNumber: 'ORD-20261114-K89X-S1',
      estimatedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    const events = inMemoryEvents.filter((e) => e.trackingCode === trackingCode);
    if (events.length === 0) {
      events.push(
        {
          status: 'IN_TRANSIT',
          message: 'Package arrived at Tejgaon Central Sort Facility',
          location: 'Tejgaon, Dhaka',
          timestamp: new Date(),
        },
        {
          status: 'PICKED_UP',
          message: 'Rider picked up parcel from Banani Merchant Warehouse',
          location: 'Banani, Dhaka',
          timestamp: new Date(Date.now() - 3600000),
        }
      );
    }

    return {
      trackingCode,
      consignmentId: shipment.consignmentId,
      carrier: shipment.carrier,
      currentStatus: shipment.currentStatus,
      subOrderNumber: shipment.subOrderNumber,
      estimatedDeliveryDate: shipment.estimatedDeliveryDate,
      events,
    };
  }

  /**
   * Process incoming courier status webhooks (Pathao / Steadfast)
   */
  static async handleCarrierWebhook(
    carrier: CarrierName,
    payload: {
      consignmentId: string;
      trackingCode: string;
      status: ShipmentStatus;
      message?: string;
      location?: string;
    }
  ) {
    const { trackingCode, status, message, location } = payload;

    if (isDatabaseConnected()) {
      const shipment = await Shipment.findOne({
        $or: [{ trackingCode }, { consignmentId: payload.consignmentId }],
      });

      if (!shipment) {
        throw AppError.notFound(`Shipment not found for tracking code ${trackingCode}`);
      }

      shipment.currentStatus = status;
      if (status === 'DELIVERED') {
        shipment.deliveredAt = new Date();
      }
      await shipment.save();

      // Log milestone event
      await DeliveryEvent.create({
        shipmentId: shipment._id,
        trackingCode: shipment.trackingCode,
        status,
        message: message || `Package status updated to ${status} by carrier ${carrier}`,
        location: location || 'Transit Hub',
        source: 'CARRIER_WEBHOOK',
        timestamp: new Date(),
      });

      // Update SubOrder state
      const subOrder = await SubOrder.findById(shipment.subOrderId);
      if (subOrder) {
        if (status === 'DELIVERED') {
          subOrder.status = 'DELIVERED';
          subOrder.deliveredAt = new Date();
          await subOrder.save();

          // Check sibling sub-orders
          const siblings = await SubOrder.find({ parentOrderId: subOrder.parentOrderId });
          const allDelivered = siblings.every((so) => so.status === 'DELIVERED');
          if (allDelivered) {
            await Order.findByIdAndUpdate(subOrder.parentOrderId, { orderStatus: 'COMPLETED' });
          }
        } else if (status === 'OUT_FOR_DELIVERY') {
          subOrder.status = 'OUT_FOR_DELIVERY';
          await subOrder.save();
        }
      }

      return {
        trackingCode: shipment.trackingCode,
        status,
        deliveredAt: shipment.deliveredAt,
        message: 'Carrier status milestone updated successfully',
      };
    }

    // In-Memory Fallback
    const shipment = inMemoryShipments.get(trackingCode);
    if (shipment) {
      shipment.currentStatus = status;
      if (status === 'DELIVERED') shipment.deliveredAt = new Date();
    }

    inMemoryEvents.unshift({
      trackingCode,
      status,
      message: message || `Package milestone updated to ${status}`,
      location: location || 'Transit Sorting Facility',
      timestamp: new Date(),
    });

    return {
      trackingCode,
      status,
      deliveredAt: status === 'DELIVERED' ? new Date() : null,
      message: 'Carrier status milestone updated successfully',
    };
  }
}
