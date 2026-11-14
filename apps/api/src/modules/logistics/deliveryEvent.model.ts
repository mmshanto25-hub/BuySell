import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDeliveryEventDocument extends Document {
  shipmentId: Types.ObjectId;
  trackingCode: string;
  status: string;
  message: string;
  location?: string;
  source: 'CARRIER_WEBHOOK' | 'MANUAL_OVERRIDE' | 'SYSTEM';
  timestamp: Date;
}

const deliveryEventSchema = new Schema<IDeliveryEventDocument>(
  {
    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Shipment',
      required: true,
      index: true,
    },
    trackingCode: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: 'Sorting Hub, Dhaka',
    },
    source: {
      type: String,
      enum: ['CARRIER_WEBHOOK', 'MANUAL_OVERRIDE', 'SYSTEM'],
      default: 'CARRIER_WEBHOOK',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
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

deliveryEventSchema.index({ trackingCode: 1, timestamp: -1 });

export const DeliveryEvent = (mongoose.models.DeliveryEvent as mongoose.Model<IDeliveryEventDocument>) ||
  mongoose.model<IDeliveryEventDocument>('DeliveryEvent', deliveryEventSchema);
