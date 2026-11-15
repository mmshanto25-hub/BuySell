import { Schema, model, Document, Types } from 'mongoose';

export interface IAuditLogDocument extends Document {
  actorId?: Types.ObjectId;
  actorRole: string;
  action: string;
  targetCollection: string;
  targetId: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    actorRole: {
      type: String,
      required: true,
      default: 'SYSTEM',
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    targetCollection: {
      type: String,
      required: true,
    },
    targetId: {
      type: String,
      required: true,
      index: true,
    },
    beforeState: {
      type: Schema.Types.Mixed,
      default: null,
    },
    afterState: {
      type: Schema.Types.Mixed,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    timestamp: {
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

auditLogSchema.index({ actorId: 1, timestamp: -1 });
auditLogSchema.index({ targetCollection: 1, targetId: 1 });
auditLogSchema.index({ timestamp: -1 });

export const AuditLog = model<IAuditLogDocument>('AuditLog', auditLogSchema, 'auditLogs');
