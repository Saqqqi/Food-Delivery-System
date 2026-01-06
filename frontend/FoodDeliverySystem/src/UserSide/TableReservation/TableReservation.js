import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Modal, Badge, Table, Tabs, Tab, ListGroup } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

import './TableReservation.css';



// Helper function to convert Google Drive view link to embeddable URL (fallback)
const getGoogleDriveEmbedUrl = (url) => {
  if (!url.includes('drive.google.com')) return url;
  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
  }
  return url;
};

// Helper function to check if a date is in the past
const isPast = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

const TableReservation = () => {

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('available');
  const [myReservations, setMyReservations] = useState([]);
  const [reservationHistory, setReservationHistory] = useState([]);
  const [userId, setUserId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedVideoLink, setSelectedVideoLink] = useState(null);
  const [restaurantAddresses, setRestaurantAddresses] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');

  const [formData, setFormData] = useState({
    reservationDate: '',
    reservationTime: '',
    guests: 1,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    specialRequests: ''
  });

  const timeSlots = [
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM',
    '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM',
    '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
    '8:00 PM', '8:30 PM', '9:00 PM'
  ];

  // Fetch restaurant addresses
  const fetchRestaurantAddresses = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3005/api/restaurant-delivery-addresses');
      setRestaurantAddresses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch restaurant addresses:', error.message);
    }
  }, []);



  const prevReservationsRef = useRef([]);

  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const params = selectedRestaurant ? { restaurantAddress: selectedRestaurant } : {};
      const response = await axios.get('http://localhost:3005/api/table-reservations', { params });

      // Debug: Log the response to see what data is being returned
      console.log('Tables API response:', response.data);

      setTables(response.data.data.tables || []);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch tables:', error.message);
      setError('Failed to load tables.');
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurant]);

  const fetchMyReservations = useCallback(async (userId) => {
    setLoading(true);
    try {
      const params = selectedRestaurant ? { restaurantAddress: selectedRestaurant } : {};
      const response = await axios.get('http://localhost:3005/api/table-reservations', { params });

      // Debug: Log the response to see what data is being returned
      console.log('My Reservations API response:', response.data);

      const allTables = response.data.data.tables || [];
      const currentReservations = allTables.filter(table =>
        ['booked', 'pending'].includes(table.status) && !isPast(table.reservationDate)
      );
      const pastReservations = allTables.filter(table =>
        table.status === 'cancelled' ||
        (['booked', 'pending'].includes(table.status) && isPast(table.reservationDate))
      );

      // Check for status changes
      currentReservations.forEach(current => {
        const previous = prevReservationsRef.current.find(prev => prev._id === current._id);
        if (previous && previous.status !== current.status) {
          setError(`Your reservation for Table ${current.tableNumber} has been ${current.status === 'booked' ? 'confirmed' : 'cancelled'}.`);
        }
      });

      prevReservationsRef.current = currentReservations;
      setMyReservations(currentReservations);
      setReservationHistory(pastReservations);
    } catch (error) {
      console.error('Failed to fetch reservations:', error.message);
      setError('Failed to load your reservations.');
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurant]);

  // Fetch tables and user data
  useEffect(() => {
    const token = localStorage.getItem('FoodCustomerToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setFormData(prev => ({ ...prev, customerEmail: decoded.email || '', customerName: decoded.name || '' }));
        setUserId(decoded.id);
      } catch (error) {
        console.error('Error decoding token:', error.message);
        setError('Invalid token. Please log in again.');
      }
    }
    fetchRestaurantAddresses();
  }, [fetchRestaurantAddresses]);

  // Refetch tables and reservations when restaurant filter changes
  useEffect(() => {
    fetchTables();
    if (userId) fetchMyReservations(userId);
  }, [selectedRestaurant, userId, fetchTables, fetchMyReservations]);


  // Polling for reservation updates
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => fetchMyReservations(userId), 30000);
    return () => clearInterval(interval);
  }, [userId, fetchMyReservations]);

  // Update active tab based on reservations
  useEffect(() => {
    if (myReservations.length > 0) {
      setActiveTab(myReservations.some(res => res.status === 'pending') ? 'pendingReservations' : 'bookedReservations');
    }
  }, [myReservations]);

  const handleTableSelect = (table) => {
    if (table.status !== 'available') return;
    setSelectedTable(table);
    setFormData(prev => ({ ...prev, guests: table.guests || 1 }));
    setShowReservationModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTable || !formData.reservationDate || !formData.reservationTime ||
      !formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      setError('Please fill in all required fields.');
      return;
    }

    // Check if number of guests exceeds table capacity
    if (formData.guests > selectedTable.guests) {
      setError(`Number of guests cannot exceed table capacity of ${selectedTable.guests} guests.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const restaurantInfo = selectedTable.restaurantAddress ? {
        restaurantAddress: selectedTable.restaurantAddress,
        restaurantAddressDetails: selectedTable.restaurantAddressDetails
      } : {};
      await axios.post('http://localhost:3005/api/table-reservations/reserve', {
        tableId: selectedTable._id,
        userId,
        ...formData,
        ...restaurantInfo,
        status: 'pending'
      });
      setReservationSuccess(true);
      setTimeout(() => {
        setShowReservationModal(false);
        setReservationSuccess(false);
        fetchTables();
        fetchMyReservations(userId);
        setActiveTab('pendingReservations');
      }, 2000);
    } catch (error) {
      // Show more specific error messages
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 400) {
        setError('Invalid reservation data. Please check your input.');
      } else if (error.response?.status === 404) {
        setError('Table not found. Please try another table.');
      } else if (error.response?.status === 409) {
        setError('This table is no longer available. Please select another table.');
      } else {
        setError('Failed to make reservation. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelReservation = (reservation) => {
    setReservationToCancel(reservation);
    setShowCancelModal(true);
  };

  const confirmCancelReservation = async () => {
    if (!reservationToCancel) return;
    try {
      setIsCancelling(true);
      await axios.patch(`http://localhost:3005/api/table-reservations/${reservationToCancel._id}`, { status: 'cancelled' });
      setShowCancelModal(false);
      fetchTables();
      fetchMyReservations(userId);
    } catch (error) {
      setError('Failed to cancel reservation.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleShowVideo = (reservation) => {
    setSelectedReservation(reservation);

    // Debug: Log the reservation data to see what's available
    console.log('Reservation data:', reservation);
    console.log('Video link from reservation:', reservation.videoLink);

    // Check if videoLink exists and is a valid URL
    if (reservation.videoLink && typeof reservation.videoLink === 'string' && reservation.videoLink.trim() !== '') {
      // If it's a Google Drive link, convert it to embeddable format
      if (reservation.videoLink.includes('drive.google.com')) {
        const videoLink = getGoogleDriveEmbedUrl(reservation.videoLink);
        console.log('Using Google Drive embed URL:', videoLink);
        setSelectedVideoLink(videoLink);
      } else {
        // For other URLs, use as is
        console.log('Using direct video URL:', reservation.videoLink);
        setSelectedVideoLink(reservation.videoLink);
      }
    } else {
      // Set to null to indicate no video is available
      console.log('No valid video link found');
      setSelectedVideoLink(null);
    }

    // Show the modal immediately
    setShowVideoModal(true);
  };

  const getStatusBadge = (status) => ({
    available: 'success',
    booked: 'danger',
    pending: 'warning',
    cancelled: 'secondary'
  }[status] || 'info');

  const getStatusText = (status) => ({
    available: 'Available',
    booked: 'Confirmed',
    pending: 'Pending Approval',
    cancelled: 'Cancelled'
  }[status] || status.charAt(0).toUpperCase() + status.slice(1));

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

  if (loading && !tables.length && !myReservations.length) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="warning" />
        <p>Loading...</p>
      </Container>
    );
  }

  return (
    <div className="table-reservation-page min-h-screen bg-black text-white">
      <div className="bg-gradient-to-r from-gray-900 to-black py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Table Reservations</h1>
        <p className="text-lg md:text-xl mb-6 text-gray-400">Reserve your table for a delightful dining experience</p>
        <Form.Group className="mb-3 d-flex justify-content-center align-items-center">
          <Form.Label className="text-white me-3 mb-0">Filter by Restaurant:</Form.Label>
          <Form.Select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            style={{ maxWidth: '300px', background: '#2a2a2a', color: 'white', borderColor: '#FFD700' }}
          >
            <option value="">All Restaurants</option>
            {restaurantAddresses.map(restaurant => (
              <option key={restaurant._id} value={restaurant._id}>
                {restaurant.restaurantName}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>

      <Container className="py-10">
        {error && !showReservationModal && <Alert variant="danger">{error}</Alert>}

        <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4 reservation-tabs">
          <Tab eventKey="available" title="Available Tables">
            <Card className="bg-gray-800 text-white border-0 shadow mb-5">
              <Card.Body>
                <Card.Title className="text-xl font-bold mb-4">Available Tables</Card.Title>
                <Table responsive bordered hover variant="dark">
                  <thead>
                    <tr>
                      <th>Table Number</th>
                      <th>Capacity</th>
                      <th>Restaurant</th>
                      <th>Status</th>
                      <th>3D View</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tables.filter(t => t.status === 'available' && !isPast(t.reservationDate)).length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-4">No tables available</td></tr>
                    ) : (
                      tables.filter(t => t.status === 'available' && !isPast(t.reservationDate)).map(table => (
                        <tr key={table._id}>
                          <td>{table.tableNumber}</td>
                          <td>{table.guests} {table.guests > 1 ? 'guests' : 'guest'}</td>
                          <td>{table.restaurantAddressDetails?.restaurantName || 'Our Restaurant'}</td>
                          <td><Badge bg={getStatusBadge(table.status)}>{getStatusText(table.status)}</Badge></td>
                          <td>
                            {table.videoLink ? (
                              <Button variant="info" size="sm" onClick={() => handleShowVideo(table)}>
                                <i className="bi bi-cube me-1"></i> View 3D
                              </Button>
                            ) : (
                              <span className="text-muted">No 3D view available</span>
                            )}
                          </td>
                          <td><Button variant="success" size="sm" onClick={() => handleTableSelect(table)}>Reserve</Button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
            <Card className="bg-gray-800 text-white border-0 shadow">
              <Card.Body>
                <Card.Title className="text-xl font-bold mb-4">Reservation Information</Card.Title>
                <p className="text-gray-400"><i className="bi bi-info-circle me-2"></i>Select an available table to make a reservation.</p>
                <hr className="border-gray-600 my-4" />
                <h5>Reservation Policy:</h5>
                <ul className="text-gray-400">
                  <li>Reservations up to 30 days in advance</li>
                  <li>Arrive 15 minutes early</li>
                  <li>Reservations held for 15 minutes</li>
                  <li>Parties larger than 8, call directly</li>
                </ul>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="pendingReservations" title={<span>Reservation Requests <Badge bg="warning" pill>{myReservations.filter(res => res.status === 'pending').length}</Badge></span>}>
            <Card className="bg-gray-800 text-white border-0 shadow">
              <Card.Body>
                <Card.Title className="text-xl font-bold mb-4">My Pending Reservation Requests</Card.Title>
                {myReservations.filter(res => res.status === 'pending').length === 0 ? (
                  <Alert variant="info">No pending reservation requests.</Alert>
                ) : (
                  <ListGroup variant="flush">
                    {myReservations.filter(res => res.status === 'pending').map(reservation => (
                      <ListGroup.Item key={reservation._id} className="bg-gray-700 text-white border-gray-600 mb-3 rounded">
                        <div className="d-flex justify-content-between align-items-center flex-wrap">
                          <div>
                            <h5>Table {reservation.tableNumber}</h5>
                            <p><strong>Restaurant:</strong> {reservation.restaurantAddressDetails?.restaurantName || 'Our Restaurant'}</p>
                            <p><strong>Date:</strong> {formatDate(reservation.reservationDate)}</p>
                            <p><strong>Time:</strong> {reservation.reservationTime}</p>
                            <p><strong>Guests:</strong> {reservation.guests}</p>
                            <p><strong>Name:</strong> {reservation.customerName}</p>
                            <p><strong>Email:</strong> {reservation.customerEmail}</p>
                            <p><strong>Phone:</strong> {reservation.customerPhone}</p>
                            {reservation.specialRequests && <p><strong>Special Requests:</strong> {reservation.specialRequests}</p>}
                            <Badge bg={getStatusBadge(reservation.status)}>{getStatusText(reservation.status)}</Badge>
                          </div>
                          <div>
                            <Button variant="outline-info" size="sm" className="me-2" onClick={() => setShowDetailsModal(true) || setSelectedReservation(reservation)}>View Details</Button>
                            {reservation.videoLink && (
                              <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowVideo(reservation)}>View 3D</Button>
                            )}
                            <Button variant="outline-danger" size="sm" onClick={() => handleCancelReservation(reservation)}>Cancel Request</Button>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="bookedReservations" title={<span>Booked Tables <Badge bg="success" pill>{myReservations.filter(res => res.status === 'booked').length}</Badge></span>}>
            <Card className="bg-gray-800 text-white border-0 shadow">
              <Card.Body>
                <Card.Title className="text-xl font-bold mb-4">My Confirmed Reservations</Card.Title>
                {myReservations.filter(res => res.status === 'booked').length === 0 ? (
                  <Alert variant="info">No confirmed reservations.</Alert>
                ) : (
                  <ListGroup variant="flush">
                    {myReservations.filter(res => res.status === 'booked').map(reservation => (
                      <ListGroup.Item key={reservation._id} className="bg-gray-700 text-white border-gray-600 mb-3 rounded">
                        <div className="d-flex justify-content-between align-items-center flex-wrap">
                          <div>
                            <h5>Table {reservation.tableNumber}</h5>
                            <p><strong>Restaurant:</strong> {reservation.restaurantAddressDetails?.restaurantName || 'Our Restaurant'}</p>
                            <p><strong>Date:</strong> {formatDate(reservation.reservationDate)}</p>
                            <p><strong>Time:</strong> {reservation.reservationTime}</p>
                            <p><strong>Guests:</strong> {reservation.guests}</p>
                            <p><strong>Name:</strong> {reservation.customerName}</p>
                            <p><strong>Email:</strong> {reservation.customerEmail}</p>
                            <p><strong>Phone:</strong> {reservation.customerPhone}</p>
                            {reservation.specialRequests && <p><strong>Special Requests:</strong> {reservation.specialRequests}</p>}
                            <Badge bg={getStatusBadge(reservation.status)}>{getStatusText(reservation.status)}</Badge>
                          </div>
                          <div>
                            <Button variant="outline-info" size="sm" className="me-2" onClick={() => setShowDetailsModal(true) || setSelectedReservation(reservation)}>View Details</Button>
                            {reservation.videoLink && (
                              <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowVideo(reservation)}>View 3D</Button>
                            )}
                            <Button variant="outline-danger" size="sm" onClick={() => handleCancelReservation(reservation)}>Cancel Reservation</Button>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="history" title="Reservation History">
            <Card className="bg-gray-800 text-white border-0 shadow">
              <Card.Body>
                <Card.Title className="text-xl font-bold mb-4">Reservation History</Card.Title>
                {reservationHistory.length === 0 ? (
                  <Alert variant="info">No reservation history.</Alert>
                ) : (
                  <ListGroup variant="flush">
                    {reservationHistory.map(reservation => (
                      <ListGroup.Item key={reservation._id} className="bg-gray-700 text-white border-gray-600 mb-3 rounded">
                        <div className="d-flex justify-content-between align-items-center flex-wrap">
                          <div>
                            <h5>Table {reservation.tableNumber}</h5>
                            <p><strong>Restaurant:</strong> {reservation.restaurantAddressDetails?.restaurantName || 'Our Restaurant'}</p>
                            <p><strong>Date:</strong> {formatDate(reservation.reservationDate)}</p>
                            <p><strong>Time:</strong> {reservation.reservationTime || 'N/A'}</p>
                            <p><strong>Guests:</strong> {reservation.guests}</p>
                            <p><strong>Name:</strong> {reservation.customerName}</p>
                            <p><strong>Email:</strong> {reservation.customerEmail}</p>
                            <p><strong>Phone:</strong> {reservation.customerPhone}</p>
                            {reservation.specialRequests && <p><strong>Special Requests:</strong> {reservation.specialRequests}</p>}
                            <Badge bg={getStatusBadge(reservation.status)}>{getStatusText(reservation.status)}</Badge>
                          </div>
                          <div>
                            <Button variant="outline-info" size="sm" className="me-2" onClick={() => setShowDetailsModal(true) || setSelectedReservation(reservation)}>View Details</Button>
                            {reservation.videoLink && (
                              <Button variant="outline-primary" size="sm" onClick={() => handleShowVideo(reservation)}>View 3D</Button>
                            )}
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>

        <Modal show={showReservationModal} onHide={() => setShowReservationModal(false)} centered className="reservation-modal">
          <Modal.Header closeButton className="bg-gray-800 text-white border-gray-700">
            <Modal.Title>Reserve Table {selectedTable?.tableNumber}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-gray-800 text-white">
            {reservationSuccess ? (
              <Alert variant="success">
                <Alert.Heading>Reservation Request Submitted!</Alert.Heading>
                <p>Your reservation request is pending approval. Check the "My Reservations" tab for status.</p>
              </Alert>
            ) : (
              <Form onSubmit={handleSubmit}>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form.Group className="mb-3">
                  <Form.Label>Date*</Form.Label>
                  <Form.Control type="date" name="reservationDate" value={formData.reservationDate} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} required className="bg-gray-700 text-white border-gray-600" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Time*</Form.Label>
                  <Form.Select name="reservationTime" value={formData.reservationTime} onChange={handleInputChange} required className="bg-gray-700 text-white border-gray-600">
                    <option value="">Select a time</option>
                    {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Number of Guests*</Form.Label>
                  <Form.Control type="number" name="guests" value={formData.guests} onChange={handleInputChange} min="1" max={selectedTable?.guests || 12} required className="bg-gray-700 text-white border-gray-600" />
                  <Form.Text>Max capacity: {selectedTable?.guests || 0} guests</Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Your Name*</Form.Label>
                  <Form.Control type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} required className="bg-gray-700 text-white border-gray-600" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email*</Form.Label>
                  <Form.Control type="email" name="customerEmail" value={formData.customerEmail} onChange={handleInputChange} required className="bg-gray-700 text-white border-gray-600" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number*</Form.Label>
                  <Form.Control type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleInputChange} required className="bg-gray-700 text-white border-gray-600" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Special Requests</Form.Label>
                  <Form.Control as="textarea" rows={3} name="specialRequests" value={formData.specialRequests} onChange={handleInputChange} className="bg-gray-700 text-white border-gray-600" placeholder="Any special requests?" />
                </Form.Group>
              </Form>
            )}
          </Modal.Body>
          {!reservationSuccess && (
            <Modal.Footer className="bg-gray-800 text-white border-gray-700">
              <Button variant="secondary" onClick={() => setShowReservationModal(false)}>Cancel</Button>
              <Button variant="success" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Processing...</> : 'Confirm Reservation'}
              </Button>
            </Modal.Footer>
          )}
        </Modal>

        <Modal show={showVideoModal} onHide={() => setShowVideoModal(false)} size="xl" centered className="reservation-modal">
          <Modal.Header closeButton className="bg-gray-800 text-white border-gray-700">
            <Modal.Title>3D Table View</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-gray-800 text-white text-center p-0">
            {selectedVideoLink === null ? (
              <div className="d-flex flex-column align-items-center justify-content-center p-5" style={{ minHeight: '300px' }}>
                <div className="text-warning mb-3">
                  <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '3rem' }}></i>
                </div>
                <h4 className="text-warning">No 3D Video Available</h4>
                <p className="text-light">This table doesn't have a 3D video tour configured yet.</p>
              </div>
            ) : selectedVideoLink ? (
              selectedVideoLink.includes('drive.google.com') ? (
                <iframe
                  src={selectedVideoLink}
                  width="100%"
                  height="550px"
                  frameBorder="0"
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  allowFullScreen
                  title="3D Table View"
                  onLoad={() => console.log('Google Drive video loaded')}
                ></iframe>
              ) : (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="w-100"
                  style={{ maxHeight: '550px', objectFit: 'contain' }}
                  onPlay={() => console.log('Video started playing')}
                  onError={(e) => console.log('Video error:', e)}
                >
                  <source src={selectedVideoLink} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )
            ) : (
              <div className="d-flex justify-content-center align-items-center p-5" style={{ minHeight: '300px' }}>
                <div className="spinner-border text-warning" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-gray-800 text-white border-gray-700">
            <Button variant="secondary" onClick={() => setShowVideoModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered className="reservation-modal">
          <Modal.Header closeButton className="bg-gray-800 text-white border-gray-700">
            <Modal.Title>Cancel Reservation</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-gray-800 text-white">
            <p>Are you sure you want to cancel your reservation for Table {reservationToCancel?.tableNumber}?</p>
            <p><strong>Date:</strong> {formatDate(reservationToCancel?.reservationDate)}</p>
            <p><strong>Time:</strong> {reservationToCancel?.reservationTime}</p>
          </Modal.Body>
          <Modal.Footer className="bg-gray-800 text-white border-gray-700">
            <Button variant="secondary" onClick={() => setShowCancelModal(false)}>Keep Reservation</Button>
            <Button variant="danger" onClick={confirmCancelReservation} disabled={isCancelling}>
              {isCancelling ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Processing...</> : 'Cancel Reservation'}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered className="reservation-modal" size="lg">
          <Modal.Header closeButton className="bg-gray-800 text-white border-gray-700">
            <Modal.Title>Reservation Details</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-gray-800 text-white">
            {selectedReservation && (
              <div>
                <Row>
                  <Col md={6}>
                    <h5>Table Information</h5>
                    <p><strong>Table Number:</strong> {selectedReservation.tableNumber}</p>
                    <p><strong>Capacity:</strong> {selectedReservation.guests} guests</p>
                    <p><strong>Status:</strong> <Badge bg={getStatusBadge(selectedReservation.status)}>{getStatusText(selectedReservation.status)}</Badge></p>
                  </Col>
                  <Col md={6}>
                    <h5>Reservation Time</h5>
                    <p><strong>Date:</strong> {formatDate(selectedReservation.reservationDate)}</p>
                    <p><strong>Time:</strong> {selectedReservation.reservationTime}</p>
                  </Col>
                </Row>
                <hr className="border-gray-600 my-4" />
                <Row>
                  <Col md={6}>
                    <h5>Guest Information</h5>
                    <p><strong>Name:</strong> {selectedReservation.customerName}</p>
                    <p><strong>Email:</strong> {selectedReservation.customerEmail}</p>
                    <p><strong>Phone:</strong> {selectedReservation.customerPhone}</p>
                  </Col>
                  <Col md={6}>
                    <h5>Additional Information</h5>
                    <p><strong>Special Requests:</strong> {selectedReservation.specialRequests || 'None'}</p>
                    <p><strong>Reservation ID:</strong> {selectedReservation._id}</p>
                    {selectedReservation.videoLink && (
                      <Button variant="info" size="sm" className="mt-3" onClick={() => {
                        setShowDetailsModal(false);
                        handleShowVideo(selectedReservation);
                      }}>
                        <i className="bi bi-cube me-1"></i> View 3D
                      </Button>
                    )}
                  </Col>
                </Row>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-gray-800 text-white border-gray-700">
            <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>Close</Button>
            {selectedReservation?.status !== 'cancelled' && (
              <Button variant="danger" onClick={() => { setShowDetailsModal(false); handleCancelReservation(selectedReservation); }}>Cancel Reservation</Button>
            )}
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default TableReservation;