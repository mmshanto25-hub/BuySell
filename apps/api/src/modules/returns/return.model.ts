import mongoose, { Schema, Document, Types } from 'mongoose';

export type ReturnReason = 'DAMAGED' | 'DEFECTIVE' | 'WRONG_ITEM' | 'NOT_AS_DESCRIBED' | 'SIZE_FIT';
export type ReturnStatus =
  | 'REQUESTED'
  | 'SELLER_ACCEPTED'
  | 'SELLER_CONTESTED'
  | 'IN_ARBITRATION'
  | 'RETURN_SHIPPED'
  | 'INSPECTED'
  | 'REFUNDED'
  | 'REJECTED';

export interface IReturnItemSubdoc {
  orderItemId: Types.ObjectId;
  quantity: number;
  reason: ReturnReason;
  details: string;
  images: string[];
}

export interface IReturnDocument extends Document {
  returnNumber: string;
  subOrderId: Types.ObjectId;
  subOrderNumber: string;
  parentOrderId: Types.ObjectId;
  customerId: Types.ObjectId;
  sellerId: Types.ObjectId;
  storeId: Types.ObjectId;
  items: IReturnItemSubdoc[];
  refundAmount: number;
  status: ReturnStatus;
  arbitratedBy?: Types.ObjectId | null;
  sellerContestReason?: string | null;
  adminResolutionNotes?: string | null;
  resolvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const returnItemSchema = new Schema<IReturnItemSubdoc>(
  {
    orderItemId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      enum: ['DAMAGED', 'DEFECTIVE', 'WRONG_ITEM', 'NOT_AS_DESCRIBED', 'SIZE_FIT'],
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  { _id: true }
);

const returnSchema = new Schema<IReturnDocument>(
  {
    returnNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    subOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'SubOrder',
      required: true,
      index: true,
    },
    subOrderNumber: {
      type: String,
      required: true,
      index: true,
    },
    parentOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
      index: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    items: {
      type: [returnItemSchema],
      required: true,
      validate: [(v: any[]) => v.length > 0, 'Return request must include at least one item'],
    },
    refundAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        'REQUESTED',
        'SELLER_ACCEPTED',
        'SELLER_CONTESTED',
        'IN_ARBITRATION',
        'RETURN_SHIPPED',
        'INSPECTED',
        'REFUNDED',
        'REJECTED',
      ],
      default: 'REQUESTED',
      index: true,
    },
    arbitratedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    sellerContestReason: {
      type: String,
      default: null,
    },
    adminResolutionNotes: {
      type: String,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
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

export const ReturnRequest = (mongoose.models.ReturnRequest as mongoose.Model<IReturnDocument>) ||
  mongoose.model<IReturnDocument>('ReturnRequest', returnSchema);
