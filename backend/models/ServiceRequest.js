const mongoose = require('mongoose');

const serviceRequestSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  userType: {
    type: String,
    enum: ['Customer', 'Dealer'],
    default: 'Customer',
  },
  productName: {
    type: String,
    required: true,
  },
  modelName: {
    type: String,
    required: true,
  },
  customerName: {
    type: String, // For Dealers booking for customers
  },
  customerPhone: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  serviceDate: {
    type: String, // yyyy-MM-dd
    required: true,
  },
  serviceTime: {
    type: String, // e.g. "10:00 AM - 12:00 PM"
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Employee Rejected', 'Accepted', 'Under Review', 'Completed', 'Failed'],
    default: 'Pending',
  },
  assignedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  completionDescription: {
    type: String,
  },
  failureImage: {
    type: String,
  },
  receiptImage: {
    type: String,
  },
  productImages: [{
    type: String,
  }],
  completedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

module.exports = ServiceRequest;
