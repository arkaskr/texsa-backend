const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    date: {
      type: String,
      required: true, // Format: YYYY-MM-DD
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only have one attendance record per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
