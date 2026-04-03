const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

// @desc    Submit a leave request
// @route   POST /api/leaves
// @access  Private
const submitLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Please provide start date, end date and reason' });
    }

    const leaveRequest = await LeaveRequest.create({
      user: req.user._id,
      startDate,
      endDate,
      reason,
    });

    res.status(201).json(leaveRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's leave requests
// @route   GET /api/leaves/me
// @access  Private
const getMyLeaves = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all leave requests (Admin)
// @route   GET /api/leaves/all
// @access  Private/Admin
const getAllLeaves = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({})
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update leave request status (Approve/Reject) (Admin)
// @route   PATCH /api/leaves/:id/status
// @access  Private/Admin
const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (leaveRequest) {
      leaveRequest.status = status;
      const updatedLeaveRequest = await leaveRequest.save();
      res.json(updatedLeaveRequest);
    } else {
      res.status(404).json({ message: 'Leave request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
};
