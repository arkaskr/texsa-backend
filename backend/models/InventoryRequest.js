const mongoose = require('mongoose');

const inventoryRequestSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    requesterName: {
      type: String,
      required: true,
    },
    employeeName: {
      type: String, // Account holder's name
      required: true,
    },
    employeePhone: {
      type: String, // Account holder's phone
    },
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    requiredDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Approved', 'Completed', 'Failed'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

const InventoryRequest = mongoose.model('InventoryRequest', inventoryRequestSchema);

module.exports = InventoryRequest;
