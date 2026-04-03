const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const { sendPushNotification } = require('../config/firebase');

// @desc    Create new service request
// @route   POST /api/service-requests
// @access  Private
const createServiceRequest = async (req, res) => {
  try {
    const { 
      userType, 
      productName, 
      modelName, 
      customerName, 
      customerPhone, 
      address, 
      serviceDate, 
      serviceTime 
    } = req.body;

    const request = await ServiceRequest.create({
      user: req.user._id,
      userType: userType || 'Customer',
      productName,
      modelName,
      customerName: customerName || req.user.name,
      customerPhone: customerPhone || req.user.phone,
      address,
      serviceDate,
      serviceTime
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's service requests
// @route   GET /api/service-requests/my
// @access  Private
const getMyServiceRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ user: req.user._id })
      .populate('assignedEmployee', 'name phone')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all service requests (Admin)
// @route   GET /api/service-requests
// @access  Private/Admin
const getAllServiceRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({})
      .populate('user', 'name phone email address')
      .populate('assignedEmployee', 'name phone')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign employee to service request
// @route   PUT /api/service-requests/:id/assign
// @access  Private/Admin
const assignServiceRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (request) {
      request.assignedEmployee = req.body.employeeId || request.assignedEmployee;
      request.status = req.body.status || 'Approved';
      
      const updatedRequest = await request.save();
      
      // Populate and return
      const populated = await ServiceRequest.findById(updatedRequest._id)
        .populate('assignedEmployee', 'name phone');

      // Send Push Notifications
      try {
        const employee = await User.findById(request.assignedEmployee);
        if (employee && employee.fcmToken) {
           sendPushNotification(employee.fcmToken, 'New Job Assigned', `You have been assigned to service a ${request.productName}.`);
        }
        const customer = await User.findById(request.user);
        if (customer && customer.fcmToken) {
           sendPushNotification(customer.fcmToken, 'Request Updated', `Your request for ${request.productName} is now ${request.status}.`);
        }
      } catch (err) {
        console.error("FCM failed silently", err);
      }
        
      res.json(populated);
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get employee's assigned service requests
// @route   GET /api/service-requests/employee
// @access  Private
const getEmployeeServiceRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ assignedEmployee: req.user._id })
      .populate('user', 'name phone email address')
      .sort({ createdAt: -1 });
    
    // Fallback for customerName/customerPhone if they are not stored directly in ServiceRequest
    const mappedRequests = requests.map(req => {
      const plain = req.toObject();
      if (plain.user) {
        plain.customerName = plain.customerName || plain.user.name;
        plain.customerPhone = plain.customerPhone || plain.user.phone;
        plain.address = plain.address || plain.user.address;
      }
      return plain;
    });
    res.json(mappedRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update service request status (Employee)
// @route   PUT /api/service-requests/:id/status
// @access  Private
const updateServiceRequestStatus = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (request) {
      if (request.assignedEmployee.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      request.status = req.body.status || request.status;
      if (req.body.status === 'Under Review') {
        request.completionDescription = req.body.description;
        request.completedAt = Date.now();
      }

      // Handle image uploads if present
      if (req.files) {
        if (req.files.failureImage && req.files.failureImage[0]) {
          request.failureImage = req.files.failureImage[0].path;
        }
        if (req.files.receiptImage && req.files.receiptImage[0]) {
          request.receiptImage = req.files.receiptImage[0].path;
        }
        if (req.files.productImages && req.files.productImages.length > 0) {
          request.productImages = req.files.productImages.map(file => file.path);
        }
      }

      const updatedRequest = await request.save();
      res.json(updatedRequest);
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify service request (Admin)
// @route   PUT /api/service-requests/:id/verify
// @access  Private/Admin
const verifyServiceRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (request) {
      request.status = req.body.status || 'Completed'; // Can be 'Completed' or 'Failed'
      const updatedRequest = await request.save();

      // Push notification to Customer and Employee
      try {
        const customer = await User.findById(request.user);
        if (customer && customer.fcmToken) {
           sendPushNotification(customer.fcmToken, 'Service Finalized', `Your service request was marked as ${updatedRequest.status}.`);
        }
        if (request.assignedEmployee) {
          const employee = await User.findById(request.assignedEmployee);
          if (employee && employee.fcmToken) {
             sendPushNotification(employee.fcmToken, 'Job Verified', `The admin verified your job as ${updatedRequest.status}.`);
          }
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

module.exports = {
  createServiceRequest,
  getMyServiceRequests,
  getAllServiceRequests,
  assignServiceRequest,
  getEmployeeServiceRequests,
  updateServiceRequestStatus,
  verifyServiceRequest,
};
