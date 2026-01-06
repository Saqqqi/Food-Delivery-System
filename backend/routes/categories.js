const express = require('express');
const categoriesController = require('../controllers/categoriesController');
const authMiddleware = require('../middleWares/auth');
const UserModel = require('../models/user');

const router = express.Router();

router.post('/', categoriesController.addCategory);
router.get('/', categoriesController.getCategory);
router.delete('/:id', categoriesController.deleteCategory);
router.put('/:id', categoriesController.updateCategory);


module.exports = router;