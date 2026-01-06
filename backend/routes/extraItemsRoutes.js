const express = require('express');
const extraItemsController = require('../controllers/extraItemsController');
const { authenticateAdminOrKey } = require('../middleWares/auth');
const { restrictTo } = require('../controllers/authController');

const router = express.Router();

// Public routes
router.get('/', extraItemsController.getAllExtraItems);
router.get('/:id', extraItemsController.getExtraItem);
router.get('/category/:category', extraItemsController.getExtraItemsByCategory);

// Protected routes (admin only)
router.use(authenticateAdminOrKey);
// No need for restrictTo since authenticateAdminOrKey already sets role to admin

router.post('/', extraItemsController.createExtraItem);
router.patch('/:id', extraItemsController.updateExtraItem);
router.delete('/:id', extraItemsController.deleteExtraItem);

module.exports = router;