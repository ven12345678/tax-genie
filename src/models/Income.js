import mongoose from 'mongoose';

const IncomeSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
  },
  source: {
    type: String,
    required: [true, 'Please provide a source'],
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date'],
  },
  description: {
    type: String,
    required: false,
  },
  category: {
    type: String,
    required: false,
  },
  documentUrl: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Income || mongoose.model('Income', IncomeSchema); 