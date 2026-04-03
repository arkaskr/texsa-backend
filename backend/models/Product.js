const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 1,
    },
    status: {
      type: String,
      enum: ['High Stock', 'Medium Stock', 'Low Stock', 'Out of Stock'],
      default: 'High Stock',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to update status based on stock
productSchema.pre('save', function () {
  if (this.stock === 0) {
    this.status = 'Out of Stock';
  } else if (this.stock < 5) {
    this.status = 'Low Stock';
  } else if (this.stock < 15) {
    this.status = 'Medium Stock';
  } else {
    this.status = 'High Stock';
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
