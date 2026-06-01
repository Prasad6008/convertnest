import UsageLog from '../models/UsageLog.js';
import mongoose from 'mongoose';

export async function logUsage(data) {
  try {
    // Match the same logic as server.js
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.warn('No MongoDB URI, skipping log');
      return;
    }

    // Check mongoose is actually connected
    if (mongoose.connection.readyState !== 1) {
      console.warn('MongoDB not connected, readyState:', mongoose.connection.readyState);
      return;
    }

    const saved = await UsageLog.create(data);
    console.log('✅ Usage logged:', saved._id);
  } catch (error) {
    console.error('❌ Usage logging failed:', error.message);
  }
}
