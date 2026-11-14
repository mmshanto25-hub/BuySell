import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategoryDocument extends Document {
  name: string;
  slug: string;
  parentId?: mongoose.Types.ObjectId | null;
  ancestors: mongoose.Types.ObjectId[];
  level: number;
  iconUrl?: string;
  bannerUrl?: string;
  commissionRate: number;
  attributeTemplates?: { name: string; isRequired: boolean; options?: string[] }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    ancestors: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        index: true,
      },
    ],
    level: {
      type: Number,
      default: 0,
    },
    iconUrl: { type: String, default: null },
    bannerUrl: { type: String, default: null },
    commissionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 10,
    },
    attributeTemplates: [
      {
        name: { type: String, required: true },
        isRequired: { type: Boolean, default: false },
        options: [{ type: String }],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ parentId: 1, isActive: 1 });

export const Category: Model<ICategoryDocument> =
  mongoose.models.Category || mongoose.model<ICategoryDocument>('Category', categorySchema);
