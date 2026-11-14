import mongoose, { Schema, Document, Model } from 'mongoose';
import { MovementType } from '@marketplace/types';

export interface IInventoryMovementDocument extends Document {
  inventoryId: mongoose.Types.ObjectId;
  sku: string;
  type: MovementType;
  quantityChanged: number;
  previousAvailable: number;
  newAvailable: number;
  referenceId: string;
  performedBy?: mongoose.Types.ObjectId;
  reason?: string;
  createdAt: Date;
}

const movementSchema = new Schema<IInventoryMovementDocument>(
  {
    inventoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'INITIAL',
        'RESTOCK',
        'RESERVATION_LOCKED',
        'RESERVATION_EXPIRED',
        'ORDER_FULFILLED',
        'RETURN_RESTOCKED',
        'MANUAL_ADJUSTMENT',
      ],
      required: true,
      index: true,
    },
    quantityChanged: {
      type: Number,
      required: true,
    },
    previousAvailable: {
      type: Number,
      required: true,
    },
    newAvailable: {
      type: Number,
      required: true,
    },
    referenceId: {
      type: String,
      required: true,
      index: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

movementSchema.index({ sku: 1, createdAt: -1 });

export const InventoryMovement: Model<IInventoryMovementDocument> =
  mongoose.models.InventoryMovement || mongoose.model<IInventoryMovementDocument>('InventoryMovement', movementSchema);
