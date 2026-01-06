const express = require('express');
const addressController = require('../controllers/addressController');
const router = express.Router();

router.post('/add-address',  addressController.addAddress);
// router.get('/get-address', addressController.getAddress);
router.get('/get-address/:user_id', addressController.getAddress);
// router.get('/get-address/guest/:guest_id', addressController.getAddressByGuestId);

module.exports = router;