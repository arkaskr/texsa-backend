const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['CUSTOMER', 'SERVICE_EMPLOYEE', 'SALES_EMPLOYEE', 'ADMIN'],
      default: 'CUSTOMER',
    },
    // Additional fields for Employee or Admin can be added here
    phone: {
      type: String,
    },
    address: {
      type: String,
      default: ''
    },
    monthlyTarget: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    fcmToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Method to match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
