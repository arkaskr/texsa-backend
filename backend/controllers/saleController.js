const Sale = require('../models/Sale');

// @desc    Create new sale record
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res) => {
  try {
    const { 
      customerName, 
      customerPhone, 
      customerAddress, 
      productName, 
      productSku,
      amount, 
      date,
      soldToType,
      employeeId 
    } = req.body;

    // Check if already sold
    if (productSku) {
      const existingSale = await Sale.findOne({ 
        user: req.user._id, 
        productSku,
        soldToType: 'CUSTOM'
      });
      if (existingSale) {
        return res.status(400).json({ message: 'This item (SKU) has already been sold.' });
      }
    }

    const sale = await Sale.create({
      user: req.user._id,
      customerName,
      customerPhone,
      customerAddress,
      employeeName: req.user.name,
      employeePhone: req.user.phone,
      productName,
      productSku,
      amount,
      date,
      soldToType: soldToType || 'CUSTOM',
      employeeId: soldToType === 'EMPLOYEE' ? employeeId : undefined,
    });

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's sales
// @route   GET /api/sales/my
// @access  Private
const getMySales = async (req, res) => {
  try {
    const sales = await Sale.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if a model exists in verified sales
// @route   GET /api/sales/check-model/:modelNumber
// @access  Private
const checkModelStatus = async (req, res) => {
  try {
    const { modelNumber } = req.params;
    const sale = await Sale.findOne({ 
      $or: [
        { productSku: modelNumber }, 
        { productName: modelNumber },
        { productName: { $regex: new RegExp(`^${modelNumber}$`, 'i') } }
      ]
    });
    res.json({ 
      exists: !!sale, 
      productName: sale ? sale.productName : null 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get products assigned to the employee
// @route   GET /api/sales/employee-stock
// @access  Private
const getEmployeeStock = async (req, res) => {
  try {
    // 1. Get all Assigned stock (Verified sales to this employee)
    const assignedSales = await Sale.find({ 
      employeeId: req.user._id,
      soldToType: 'EMPLOYEE',
      status: 'Verified' 
    });

    // 2. Get all Sales already recorded by this employee (CUSTOM sales by this user)
    const madeSales = await Sale.find({
      user: req.user._id,
      soldToType: 'CUSTOM'
    });

    // 3. SKUs already sold
    const soldSkus = new Set(madeSales.map(s => s.productSku).filter(sku => sku));

    // 4. Map to object and filter out already sold
    const stock = assignedSales
      .filter(s => s.productSku && !soldSkus.has(s.productSku))
      .map(s => ({
        name: s.productName,
        number: s.productSku
      }));

    // Filter unique pairs (safety check)
    const uniqueStock = stock.filter((item, index, self) =>
      index === self.findIndex((t) => (
        t.name === item.name && t.number === item.number
      ))
    );

    res.json(uniqueStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSale,
  getMySales,
  checkModelStatus,
  getEmployeeStock,
};
