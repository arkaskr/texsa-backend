const Sale = require('../models/Sale');
const Product = require('../models/Product');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const Target = require('../models/Target');

// @desc    Get dashboard analytics data
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
const getDashboardAnalytics = async (req, res) => {
  try {
    // 1. Summary Stats
    const totalSalesDoc = await Sale.aggregate([
      { $match: { status: 'Verified' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $count: {} } } }
    ]);
    
    const totalRevenue = totalSalesDoc.length > 0 ? totalSalesDoc[0].total : 0;
    const totalSalesCount = totalSalesDoc.length > 0 ? totalSalesDoc[0].count : 0;

    const activeUsers = await User.countDocuments({ isActive: true });
    
    const products = await Product.find({});
    const lowStockCount = products.filter(p => p.stock < 5).length;
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

    const pendingLeaves = await LeaveRequest.countDocuments({ status: 'PENDING' });
    const openServiceRequests = await ServiceRequest.countDocuments({ status: { $in: ['Pending', 'Accepted', 'Under Review'] } });

    // 2. Revenue Trend (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const revenueTrend = await Sale.aggregate([
      { $match: { status: 'Verified', date: { $gte: dateStr } } },
      { $group: { _id: '$date', amount: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]);

    // 3. Category Distribution
    const categoryData = await Product.aggregate([
      { $group: { _id: '$category', value: { $sum: '$stock' }, count: { $count: {} } } },
      { $project: { name: '$_id', value: 1, count: 1, _id: 0 } }
    ]);

    // 4. Employee Performance (Sales)
    const employeeSales = await Sale.aggregate([
      { $match: { status: 'Verified' } },
      { $group: { _id: '$user', totalSales: { $sum: '$amount' } } },
      { $sort: { totalSales: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      { $project: { name: '$userDetails.name', value: '$totalSales' } }
    ]);

    res.json({
      summary: {
        totalRevenue,
        totalSalesCount,
        activeUsers,
        lowStockCount,
        totalInventoryValue,
        pendingLeaves,
        openServiceRequests
      },
      revenueTrend,
      categoryData,
      employeeSales
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comprehensive employee report data
// @route   GET /api/analytics/employee-report/:employeeId?month=YYYY-MM
// @access  Private/Admin
const getEmployeeReport = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month } = req.query; // format 'YYYY-MM'

    if (!month) {
      return res.status(400).json({ message: 'Month query parameter is required (YYYY-MM)' });
    }

    const [yearStr, monthStr] = month.split('-');
    const yearNum = parseInt(yearStr);
    const monthNum = parseInt(monthStr);

    const user = await User.findById(employeeId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const isSales = user.role === 'SALES_EMPLOYEE';
    const isService = user.role === 'SERVICE_EMPLOYEE';

    // Regex for string fields like "YYYY-MM"
    const monthRegex = new RegExp(`^${month}`);

    // Date range for Date fields
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 1);

    const attendance = await Attendance.find({ user: employeeId, date: monthRegex });
    const leaves = await LeaveRequest.find({ 
      user: employeeId,
      startDate: { $gte: startDate, $lt: endDate }
    });

    let performanceData = [];
    let targets = {};

    if (isSales) {
      performanceData = await Sale.find({ user: employeeId, date: monthRegex });
      targets = await Target.findOne({ user: employeeId, month: monthNum, year: yearNum }) || {};
    } else if (isService) {
      performanceData = await ServiceRequest.find({ 
        assignedEmployee: employeeId, 
        serviceDate: monthRegex 
      });
      targets = await Target.findOne({ user: employeeId, month: monthNum, year: yearNum }) || {};
    }

    res.json({
      employee: {
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone
      },
      attendance,
      leaves,
      performanceData,
      targets
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardAnalytics,
  getEmployeeReport,
};
