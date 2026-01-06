import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Button, Alert, Spinner } from 'react-bootstrap';
import L from 'leaflet'; // Import Leaflet
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import markerIcon from 'leaflet/dist/images/marker-icon.png'; // Fix for marker icons
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
L.Marker.prototype.options.icon = DefaultIcon;

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '8px',
};

const MAPTILER_API_KEY = 'l2NFru6YzgSuqQyd7OsY'; // Your MapTiler API key

const OrderMap = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate addresses from location.state
  useEffect(() => {
    console.log('[OrderMap] location.state:', state);
    if (!state?.restaurantAddress || !state?.deliveryAddress) {
      console.error('[OrderMap] Missing address in location.state:', {
        restaurantAddress: state?.restaurantAddress,
        deliveryAddress: state?.deliveryAddress,
      });
      setError('Missing address information. Please go back and try again.');
      setLoading(false);
      return;
    }

    const { restaurantAddress, deliveryAddress } = state;

    // Validate coordinates with fallbacks
    const safeRestaurantAddress = {
      address: restaurantAddress.address || "Unknown Restaurant Address",
      latitude: restaurantAddress.latitude || 0,
      longitude: restaurantAddress.longitude || 0,
      restaurantName: restaurantAddress.restaurantName || "Unknown Restaurant"
    };

    const safeDeliveryAddress = {
      address: deliveryAddress.address || "Unknown Delivery Address",
      latitude: deliveryAddress.latitude || 0,
      longitude: deliveryAddress.longitude || 0
    };

    if (
      safeRestaurantAddress.latitude === 0 ||
      safeRestaurantAddress.longitude === 0 ||
      safeDeliveryAddress.latitude === 0 ||
      safeDeliveryAddress.longitude === 0
    ) {
      console.error('[OrderMap] Invalid coordinates:', {
        restaurantAddress: safeRestaurantAddress,
        deliveryAddress: safeDeliveryAddress,
      });
      setError('Invalid coordinates for restaurant or delivery address. Please ensure the addresses are correct.');
      setLoading(false);
      return;
    }

    console.log('[OrderMap] Valid addresses:', {
      restaurantAddress: safeRestaurantAddress,
      deliveryAddress: safeDeliveryAddress,
    });

    setLoading(false);
  }, [state]);

  // Initialize the map after the component mounts and DOM is ready
  useEffect(() => {
    if (loading || error) return; // Skip map initialization if still loading or there's an error

    // Ensure the map container exists
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('[OrderMap] Map container not found in DOM');
      setError('Map container not found. Please try refreshing the page.');
      return;
    }

    console.log('[OrderMap] Map container found, initializing map...');

    try {
      // Initialize the map
      const { restaurantAddress, deliveryAddress } = state;
      const newMap = L.map('map', {
        center: [
          (restaurantAddress.latitude + deliveryAddress.latitude) / 2,
          (restaurantAddress.longitude + deliveryAddress.longitude) / 2
        ],
        zoom: 12,
        zoomControl: false, // Optional: Disable zoom for simplicity
        dragging: true, // Allow dragging
        scrollWheelZoom: false // Disable zoom on scroll
      });

      // Add MapTiler tiles
      const tileLayer = L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`, {
        attribution: '© MapTiler © OpenStreetMap contributors',
        tileSize: 512,
        zoomOffset: -1,
      }).addTo(newMap);

      // Check if tiles are loading
      tileLayer.on('tileerror', (error) => {
        console.error('[OrderMap] Tile loading error:', error);
        setError('Failed to load map tiles. Please check your MapTiler API key or internet connection.');
      });

      tileLayer.on('load', () => {
        console.log('[OrderMap] Map tiles loaded successfully');
      });

      // Add markers
      L.marker([restaurantAddress.latitude, restaurantAddress.longitude], { icon: DefaultIcon })
        .addTo(newMap)
        .bindPopup(restaurantAddress.restaurantName)
        .openPopup();
      L.marker([deliveryAddress.latitude, deliveryAddress.longitude], { icon: DefaultIcon })
        .addTo(newMap)
        .bindPopup(deliveryAddress.address)
        .openPopup();

      // Fit bounds to show both markers
      const bounds = L.latLngBounds([
        [restaurantAddress.latitude, restaurantAddress.longitude],
        [deliveryAddress.latitude, deliveryAddress.longitude]
      ]);
      newMap.fitBounds(bounds, { padding: [50, 50] });

      mapRef.current = newMap;
      console.log('[OrderMap] Map initialized successfully');

      // Cleanup on unmount
      return () => {
        if (mapRef.current) {
          console.log('[OrderMap] Cleaning up map on unmount');
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    } catch (err) {
      console.error('[OrderMap] Error initializing map:', err);
      setError('Failed to initialize map. Please try again.');
    }
  }, [loading, error, state]);

  // Calculate estimated delivery time (rough estimate based on distance)
  const estimatedDeliveryTime = useMemo(() => {
    if (!state?.restaurantAddress || !state?.deliveryAddress) return null;
    const latDiff = Math.abs(state.restaurantAddress.latitude - state.deliveryAddress.latitude);
    const lngDiff = Math.abs(state.restaurantAddress.longitude - state.deliveryAddress.longitude);
    const distanceKm = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Rough km approximation
    const minutes = Math.ceil(distanceKm * 2) + 10; // Approx 2 min/km + 10 min buffer
    return minutes;
  }, [state]);

  if (loading) {
    return (
      <Container className="text-center my-5 text-white bg-black">
        <Spinner animation="border" variant="warning" />
        <p className="mt-3">Loading map...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5 text-center text-white bg-black">
        <Alert variant="danger">{error}</Alert>
        <Button variant="warning" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  const { restaurantAddress, deliveryAddress } = state;

  // Construct Google Maps URL with both coordinates and addresses
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    deliveryAddress.address
  )}+(${deliveryAddress.latitude},${deliveryAddress.longitude})&destination=${encodeURIComponent(
    `${restaurantAddress.restaurantName}, ${restaurantAddress.address}`
  )}+(${restaurantAddress.latitude},${restaurantAddress.longitude})&travelmode=driving`;

  return (
    <div className="min-h-screen bg-black text-white">
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0 text-3xl font-bold">Delivery Directions</h2>
          <Button variant="outline-light" onClick={() => navigate(-1)}>
            Back to Orders
          </Button>
        </div>

        <Alert variant="info" className="text-center">
          Receive Your Order in Just {estimatedDeliveryTime || 'a Few'} Minutes!
        </Alert>

        <div className="bg-gray-900 rounded shadow-sm p-3 mb-4">
          <div className="row">
            <div className="col-md-6">
              <h5 className="text-warning">Your Delivery Address</h5>
              <p className="mb-2">{deliveryAddress.address}</p>
              <p className="mb-0">
                Lat: {(deliveryAddress.latitude || 0).toFixed(6)}, Lng: {(deliveryAddress.longitude || 0).toFixed(6)}
              </p>
            </div>
            <div className="col-md-6">
              <h5 className="text-danger">Restaurant Location</h5>
              <p className="mb-2">
                {restaurantAddress.restaurantName} <br /> {restaurantAddress.address}
              </p>
              <p className="mb-0">
                Lat: {(restaurantAddress.latitude || 0).toFixed(6)}, Lng: {(restaurantAddress.longitude || 0).toFixed(6)}
              </p>
            </div>
          </div>
          {estimatedDeliveryTime && (
            <div className="mt-3 text-center">
              <h5 className="text-success">
                Estimated Delivery Time: {estimatedDeliveryTime} minutes
              </h5>
            </div>
          )}
        </div>

        <div id="map" style={containerStyle}></div>

        <div className="mt-4 text-center">
          <Button variant="warning" className="me-2" onClick={() => window.location.reload()}>
            Refresh Map
          </Button>
          <Button
            variant="success"
            onClick={() => window.open(googleMapsUrl, '_blank', 'noopener,noreferrer')}
          >
            Open in Google Maps
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default OrderMap;