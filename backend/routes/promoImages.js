const express = require('express');
const promoController = require('../controllers/promoImages');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Ensure uploads folder exists, if not, create it
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ storage });

// Route to handle adding images
router.post('/add-images', upload.array('promoImages', 10), promoController.addPromoImages);

// Route to handle updating images (expects an `id` in the request body or params)
router.put('/update-images/:id', upload.array('promoImages', 10), promoController.updatePromoImages);

// Route to get all promo images (no need for multer middleware)
router.get('/get-images', promoController.getPromoImages);

module.exports = router;
