import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from '@marketplace/types';

export interface IRoleDocument extends Document {
  name: UserRole;
  description: string;
  isSystem: boolean;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRoleDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: [
        'SUPER_ADMIN',
        'ADMIN',
        'PRODUCT_MANAGER',
        'ORDER_MANAGER',
        'FINANCE_MANAGER',
        'SUPPORT_AGENT',
        'SELLER',
        'CUSTOMER',
      ],
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    isSystem: {
      type: Boolean,
      default: true,
    },
    permissions: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Role: Model<IRoleDocument> =
  mongoose.models.Role || mongoose.model<IRoleDocument>('Role', roleSchema);
