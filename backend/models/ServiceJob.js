const mongoose = require('mongoose');

const serviceJobSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  customerName: {
    type: String,
    required: true,
  },
  jobType: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Completed', 'Rejected'],
    default: 'Pending',
  },
  completionDate: {
    type: String, // yyyy-MM-dd
  },
}, {
  timestamps: true,
});

const ServiceJob = mongoose.model('ServiceJob', serviceJobSchema);

module.exports = ServiceJob;
