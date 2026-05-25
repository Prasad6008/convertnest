import mongoose from 'mongoose';

const usageLogSchema = new mongoose.Schema({
  tool: String,
  inputFileName: String,
  outputFileName: String,
  inputSize: Number,
  outputSize: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.UsageLog || mongoose.model('UsageLog', usageLogSchema);
