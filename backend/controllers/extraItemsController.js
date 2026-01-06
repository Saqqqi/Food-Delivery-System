const ExtraItem = require('../models/extraItems');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all extra items
exports.getAllExtraItems = catchAsync(async (req, res, next) => {
  const extraItems = await ExtraItem.find();
  
  res.status(200).json({
    status: 'success',
    results: extraItems.length,
    data: {
      extraItems
    }
  });
});

// Get extra item by ID
exports.getExtraItem = catchAsync(async (req, res, next) => {
  const extraItem = await ExtraItem.findById(req.params.id);
  
  if (!extraItem) {
    return next(new AppError('No extra item found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      extraItem
    }
  });
});

// Create new extra item
exports.createExtraItem = catchAsync(async (req, res, next) => {
  const newExtraItem = await ExtraItem.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      extraItem: newExtraItem
    }
  });
});

// Update extra item
exports.updateExtraItem = catchAsync(async (req, res, next) => {
  const extraItem = await ExtraItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  if (!extraItem) {
    return next(new AppError('No extra item found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      extraItem
    }
  });
});

// Delete extra item
exports.deleteExtraItem = catchAsync(async (req, res, next) => {
  const extraItem = await ExtraItem.findByIdAndDelete(req.params.id);
  
  if (!extraItem) {
    return next(new AppError('No extra item found with that ID', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get extra items by category
exports.getExtraItemsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  
  const extraItems = await ExtraItem.find({ category });
  
  res.status(200).json({
    status: 'success',
    results: extraItems.length,
    data: {
      extraItems
    }
  });
});