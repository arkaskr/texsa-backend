const mongoose = require('mongoose');

const saleSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  customerName: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
  },
  customerAddress: {
    type: String,
  },
  soldToType: {
    type: String,
    enum: ['CUSTOM', 'EMPLOYEE'],
    default: 'CUSTOM',
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  employeeName: {
    type: String,
  },
  employeePhone: {
    type: String,
  },
  productName: {
    type: String,
    required: true,
  },
  productSku: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending',
  },
}, {
  timestamps: true,
});

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
