import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProductEmbeddingDocument extends Document {
  productId: Types.ObjectId;
  vector: number[];
  embeddedText: string;
  embeddingModel: string;
  updatedAt: Date;
}

const productEmbeddingSchema = new Schema<IProductEmbeddingDocument>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      unique: true,
      index: true,
    },
    vector: {
      type: [Number],
      required: true,
    },
    embeddedText: {
      type: String,
      required: true,
    },
    embeddingModel: {
      type: String,
      default: 'text-embedding-3-small',
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

productEmbeddingSchema.index({ productId: 1 }, { unique: true });

export const ProductEmbedding = (mongoose.models.ProductEmbedding as mongoose.Model<IProductEmbeddingDocument>) ||
  mongoose.model<IProductEmbeddingDocument>('ProductEmbedding', productEmbeddingSchema, 'productEmbeddings');
