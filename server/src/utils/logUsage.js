import UsageLog from '../models/UsageLog.js';

export async function logUsage(data) {
  try {
    if (!process.env.MONGO_URI) return;
    await UsageLog.create(data);
  } catch (error) {
    console.warn('Usage logging failed:', error.message);
  }
}
