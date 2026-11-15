import { Schema, model, Document, Types } from 'mongoose';
import { AccountCode, EntryType } from '@marketplace/types';

export interface ILedgerEntryDocument extends Document {
  journalId: string;
  accountCode: AccountCode;
  entityType: 'PLATFORM' | 'SELLER' | 'CUSTOMER' | 'GATEWAY';
  entityId?: Types.ObjectId;
  entryType: EntryType;
  amount: number;
  referenceType: 'ORDER' | 'SUB_ORDER' | 'ESCROW_RELEASE' | 'SETTLEMENT' | 'REFUND' | 'DISPUTE';
  referenceId: string;
  description: string;
  postedAt: Date;
}

const ledgerEntrySchema = new Schema<ILedgerEntryDocument>(
  {
    journalId: {
      type: String,
      required: [true, 'Journal ID grouping matching debit and credit legs is required'],
      index: true,
    },
    accountCode: {
      type: String,
      required: [true, 'Standardized chart of accounts code is required'],
      enum: {
        values: ['1010', '1020', '2010', '2020', '4010', '5010'],
        message: '{VALUE} is not a recognized GAAP chart of account code',
      },
    },
    entityType: {
      type: String,
      required: true,
      enum: ['PLATFORM', 'SELLER', 'CUSTOMER', 'GATEWAY'],
    },
    entityId: {
      type: Schema.Types.ObjectId,
      refPath: 'entityType',
      default: null,
    },
    entryType: {
      type: String,
      required: true,
      enum: ['DEBIT', 'CREDIT'],
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Ledger entry amount must be at least 0.01'],
    },
    referenceType: {
      type: String,
      required: true,
      enum: ['ORDER', 'SUB_ORDER', 'ESCROW_RELEASE', 'SETTLEMENT', 'REFUND', 'DISPUTE'],
    },
    referenceId: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    postedAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

// Compound indexes for high-speed audit and reconciliation queries
ledgerEntrySchema.index({ accountCode: 1, entityId: 1, postedAt: -1 });
ledgerEntrySchema.index({ journalId: 1, entryType: 1 });
ledgerEntrySchema.index({ referenceType: 1, referenceId: 1 });

export const LedgerEntry = model<ILedgerEntryDocument>('LedgerEntry', ledgerEntrySchema, 'ledgerEntries');
