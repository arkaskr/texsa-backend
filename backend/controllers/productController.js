const Product = require('../models/Product');
const Sale = require('../models/Sale');

// @desc    Get all inventory products
// @route   GET /api/inventory
// @access  Private/Admin
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a single product
// @route   POST /api/inventory
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, sku, category, price, quantity } = req.body;

    const productExists = await Product.findOne({ sku });
    if (productExists) {
      return res.status(400).json({ message: 'Product with this SKU already exists' });
    }

    const product = await Product.create({
      name,
      sku,
      category,
      price,
      stock: quantity || 1,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk create sequential products
// @route   POST /api/inventory/bulk
// @access  Private/Admin
const createBulkProducts = async (req, res) => {
  try {
    const { name, sku, category, price, quantity } = req.body;
    const count = parseInt(quantity);

    if (isNaN(count) || count < 1) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    // Identify numerical suffix
    const match = sku.match(/^(.*?)(\d+)$/);
    if (!match) {
      return res.status(400).json({ message: 'SKU must end with a number for bulk insertion' });
    }

    const prefix = match[1];
    const startingNumStr = match[2];
    const numLength = startingNumStr.length;
    let currentNum = parseInt(startingNumStr);

    const productsToCreate = [];
    const existingSkus = [];

    for (let i = 0; i < count; i++) {
        const currentSku = `${prefix}${currentNum.toString().padStart(numLength, '0')}`;
        
        // Check if SKU exists already in DB
        const skuExists = await Product.findOne({ sku: currentSku });
        if (skuExists) {
            existingSkus.push(currentSku);
        } else {
            productsToCreate.push({
                name,
                sku: currentSku,
                category,
                price,
                stock: 1, // Individual records
            });
        }
        currentNum++;
    }

    if (existingSkus.length > 0) {
        return res.status(400).json({ 
            message: `Some SKUs already exist: ${existingSkus.join(', ')}`,
            existingSkus 
        });
    }

    const createdProducts = await Product.insertMany(productsToCreate);
    res.status(201).json(createdProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/inventory/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.category = category || product.category;
      product.price = price || product.price;
      product.stock = stock !== undefined ? stock : product.stock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/inventory/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark product as sold
// @route   POST /api/inventory/:id/sold
// @access  Private/Admin
const markProductAsSold = async (req, res) => {
  try {
    const { 
        customerName, 
        customerPhone, 
        customerAddress, 
        soldToType, 
        employeeId, 
        employeeName, 
        employeePhone, 
        price, 
        date 
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Create a sale record
    const sale = await Sale.create({
      user: req.user._id, // Admin who recorded it
      customerName,
      customerPhone,
      customerAddress,
      soldToType,
      employeeId,
      employeeName,
      employeePhone,
      productName: product.name,
      productSku: product.sku,
      amount: price || product.price,
      date,
      status: 'Verified', // Admin sales are pre-verified
    });

    // Remove product from inventory
    await product.deleteOne();

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all sold products (sales)
// @route   GET /api/inventory/sold
// @access  Private/Admin
const getSoldProducts = async (req, res) => {
  try {
    const sales = await Sale.find({}).sort({ date: -1, createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markProductsAsSoldBulk = async (req, res) => {
  try {
    const { 
        ids, // Array of product IDs
        customerName, 
        customerPhone, 
        customerAddress, 
        soldToType, 
        employeeId, 
        employeeName, 
        employeePhone, 
        price, 
        date 
    } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'No products selected for bulk sale' });
    }

    const products = await Product.find({ _id: { $in: ids } });
    
    if (products.length === 0) {
        return res.status(404).json({ message: 'No matching products found in inventory' });
    }

    // Create a sale record for each product
    const sales = products.map(product => {
        // Calculate price per unit if total price provided, else use product price
        const finalAmount = price ? (parseFloat(price) / products.length) : product.price;
        
        const saleData = {
            user: req.user._id,
            productName: product.name,
            productSku: product.sku,
            amount: finalAmount,
            customerName,
            customerPhone,
            customerAddress,
            soldToType: soldToType || 'CUSTOM',
            employeeName,
            employeePhone,
            date,
            status: 'Verified'
        };

        // Only add employeeId if it's a valid non-empty string
        if (employeeId && employeeId.trim() !== '') {
            saleData.employeeId = employeeId;
        }

        return saleData;
    });

    await Sale.insertMany(sales);
    
    // Remove products from inventory
    await Product.deleteMany({ _id: { $in: products.map(p => p._id) } });

    res.status(201).json({ message: `Successfully sold ${products.length} items`, count: products.length });
  } catch (error) {
    console.error('Bulk Sale Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  createProduct,
  createBulkProducts,
  updateProduct,
  deleteProduct,
  markProductAsSold,
  getSoldProducts,
  markProductsAsSoldBulk,
};
