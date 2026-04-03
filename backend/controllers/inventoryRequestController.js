const InventoryRequest = require('../models/InventoryRequest');
const User = require('../models/User');
const { sendPushNotification } = require('../config/firebase');

// @desc    Create new inventory request
// @route   POST /api/inventory/requests
// @access  Private
const createInventoryRequest = async (req, res) => {
  try {
    const { productName, quantity, requiredDate, requesterName } = req.body;

    const request = await InventoryRequest.create({
      user: req.user._id,
      requesterName,
      employeeName: req.user.name,
      employeePhone: req.user.phone,
      productName,
      quantity,
      requiredDate,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all inventory requests (Admin)
// @route   GET /api/inventory/requests
// @access  Private/Admin
const getInventoryRequests = async (req, res) => {
  try {
    let requests = await InventoryRequest.find({})
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    const now = new Date();

    // Mapping and updating logic
    requests = await Promise.all(requests.map(async (request) => {
      const dueDate = new Date(request.requiredDate);
      const diffTime = dueDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Auto-fail if overdue and not completed/failed
      if (diffTime < 0 && (request.status === 'Pending' || request.status === 'Approved')) {
        request.status = 'Failed';
        await request.save();
      }

      // Calculate priority
      let priority = 'Low';
      if (diffDays <= 5) priority = 'High';
      else if (diffDays <= 15) priority = 'Medium';

      return {
        ...request.toObject(),
        priority,
        daysRemaining: diffDays
      };
    }));

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update request status (Admin)
// @route   PUT /api/inventory/requests/:id
// @access  Private/Admin
const updateInventoryRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await InventoryRequest.findById(req.params.id);

    if (request) {
      request.status = status;
      const updatedRequest = await request.save();

      try {
        const employee = await User.findById(request.user);
        if (employee && employee.fcmToken && (status === 'Approved' || status === 'Failed')) {
           sendPushNotification(employee.fcmToken, 'Stock Request Update', `Your request for ${request.quantity}x ${request.productName} is now ${status}.`);
        }
      } catch (err) {
        console.error("FCM failed silently", err);
      }

      res.json(updatedRequest);
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's inventory requests
// @route   GET /api/inventory-requests/my
// @access  Private
const getUserInventoryRequests = async (req, res) => {
  try {
    const requests = await InventoryRequest.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    const now = new Date();
    const formattedRequests = requests.map(request => {
      const dueDate = new Date(request.requiredDate);
      const diffTime = dueDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let priority = 'Low';
      if (diffDays <= 5) priority = 'High';
      else if (diffDays <= 15) priority = 'Medium';

      return {
        ...request.toObject(),
        priority
      };
    });

    res.json(formattedRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createInventoryRequest,
  getInventoryRequests,
  updateInventoryRequestStatus,
  getUserInventoryRequests
};
