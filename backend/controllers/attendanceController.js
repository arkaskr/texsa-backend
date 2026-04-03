const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private
const markAttendance = async (req, res) => {
  try {
    const { latitude, longitude, date } = req.body;

    if (!latitude || !longitude || !date) {
      return res.status(400).json({ message: 'Please provide latitude, longitude and date' });
    }

    // Check if attendance already marked for today
    const attendanceExists = await Attendance.findOne({
      user: req.user._id,
      date: date,
    });

    if (attendanceExists) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }

    const attendance = await Attendance.create({
      user: req.user._id,
      date,
      location: {
        latitude,
        longitude,
      },
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's attendance for today
// @route   GET /api/attendance/today
// @access  Private
const checkTodayAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
        return res.status(400).json({ message: 'Please provide date' });
    }

    const attendance = await Attendance.findOne({
      user: req.user._id,
      date: date,
    });

    res.json({ marked: !!attendance, attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all attendance logs (Admin)
// @route   GET /api/attendance/all
// @access  Private/Admin
const getAllAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    let query = {};
    if (date) {
        query.date = date;
    }

    const attendanceLogs = await Attendance.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    res.json(attendanceLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance logs for a specific user (Admin or Self)
// @route   GET /api/attendance/user/:userId
// @access  Private
const getUserAttendance = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Only Admin or the user themselves can view their logs
    if (req.user.role !== 'ADMIN' && req.user._id.toString() !== userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const attendanceLogs = await Attendance.find({ user: userId })
      .sort({ date: -1 });

    res.json(attendanceLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  markAttendance,
  checkTodayAttendance,
  getAllAttendance,
  getUserAttendance,
};
