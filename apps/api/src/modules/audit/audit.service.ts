import { Types } from 'mongoose';
import { AuditLog } from './auditLog.model';
import { isDatabaseConnected } from '../../common/database/connection';

// In-Memory Fallback Audit Log Storage
const inMemoryAuditLogs: Array<{
  id: string;
  actorId?: string;
  actorRole: string;
  action: string;
  targetCollection: string;
  targetId: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}> = [];

export class AuditService {
  /**
   * Log an immutable administrative or security mutation
   */
  static async log(params: {
    actorId?: string;
    actorRole: string;
    action: string;
    targetCollection: string;
    targetId: string;
    beforeState?: Record<string, any>;
    afterState?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    if (isDatabaseConnected()) {
      return await AuditLog.create({
        actorId: params.actorId ? new Types.ObjectId(params.actorId) : null,
        actorRole: params.actorRole,
        action: params.action,
        targetCollection: params.targetCollection,
        targetId: params.targetId,
        beforeState: params.beforeState || null,
        afterState: params.afterState || null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
        timestamp: new Date(),
      });
    }

    // In-memory fallback
    const logEntry = {
      id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      actorId: params.actorId,
      actorRole: params.actorRole,
      action: params.action,
      targetCollection: params.targetCollection,
      targetId: params.targetId,
      beforeState: params.beforeState,
      afterState: params.afterState,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      timestamp: new Date(),
    };
    inMemoryAuditLogs.unshift(logEntry);
    return logEntry;
  }

  /**
   * Query audit logs with pagination and filtering
   */
  static async getAuditLogs(query: {
    action?: string;
    targetCollection?: string;
    actorId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));

    if (isDatabaseConnected()) {
      const filter: Record<string, any> = {};
      if (query.action) filter.action = query.action;
      if (query.targetCollection) filter.targetCollection = query.targetCollection;
      if (query.actorId) filter.actorId = new Types.ObjectId(query.actorId);

      const totalItems = await AuditLog.countDocuments(filter);
      const logs = await AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      return {
        logs,
        meta: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          hasNextPage: page * limit < totalItems,
          hasPrevPage: page > 1,
        },
      };
    }

    // In-Memory
    let filtered = [...inMemoryAuditLogs];
    if (query.action) filtered = filtered.filter((l) => l.action === query.action);
    if (query.targetCollection) filtered = filtered.filter((l) => l.targetCollection === query.targetCollection);
    if (query.actorId) filtered = filtered.filter((l) => l.actorId === query.actorId);

    const totalItems = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return {
      logs: paginated,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        hasNextPage: page * limit < totalItems,
        hasPrevPage: page > 1,
      },
    };
  }
}
