import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet marker icons
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '12px',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(0, 0, 0, 0.1)'
};

const MAPTILER_API_KEY = 'l2NFru6YzgSuqQyd7OsY'; // Your MapTiler API key

const OrderMap = ({ order }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Validate addresses
    const restaurantAddress = order.restaurantAddress || {};
    const deliveryAddress = order.deliveryAddress || {};

    // Check if we have valid coordinates
    if (
      !restaurantAddress.latitude || 
      !restaurantAddress.longitude || 
      !deliveryAddress.latitude || 
      !deliveryAddress.longitude
    ) {
      setError('Invalid coordinates for restaurant or delivery address.');
      return;
    }

    // Clean up previous map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize the map
    try {
      const newMap = L.map(mapRef.current, {
        center: [
          (restaurantAddress.latitude + deliveryAddress.latitude) / 2,
          (restaurantAddress.longitude + deliveryAddress.longitude) / 2
        ],
        zoom: 12,
        zoomControl: true,
        dragging: true,
        scrollWheelZoom: false
      });

      // Add MapTiler tiles
      const tileLayer = L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`, {
        attribution: '© MapTiler © OpenStreetMap contributors',
        tileSize: 512,
        zoomOffset: -1,
      }).addTo(newMap);

      // Add markers
      const restaurantMarker = L.marker(
        [restaurantAddress.latitude, restaurantAddress.longitude], 
        { icon: DefaultIcon }
      )
        .addTo(newMap)
        .bindPopup(restaurantAddress.restaurantName || 'Restaurant')
        .openPopup();
        
      const deliveryMarker = L.marker(
        [deliveryAddress.latitude, deliveryAddress.longitude], 
        { icon: DefaultIcon }
      )
        .addTo(newMap)
        .bindPopup(deliveryAddress.address || 'Delivery Address');

      // Fit bounds to show both markers
      const bounds = L.latLngBounds([
        [restaurantAddress.latitude, restaurantAddress.longitude],
        [deliveryAddress.latitude, deliveryAddress.longitude]
      ]);
      newMap.fitBounds(bounds, { padding: [50, 50] });

      mapInstanceRef.current = newMap;

      return () => {
        if (newMap) {
          newMap.remove();
        }
      };
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map. Please try again.');
    }
  }, [order]);

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div ref={mapRef} style={containerStyle}></div>
      <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <p className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
          </svg>
          Map showing route from restaurant to delivery address. For turn-by-turn navigation, use the "Open in Google Maps" button.
        </p>
      </div>
    </div>
  );
};

export default OrderMap;