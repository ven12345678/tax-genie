import mongoose from 'mongoose';

const TaxSummarySchema = new mongoose.Schema({
  totalIncome: {
    type: Number,
    required: true,
  },
  totalDeductions: {
    type: Number,
    required: true,
  },
  taxableIncome: {
    type: Number,
    required: true,
  },
  estimatedTax: {
    type: Number,
    required: true,
  },
  declarableExpenses: {
    type: Array,
    required: false,
    default: [],
  },
  taxReliefExpenses: {
    type: Array,
    required: false,
    default: [],
  },
  analysis: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.TaxSummary || mongoose.model('TaxSummary', TaxSummarySchema); 