const RestaurantDeliveryAddress = require('../models/RestaurantDeliveryAddress');
const { Client } = require('@googlemaps/google-maps-services-js');

const apiKey = 'AIzaSyAkj8t9JoE8VbDj04tRPNGb7ukKx8uIlRI';
const googleMapsClient = new Client({});

const getAllRestaurantDeliveryAddresses = async (req, res) => {
  try {
    const addresses = await RestaurantDeliveryAddress.find();
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching restaurant addresses', error: error.message });
  }
};

const addRestaurantDeliveryAddress = async (req, res) => {
  const { address, restaurantName } = req.body;

  if (!address || !restaurantName) {
    return res.status(400).json({ message: 'Address and restaurant name are required' });
  }

  try {
    // Geocode the address using the Google Maps Geocoding API
    const geocodeResponse = await googleMapsClient.geocode({
      params: {
        address,
        key: apiKey,
      },
    });

    if (geocodeResponse.data.status !== 'OK' || !geocodeResponse.data.results[0]) {
      throw new Error(`Geocoding failed: ${geocodeResponse.data.status}`);
    }

    const { lat, lng } = geocodeResponse.data.results[0].geometry.location;

    const newAddress = new RestaurantDeliveryAddress({
      address,
      restaurantName,
      latitude: lat,
      longitude: lng,
    });
    const savedAddress = await newAddress.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    console.error('Error in addRestaurantDeliveryAddress:', error);
    res.status(400).json({ message: 'Error adding restaurant address', error: error.message });
  }
};

const editRestaurantDeliveryAddress = async (req, res) => {
  const { id } = req.params;
  const { address, restaurantName } = req.body;

  if (!address || !restaurantName) {
    return res.status(400).json({ message: 'Address and restaurant name are required' });
  }

  try {
    const geocodeResponse = await googleMapsClient.geocode({
      params: {
        address,
        key: apiKey,
      },
    });

    if (geocodeResponse.data.status !== 'OK' || !geocodeResponse.data.results[0]) {
      throw new Error(`Geocoding failed: ${geocodeResponse.data.status}`);
    }

    const { lat, lng } = geocodeResponse.data.results[0].geometry.location;

    const updatedAddress = await RestaurantDeliveryAddress.findByIdAndUpdate(
      id,
      { address, restaurantName, latitude: lat, longitude: lng },
      { new: true, runValidators: true }
    );
    if (!updatedAddress) return res.status(404).json({ message: 'Address not found' });
    res.status(200).json(updatedAddress);
  } catch (error) {
    console.error('Error in editRestaurantDeliveryAddress:', error);
    res.status(400).json({ message: 'Error updating restaurant address', error: error.message });
  }
};

const deleteRestaurantDeliveryAddress = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedAddress = await RestaurantDeliveryAddress.findByIdAndDelete(id);
    if (!deletedAddress) return res.status(404).json({ message: 'Address not found' });
    res.status(200).json({ message: 'Restaurant address deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting restaurant address', error: error.message });
  }
};

module.exports = {
  getAllRestaurantDeliveryAddresses,
  addRestaurantDeliveryAddress,
  editRestaurantDeliveryAddress,
  deleteRestaurantDeliveryAddress,
};