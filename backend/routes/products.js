const express = require('express');
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');

const router = express.Router();

// Multer Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

// Upload Limits (Max size: 50MB)
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|glb|gltf|obj/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'application/octet-stream' || file.mimetype === 'model/gltf-binary';

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Images and specific 3D Models Only!'));
        }
    }
});

// Upload Route with Size Restriction
router.post('/', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'model3d', maxCount: 1 }
]), (req, res, next) => {
    // Check if any file uploaded (optional)
    next();
}, productController.createProduct);
// router.post('/', productController.createProduct);

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'model3d', maxCount: 1 }
]), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
