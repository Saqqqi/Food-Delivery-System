import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Form, Table, Modal } from 'react-bootstrap';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Add custom CSS to fix the dropdown z-index, positioning, and remove white backgrounds
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

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px',
  marginBottom: '15px'
};

const styles = `
  /* Admin Dashboard Gradient Theme with Yellow Accents */
  .admin-container {
    background: linear-gradient(to bottom, #000000, #0f0c29);
    color: #ffffff;
    min-height: 100vh;
    padding: 20px;
  }
  
  .admin-card {
    background: linear-gradient(to bottom, #000000, #0a0a1a);
    border: 1px solid rgba(255, 193, 7, 0.3);
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    margin-bottom: 20px;
    padding: 20px;
  }
  
  .admin-header {
    color: #ffc107;
    border-bottom: 2px solid rgba(255, 193, 7, 0.3);
    padding-bottom: 15px;
    margin-bottom: 25px;
    text-shadow: 0 0 10px rgba(255, 193, 7, 0.3);
    font-weight: bold;
    font-size: 1.8rem;
  }
  
  .admin-button {
    background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
    color: #000000;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-weight: 700;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
    display: flex;
    align-items: center;
  }
  
  .admin-button:hover {
    background: linear-gradient(135deg, #e0a800 0%, #e68a00 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 193, 7, 0.4);
  }
  
  .admin-button-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    border: 1px solid rgba(255, 193, 7, 0.3);
    border-radius: 8px;
    padding: 10px 20px;
    transition: all 0.3s ease;
  }
  
  .admin-button-secondary:hover {
    background: rgba(255, 193, 7, 0.1);
  }
  
  .admin-form-control {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    border: 1px solid rgba(255, 193, 7, 0.3);
    border-radius: 8px;
    padding: 12px 15px;
    transition: all 0.3s ease;
    backdrop-filter: blur(5px);
  }
  
  .admin-form-control:focus {
    border-color: #ffc107;
    box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.25);
    background: rgba(255, 255, 255, 0.12);
    outline: none;
  }
  
  .admin-form-control::placeholder {
    color: #718096;
  }
  
  .admin-form-label {
    color: #ffc107;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  .admin-table-container {
    background: linear-gradient(to bottom, #000000, #0a0a1a);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255, 193, 7, 0.3);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }
  
  .admin-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background: transparent;
  }
  
  .admin-table thead {
    background: rgba(255, 193, 7, 0.15);
  }
  
  .admin-table th {
    color: #ffc107;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
    border: none;
    padding: 15px;
    text-align: left;
  }
  
  .admin-table td {
    color: #ffffff;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding: 15px;
  }
  
  .admin-table tbody tr {
    background: rgba(10, 10, 26, 0.7);
  }
  
  .admin-table tbody tr:hover {
    background: rgba(255, 193, 7, 0.05);
  }
  
  .admin-modal-content {
    background: linear-gradient(to bottom, #000000, #0a0a1a);
    border: 1px solid rgba(255, 193, 7, 0.3);
    border-radius: 12px;
    color: #ffffff;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }
  
  .admin-modal-header {
    background: rgba(255, 193, 7, 0.1);
    border-bottom: 1px solid rgba(255, 193, 7, 0.2);
    padding: 20px;
    border-radius: 12px 12px 0 0;
  }
  
  .admin-modal-title {
    color: #ffc107;
    font-weight: 700;
  }
  
  .admin-modal-body {
    padding: 20px;
  }
  
  .admin-modal-footer {
    background: rgba(255, 255, 255, 0.05);
    border-top: 1px solid rgba(255, 193, 7, 0.2);
    padding: 20px;
    border-radius: 0 0 12px 12px;
  }
  
  .admin-close-button {
    color: #ffffff;
    opacity: 0.7;
    transition: opacity 0.2s ease;
    background: none;
    border: none;
    font-size: 1.5rem;
  }
  
  .admin-close-button:hover {
    color: #ffc107;
    opacity: 1;
  }
  
  .leaflet-container {
    background-color: #4A2C2A !important;
    border-radius: 8px;
    margin-bottom: 15px;
  }
  
  .leaflet-popup-content-wrapper {
    background-color: #212529 !important;
    color: #FFF !important;
    border: 1px solid #FFC107 !important;
  }
  
  .leaflet-popup-tip {
    background-color: #FFC107 !important;
  }
  
  .pac-container {
    z-index: 1060 !important;
    position: absolute !important;
    background-color: #0a0a1a !important;
    color: #FFF !important;
    border: 1px solid #FFC107 !important;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
  
  .pac-item {
    background-color: #0a0a1a !important;
    color: #FFF !important;
    padding: 10px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .pac-item:hover {
    background-color: rgba(255, 193, 7, 0.1) !important;
  }
  
  .text-light {
    color: #a0aec0 !important;
  }
  
  .text-danger {
    color: #fc8181 !important;
  }
  
  .me-2 {
    margin-right: 0.5rem !important;
  }
  
  .mb-3 {
    margin-bottom: 1rem !important;
  }
  
  .mb-4 {
    margin-bottom: 1.5rem !important;
  }
  
  .position-relative {
    position: relative !important;
  }
  
  .fixed {
    position: fixed !important;
  }
  
  .inset-0 {
    top: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    left: 0 !important;
  }
  
  .flex {
    display: flex !important;
  }
  
  .items-center {
    align-items: center !important;
  }
  
  .justify-center {
    justify-content: center !important;
  }
  
  .bg-black {
    background-color: #000000 !important;
  }
  
  .bg-opacity-60 {
    background-color: rgba(0, 0, 0, 0.6) !important;
  }
  
  .z-50 {
    z-index: 50 !important;
  }
  
  /* Override Bootstrap default styles */
  .table {
    --bs-table-bg: transparent;
    --bs-table-striped-bg: transparent;
    --bs-table-striped-color: #fff;
    --bs-table-active-bg: transparent;
    --bs-table-active-color: #fff;
    --bs-table-hover-bg: rgba(255, 193, 7, 0.05);
    --bs-table-hover-color: #fff;
    color: #fff;
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .table > :not(caption) > * > * {
    background-color: transparent;
    border-bottom-width: 1px;
    box-shadow: inset 0 0 0 9999px transparent;
  }
  
  .table-primary {
    --bs-table-bg: rgba(255, 193, 7, 0.15);
    --bs-table-striped-bg: rgba(255, 193, 7, 0.2);
    --bs-table-striped-color: #000;
    --bs-table-active-bg: rgba(255, 193, 7, 0.25);
    --bs-table-active-color: #000;
    --bs-table-hover-bg: rgba(255, 193, 7, 0.2);
    --bs-table-hover-color: #000;
    color: #ffc107;
    border-color: rgba(255, 193, 7, 0.3);
  }
`;

const FoodDeliveryAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [formData, setFormData] = useState({
    address: '',
    restaurantName: '',
    latitude: null,
    longitude: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const addInputRef = useRef(null);
  const editInputRef = useRef(null);
  const addMapRef = useRef(null);
  const editMapRef = useRef(null);

  const MAPTILER_API_KEY = 'l2NFru6YzgSuqQyd7OsY'; // Your MapTiler API key

  // Fetch address suggestions from MapTiler Geocoding API
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_API_KEY}`
      );
      const results = response.data.features.map((feature) => ({
        address: feature.place_name,
        latitude: feature.center[1],
        longitude: feature.center[0],
      }));
      setSuggestions(results);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setSuggestions([]);
    }
  };

  // Handle address selection from suggestions
  const handleSelectAddress = (suggestion) => {
    setFormData({
      ...formData,
      address: suggestion.address,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    });
    setSuggestions([]);
    
    // Update map marker if map exists
    if (map) {
      updateMapMarker(suggestion.latitude, suggestion.longitude, suggestion.address);
    }
  };
  
  // Initialize map in modal
  const initializeMap = (mapContainer, lat, lng, address) => {
    if (!mapContainer) return null;
    
    // Clear previous map instance if it exists
    if (mapContainer._leaflet_id) {
      mapContainer._leaflet_id = null;
    }
    
    const initialLat = lat || 31.5204; // Default to Pakistan if no coordinates
    const initialLng = lng || 74.3587;
    
    const newMap = L.map(mapContainer, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true
    });
    
    // Add MapTiler tiles
    L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`, {
      attribution: '© MapTiler © OpenStreetMap contributors',
      tileSize: 512,
      zoomOffset: -1,
    }).addTo(newMap);
    
    // Add marker if coordinates exist
    let newMarker = null;
    if (lat && lng) {
      newMarker = L.marker([lat, lng], { icon: DefaultIcon })
        .addTo(newMap)
        .bindPopup(address || 'Selected location')
        .openPopup();
    }
    
    // Add click event to map for selecting location
    newMap.on('click', (e) => {
      const { lat, lng } = e.latlng;
      updateMapMarker(lat, lng, 'Selected location', newMap, newMarker);
      
      // Update form data with selected coordinates
      setFormData({
        ...formData,
        latitude: lat,
        longitude: lng,
      });
      
      // Reverse geocode to get address
      reverseGeocode(lat, lng);
    });
    
    setMap(newMap);
    setMarker(newMarker);
    
    return { map: newMap, marker: newMarker };
  };
  
  // Update marker on map
  const updateMapMarker = (lat, lng, popupText, currentMap = map, currentMarker = marker) => {
    if (!currentMap) return;
    
    // Remove existing marker if it exists
    if (currentMarker) {
      currentMap.removeLayer(currentMarker);
    }
    
    // Add new marker
    const newMarker = L.marker([lat, lng], { icon: DefaultIcon })
      .addTo(currentMap)
      .bindPopup(popupText || 'Selected location')
      .openPopup();
    
    // Center map on marker
    currentMap.setView([lat, lng], 13);
    
    setMarker(newMarker);
  };
  
  // Reverse geocode coordinates to get address
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_API_KEY}`
      );
      
      if (response.data.features && response.data.features.length > 0) {
        const address = response.data.features[0].place_name;
        setFormData({
          ...formData,
          address: address,
          latitude: lat,
          longitude: lng,
        });
      }
    } catch (err) {
      console.error('Error reverse geocoding:', err);
    }
  };

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses();
    
    // Cleanup function to destroy maps when component unmounts
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await axios.get('http://localhost:3005/api/restaurant-delivery-addresses');
      setAddresses(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch addresses: ' + error.message);
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.address || !formData.restaurantName || !formData.latitude || !formData.longitude) {
      setError('Please fill in all fields and select a valid address by searching or clicking on the map');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3005/api/restaurant-delivery-addresses', {
        address: formData.address,
        restaurantName: formData.restaurantName,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });
      setAddresses([...addresses, response.data]);
      setShowAddModal(false);
      setFormData({ address: '', restaurantName: '', latitude: null, longitude: null });
      setError(null);
    } catch (error) {
      setError('Failed to add address: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (address) => {
    setSelectedAddress(address);
    setFormData({
      address: address.address,
      restaurantName: address.restaurantName,
      latitude: address.latitude,
      longitude: address.longitude,
    });
    setShowEditModal(true);
    
    // Initialize map after modal is shown
    setTimeout(() => {
      if (editMapRef.current) {
        initializeMap(editMapRef.current, address.latitude, address.longitude, address.address);
      }
    }, 500);
  };

  const handleUpdate = async () => {
    if (!formData.address || !formData.restaurantName || !formData.latitude || !formData.longitude) {
      setError('Please fill in all fields and select a valid address');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:3005/api/restaurant-delivery-addresses/${selectedAddress._id}`, {
        address: formData.address,
        restaurantName: formData.restaurantName,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });
      setAddresses(addresses.map((addr) => (addr._id === selectedAddress._id ? response.data : addr)));
      setShowEditModal(false);
      setSelectedAddress(null);
      setFormData({ address: '', restaurantName: '', latitude: null, longitude: null });
      setError(null);
    } catch (error) {
      setError('Failed to update address: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await axios.delete(`http://localhost:3005/api/restaurant-delivery-addresses/${id}`);
        setAddresses(addresses.filter((addr) => addr._id !== id));
        setError(null);
      } catch (error) {
        setError('Failed to delete address: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  if (loading) {
    return <div className="text-light">Loading...</div>;
  }

  if (error) {
    return <div className="text-danger">Error: {error}</div>;
  }

  return (
    <Container className="admin-container">
      {/* Inject custom CSS for admin dashboard theme */}
      <style>{styles}</style>

      <h2 className="admin-header">Restaurant Delivery Addresses</h2>
      <Button className="admin-button mb-3" onClick={() => setShowAddModal(true)}>
        Add New Address
      </Button>

      <div className="admin-table-container">
        <Table className="admin-table table">
          <thead className="table-primary">
            <tr>
              <th>Restaurant Name</th>
              <th>Address</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {addresses.map((address) => (
              <tr key={address._id}>
                <td>{address.restaurantName}</td>
                <td>{address.address}</td>
                <td>{address.latitude.toFixed(6)}</td>
                <td>{address.longitude.toFixed(6)}</td>
                <td>
                  <Button className="admin-button me-2" onClick={() => handleEdit(address)}>
                    Edit
                  </Button>
                  <Button className="admin-button-secondary" onClick={() => handleDelete(address._id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} id="addModal">
        <div className="admin-modal-content">
          <Modal.Header closeButton className="admin-modal-header">
            <Modal.Title className="admin-modal-title">Add Restaurant Address</Modal.Title>
          </Modal.Header>
          <Modal.Body className="admin-modal-body">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="admin-form-label">Restaurant Name</Form.Label>
                <Form.Control
                  type="text"
                  className="admin-form-control"
                  value={formData.restaurantName}
                  onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3 position-relative">
                <Form.Label className="admin-form-label">Address</Form.Label>
                <Form.Control
                  type="text"
                  className="admin-form-control"
                  ref={addInputRef}
                  placeholder="Enter address (e.g., Lahore, Punjab, Pakistan)"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    fetchSuggestions(e.target.value);
                  }}
                />
                {suggestions.length > 0 && (
                  <ul className="pac-container" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="pac-item"
                        onClick={() => handleSelectAddress(suggestion)}
                        style={{ padding: '8px', cursor: 'pointer' }}
                      >
                        {suggestion.address}
                      </li>
                    ))}
                  </ul>
                )}
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label className="admin-form-label">Select Location on Map</Form.Label>
                <div 
                  id="add-map" 
                  ref={(el) => {
                    addMapRef.current = el;
                    if (el && !el._leaflet_id) {
                      setTimeout(() => {
                        initializeMap(el, formData.latitude, formData.longitude, formData.address);
                      }, 300);
                    }
                  }} 
                  style={mapContainerStyle}
                ></div>
                <small className="text-light">Click on the map to select a location or search for an address above</small>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="admin-modal-footer">
            <Button variant="secondary" className="admin-button-secondary" onClick={() => setShowAddModal(false)}>
              Close
            </Button>
            <Button className="admin-button" onClick={handleAdd}>
              Save
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} id="editModal">
        <div className="admin-modal-content">
          <Modal.Header closeButton className="admin-modal-header">
            <Modal.Title className="admin-modal-title">Edit Restaurant Address</Modal.Title>
          </Modal.Header>
          <Modal.Body className="admin-modal-body">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="admin-form-label">Restaurant Name</Form.Label>
                <Form.Control
                  type="text"
                  className="admin-form-control"
                  value={formData.restaurantName}
                  onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3 position-relative">
                <Form.Label className="admin-form-label">Address</Form.Label>
                <Form.Control
                  type="text"
                  className="admin-form-control"
                  ref={editInputRef}
                  placeholder="Enter address (e.g., Lahore, Punjab, Pakistan)"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    fetchSuggestions(e.target.value);
                  }}
                />
                {suggestions.length > 0 && (
                  <ul className="pac-container" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="pac-item"
                        onClick={() => handleSelectAddress(suggestion)}
                        style={{ padding: '8px', cursor: 'pointer' }}
                      >
                        {suggestion.address}
                      </li>
                    ))}
                  </ul>
                )}
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label className="admin-form-label">Select Location on Map</Form.Label>
                <div 
                  id="edit-map" 
                  ref={(el) => {
                    editMapRef.current = el;
                    if (el && !el._leaflet_id) {
                      setTimeout(() => {
                        initializeMap(el, formData.latitude, formData.longitude, formData.address);
                      }, 300);
                    }
                  }} 
                  style={mapContainerStyle}
                ></div>
                <small className="text-light">Click on the map to select a location or search for an address above</small>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="admin-modal-footer">
            <Button variant="secondary" className="admin-button-secondary" onClick={() => setShowEditModal(false)}>
              Close
            </Button>
            <Button className="admin-button" onClick={handleUpdate}>
              Save Changes
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </Container>
  );
};

export default FoodDeliveryAddress;