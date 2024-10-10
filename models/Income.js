const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true },
  source: { type: String, required: true },
  amount: { type: Number, required: true },
  investments: { type: Array, default: [] }
}, { timestamps: true });

const Income = mongoose.model('Income', IncomeSchema);
module.exports = Income;
