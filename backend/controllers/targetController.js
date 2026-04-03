const Target = require('../models/Target');
const User = require('../models/User');
const Sale = require('../models/Sale');
const ServiceJob = require('../models/ServiceJob');
const ServiceRequest = require('../models/ServiceRequest');

// @desc    Assign or update a target
// @route   POST /api/targets
// @access  Private/Admin
const assignTarget = async (req, res) => {
  try {
    const { userId, month, year, targetValue, type } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Upsert target
    const target = await Target.findOneAndUpdate(
      { user: userId, month, year, type },
      { 
        targetValue,
        employeeName: user.name,
        employeePhone: user.phone
      },
      { new: true, upsert: true }
    );

    res.status(201).json(target);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all targets with user info and progress
// @route   GET /api/targets
// @access  Private/Admin
const getAllTargets = async (req, res) => {
  try {
    const targets = await Target.find({})
      .populate('user', 'name email role')
      .sort({ year: -1, month: -1 });

    const targetsWithProgress = await Promise.all(targets.map(async (target) => {
      let achievedValue = 0;
      const monthStr = target.month < 10 ? `0${target.month}` : `${target.month}`;
      const periodRegex = new RegExp(`^${target.year}-${monthStr}`);

      if (target.type === 'SALES') {
        const sales = await Sale.find({
          user: target.user._id,
          date: periodRegex
        });
        achievedValue = sales.reduce((sum, s) => sum + s.amount, 0);
      } else if (target.type === 'SERVICE') {
        // Create start and end date of the target month
        const startDate = new Date(target.year, target.month - 1, 1);
        const endDate = new Date(target.year, target.month, 1);
        const jobs = await ServiceRequest.countDocuments({
          assignedEmployee: target.user._id,
          status: 'Completed',
          updatedAt: { $gte: startDate, $lt: endDate }
        });
        achievedValue = jobs;
      }

      return {
        ...target.toObject(),
        achievedValue,
        progress: achievedValue >= target.targetValue ? 100 : Math.round((achievedValue / target.targetValue) * 100)
      };
    }));

    res.json(targetsWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's target for current month
// @route   GET /api/targets/my
// @access  Private
const getMyTarget = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const target = await Target.findOne({
      user: req.user._id,
      month,
      year
    });

    if (!target) {
      return res.json({ message: 'No target set for this month', targetValue: 0, achievedValue: 0, progress: 0 });
    }

    // Calculate progress (Sales or Service)
    let achievedValue = 0;
    const monthStr = target.month < 10 ? `0${target.month}` : `${target.month}`;
    const periodRegex = new RegExp(`^${target.year}-${monthStr}`);

    if (target.type === 'SALES') {
      const sales = await Sale.find({
        user: req.user._id,
        date: periodRegex
      });
      achievedValue = sales.reduce((sum, s) => sum + s.amount, 0);
    } else if (target.type === 'SERVICE') {
      const startDate = new Date(target.year, target.month - 1, 1);
      const endDate = new Date(target.year, target.month, 1);
      const jobs = await ServiceRequest.countDocuments({
        assignedEmployee: req.user._id,
        status: 'Completed',
        updatedAt: { $gte: startDate, $lt: endDate }
      });
      achievedValue = jobs;
    }

    res.json({
      ...target.toObject(),
      achievedValue,
      progress: achievedValue >= target.targetValue ? 100 : Math.round((achievedValue / target.targetValue) * 100)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  assignTarget,
  getAllTargets,
  getMyTarget,
};
