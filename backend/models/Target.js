const mongoose = require('mongoose');

const targetSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
  },
  targetValue: {
    type: Number,
    required: true,
  },
  employeeName: {
    type: String,
  },
  employeePhone: {
    type: String,
  },
  type: {
    type: String,
    required: true,
    enum: ['SALES', 'SERVICE'],
  },
}, {
  timestamps: true,
});

// Compound index to ensure one target per user per month/year/type
targetSchema.index({ user: 1, month: 1, year: 1, type: 1 }, { unique: true });

const Target = mongoose.model('Target', targetSchema);

module.exports = Target;
