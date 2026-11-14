import mongoose, { Schema, Document, Types } from 'mongoose';

export type CarrierName = 'PATHAO' | 'STEADFAST' | 'REDX' | 'INTERNAL';
export type ShipmentStatus =
  | 'MANIFEST_CREATED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETURNED_TO_SELLER';

export interface IShipmentDocument extends Document {
  subOrderId: Types.ObjectId;
  subOrderNumber: string;
  carrier: CarrierName;
  consignmentId: string;
  trackingCode: string;
  shippingLabelUrl: string;
  shippingCostCharged: number;
  actualCarrierCost?: number;
  pickupAddress: any;
  deliveryAddress: any;
  currentStatus: ShipmentStatus;
  estimatedDeliveryDate?: Date;
  deliveredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const shipmentSchema = new Schema<IShipmentDocument>(
  {
    subOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'SubOrder',
      required: true,
      unique: true,
      index: true,
    },
    subOrderNumber: {
      type: String,
      required: true,
      index: true,
    },
    carrier: {
      type: String,
      enum: ['PATHAO', 'STEADFAST', 'REDX', 'INTERNAL'],
      default: 'PATHAO',
    },
    consignmentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    trackingCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    shippingLabelUrl: {
      type: String,
      required: true,
    },
    shippingCostCharged: {
      type: Number,
      required: true,
      default: 60,
    },
    actualCarrierCost: {
      type: Number,
      default: 50,
    },
    pickupAddress: {
      type: Schema.Types.Mixed,
      required: true,
    },
    deliveryAddress: {
      type: Schema.Types.Mixed,
      required: true,
    },
    currentStatus: {
      type: String,
      enum: [
        'MANIFEST_CREATED',
        'PICKED_UP',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'FAILED',
        'RETURNED_TO_SELLER',
      ],
      default: 'MANIFEST_CREATED',
      index: true,
    },
    estimatedDeliveryDate: {
      type: Date,
      default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    },
    deliveredAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Shipment = (mongoose.models.Shipment as mongoose.Model<IShipmentDocument>) ||
  mongoose.model<IShipmentDocument>('Shipment', shipmentSchema);
