const express = require('express');
const tableReservationController = require('../controllers/tableReservationController');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Ensure uploads folder exists, if not, create it
const uploadDir = './uploads/tableReservations';
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

const fileFilter = function (req, file, cb) {
    // Allow images and .dae model files
    if (file.mimetype.startsWith('image/') || path.extname(file.originalname).toLowerCase() === '.dae') {
        cb(null, true);
    } else {
        cb(new Error('Only image files and .dae model files are allowed!'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter
})

router
  .route('/')
  .get(tableReservationController.getAllTables)
  .post(upload.array('files', 10), tableReservationController.createTable);

router
  .route('/reserve')
  .post(upload.array('files', 10), tableReservationController.makeReservation);

router
  .route('/:id')
  .patch(tableReservationController.updateTableStatus)
  .delete(tableReservationController.deleteTable);

module.exports = router;
