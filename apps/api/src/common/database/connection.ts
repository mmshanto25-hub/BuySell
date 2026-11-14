import mongoose from 'mongoose';
import { ENV } from '../config/env';

let isConnected = false;

export async function connectDatabase(): Promise<boolean> {
  if (isConnected) {
    return true;
  }

  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
      autoIndex: true,
    });

    isConnected = conn.connection.readyState === 1;
    console.log(`[DATABASE] MongoDB connected successfully to ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error: any) {
    console.warn(`[DATABASE WARNING] Could not connect to MongoDB at ${ENV.MONGODB_URI} (${error.message}).`);
    console.warn('[DATABASE WARNING] Operating in resilient fallback mode. Persistent DB queries will fail gracefully.');
    isConnected = false;
    return false;
  }
}

export function isDatabaseConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export async function disconnectDatabase(): Promise<void> {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[DATABASE] Disconnected from MongoDB.');
  }
}
