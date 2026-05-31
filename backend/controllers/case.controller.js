const Case = require('../models/Case');
const Transaction = require('../models/Transaction'); // Useful to populate if needed

// Get all cases
exports.getAllCases = async (req, res, next) => {
  try {
    const cases = await Case.find()
      .populate('transactionId')
      .populate('assignedTo', 'name email');
    res.json({ success: true, count: cases.length, data: cases });
  } catch (error) {
    next(error);
  }
};

// Assign case
exports.assignCase = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    
    let fraudCase = await Case.findById(req.params.id);
    if (!fraudCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    fraudCase.assignedTo = assignedTo;
    await fraudCase.save();

    fraudCase = await Case.findById(req.params.id)
      .populate('transactionId')
      .populate('assignedTo', 'name email');

    res.json({ success: true, data: fraudCase });
  } catch (error) {
    next(error);
  }
};

// Update status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    let fraudCase = await Case.findById(req.params.id);
    if (!fraudCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    fraudCase.status = status;
    await fraudCase.save();

    fraudCase = await Case.findById(req.params.id)
      .populate('transactionId')
      .populate('assignedTo', 'name email');

    res.json({ success: true, data: fraudCase });
  } catch (error) {
    next(error);
  }
};

// Add comment
exports.addComment = async (req, res, next) => {
  try {
    const { comment } = req.body;
    
    let fraudCase = await Case.findById(req.params.id);
    if (!fraudCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    fraudCase.comments.push(comment);
    await fraudCase.save();

    fraudCase = await Case.findById(req.params.id)
      .populate('transactionId')
      .populate('assignedTo', 'name email');

    res.json({ success: true, data: fraudCase });
  } catch (error) {
    next(error);
  }
};
