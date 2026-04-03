const User = require('../models/User');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const ServiceRequest = require('../models/ServiceRequest');
const ServiceJob = require('../models/ServiceJob');
const InventoryRequest = require('../models/InventoryRequest');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    // User counts
    const totalUsers = await User.countDocuments();
    const admins = await User.countDocuments({ role: 'ADMIN' });
    const customers = await User.countDocuments({ role: 'CUSTOMER' });
    const serviceEmployees = await User.countDocuments({ role: 'SERVICE_EMPLOYEE' });
    const salesEmployees = await User.countDocuments({ role: 'SALES_EMPLOYEE' });

    // Inventory value
    const products = await Product.find({});
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

    // Revenue calculation (Only counting Admin-created sales to avoid double-counting)
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    
    const adminUsers = await User.find({ role: 'ADMIN' }).select('_id');
    const adminIds = adminUsers.map(u => u._id);

    const monthlySales = await Sale.find({
      user: { $in: adminIds },
      date: { $regex: new RegExp(`^${currentMonthPrefix}`) },
      status: 'Verified'
    });
    
    const monthlyRevenue = monthlySales.reduce((acc, sale) => acc + sale.amount, 0);

    res.json({
        users: {
            total: totalUsers,
            admins,
            customers,
            serviceEmployees,
            salesEmployees
        },
        inventory: {
            totalValue: totalInventoryValue,
            totalItems: products.length
        },
        revenue: {
            monthly: monthlyRevenue,
            currentMonth: currentMonthPrefix
        }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard activities
// @route   GET /api/dashboard/activities
// @access  Private/Admin
const getRecentActivities = async (req, res) => {
  try {
    const limit = 10;
    
    // Fetch users
    const users = await User.find({}).sort({ createdAt: -1 }).limit(limit);
    const userActivities = users.map(u => ({
      id: u._id,
      type: 'user',
      subject: u.name,
      action: `Created new user (${u.role})`,
      time: u.createdAt,
      status: u.isActive ? 'Active' : 'Inactive'
    }));

    // Fetch service requests
    const serviceRequests = await ServiceRequest.find({}).sort({ createdAt: -1 }).limit(limit);
    const serviceActivities = serviceRequests.map(sr => ({
      id: sr._id,
      type: 'service',
      subject: sr.productName,
      action: `Service request received for ${sr.modelName}`,
      time: sr.createdAt,
      status: sr.status
    }));

    // Fetch sales
    const sales = await Sale.find({}).sort({ createdAt: -1 }).limit(limit);
    const saleActivities = sales.map(s => ({
      id: s._id,
      type: 'sale',
      subject: s.productName,
      action: `Sold by ${s.employeeName || 'Admin'}`,
      time: s.createdAt,
      status: s.status
    }));

    // Fetch jobs
    const jobs = await ServiceJob.find({}).sort({ createdAt: -1 }).limit(limit);
    const jobActivities = jobs.map(j => ({
      id: j._id,
      type: 'job',
      subject: j.customerName,
      action: `Job: ${j.jobType}`,
      time: j.createdAt,
      status: j.status
    }));

    // Fetch inventory requests
    const inventoryRequests = await InventoryRequest.find({}).sort({ createdAt: -1 }).limit(limit);
    const inventoryActivities = inventoryRequests.map(ir => ({
      id: ir._id,
      type: 'inventory',
      subject: ir.requesterName,
      action: `Restock request for ${ir.productName}`,
      time: ir.createdAt,
      status: ir.status
    }));

    let allActivities = [
      ...userActivities,
      ...serviceActivities,
      ...saleActivities,
      ...jobActivities,
      ...inventoryActivities
    ];

    allActivities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    // Return top 20
    res.json(allActivities.slice(0, 20));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard recent sales
// @route   GET /api/dashboard/sales
// @access  Private/Admin
const getRecentSales = async (req, res) => {
  try {
    const sales = await Sale.find({}).sort({ createdAt: -1 }).limit(10);
    
    const formattedSales = sales.map(s => ({
      id: s._id,
      product: s.productName,
      amount: `₹${s.amount.toLocaleString()}`,
      customer: s.customerName,
      time: s.createdAt,
      employee: s.employeeName || 'Admin'
    }));
    
    res.json(formattedSales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStats,
  getRecentActivities,
  getRecentSales,
};
