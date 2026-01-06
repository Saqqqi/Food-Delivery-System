const express = require('express');
const router = express.Router();
const {
  getAllRestaurantDeliveryAddresses,
  addRestaurantDeliveryAddress,
  editRestaurantDeliveryAddress,
  deleteRestaurantDeliveryAddress,
} = require('../controllers/restaurantDeliveryAddressController');

router.get('/', getAllRestaurantDeliveryAddresses);
router.post('/', addRestaurantDeliveryAddress);
router.put('/:id', editRestaurantDeliveryAddress);
router.delete('/:id', deleteRestaurantDeliveryAddress);

module.exports = router;