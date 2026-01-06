import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import {
  Container, Row, Col, Card, ListGroup, Badge, Spinner, Button,
  Modal, Form, Alert, Tabs, Tab, Dropdown, Pagination, ProgressBar
} from 'react-bootstrap';
import burgerImage from "../../Assets/cart-1 (2).jpg";

const CompleteOrder = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState({ todays: 1, other: 1, shipped: 1, cancelled: 1, cancellationRequested: 1 });
  const [userLoyaltyPoints, setUserLoyaltyPoints] = useState(0);
  const [loyaltyRules, setLoyaltyRules] = useState(null);
  const ordersPerPage = 6;

  const cancellationReasons = [
    "Changed my mind",
    "Found a better deal",
    "Order placed by mistake",
    "Delivery time too long",
    "Other (please specify)"
  ];

  const fetchOrders = useCallback(async (userId, token) => {
    try {
      const response = await axios.get(`/order/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        baseURL: 'http://localhost:3005'
      });
      // Check if response.data is an object with orders property
      if (response.data && response.data.orders) {
        setOrders(response.data.orders);
        // Set user loyalty points if available
        if (response.data.userLoyaltyPoints !== undefined) {
          setUserLoyaltyPoints(response.data.userLoyaltyPoints);
        }
        // Set loyalty rules if available
        if (response.data.loyaltyRules) {
          setLoyaltyRules(response.data.loyaltyRules);
        }
      } else {
        // If response.data is not in expected format, log error and set empty array
        console.error("Unexpected response format:", response.data);
        setOrders([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.response?.data?.error || "Failed to load orders");
      setIsLoading(false);
      if (error.response?.status === 401) {
        localStorage.removeItem('FoodCustomerToken');
        navigate('/login');
      }
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      try {
        const token = localStorage.getItem("FoodCustomerToken");
        if (!token) {
          navigate('/login');
          return;
        }

        const decoded = jwtDecode(token);
        const userId = decoded._id || decoded.id || decoded.userId;
        if (!userId) throw new Error("Invalid user token");
        setUserId(userId);

        await fetchOrders(userId, token);
      } catch (error) {
        console.error("Error fetching user:", error);
        setError(error.message || "Failed to load user data");
        setIsLoading(false);
      }
    };

    fetchUserAndOrders();
    fetchUserAndOrders();
  }, [navigate, fetchOrders]);

  const handleCancelClick = (orderId) => {
    setSelectedOrderId(orderId);
    setCancelReason("");
    setCustomReason("");
    setShowCancelModal(true);
  };

  const submitCancellationRequest = async () => {
    if (!cancelReason) {
      alert('Please select a cancellation reason');
      return;
    }

    if (cancelReason === "Other (please specify)" && !customReason.trim()) {
      alert('Please specify your reason');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("FoodCustomerToken");
      const reasonText = cancelReason === "Other (please specify)" ? customReason : cancelReason;

      await axios.put(
        `/order/request-cancel/${selectedOrderId}`,
        { reason: reasonText },
        {
          headers: { Authorization: `Bearer ${token}` },
          baseURL: 'http://localhost:3005'
        }
      );

      await fetchOrders(userId, token);
      setShowCancelModal(false);
    } catch (error) {
      console.error('Error submitting cancellation:', error);
      alert('Failed to submit cancellation: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackOrder = (order) => {
    const restaurantAddress = {
      address: order.restaurantAddressId?.address || "Unknown Restaurant Address",
      latitude: order.restaurantAddressId?.latitude || 0,
      longitude: order.restaurantAddressId?.longitude || 0,
      restaurantName: order.restaurantAddressId?.restaurantName || "Unknown Restaurant"
    };

    const deliveryAddress = {
      address: order.deliveryAddress?.address || "Unknown Delivery Address",
      latitude: order.deliveryAddress?.latitude || 0,
      longitude: order.deliveryAddress?.longitude || 0
    };

    navigate('/order-tracking', {
      state: { orderId: order._id, restaurantAddress, deliveryAddress }
    });
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleReorder = (order) => {
    console.log("Reordering order:", order._id);
    navigate('/checkout', { state: { items: order.items, restaurantId: order.restaurantAddressId?._id } });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'shipped': return 'primary';
      case 'delivered': return 'info';
      case 'cancellation_requested': return 'secondary';
      case 'cancelled': return 'danger';
      case 'rejected': return 'dark';
      default: return 'secondary';
    }
  };

  const getStatusProgress = (status) => {
    switch (status) {
      case 'pending': return 25;
      case 'confirmed': return 50;
      case 'shipped': return 75;
      case 'delivered': return 100;
      case 'cancellation_requested': return 50;
      case 'cancelled': return 0;
      case 'rejected': return 0;
      default: return 0;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isToday = (dateString) => {
    const orderDate = new Date(dateString);
    const today = new Date();
    return (
      orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear()
    );
  };

  const filterOrders = (orderList, tab) => {
    let filtered = orderList;

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.restaurantAddressId?.restaurantName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (tab === 'other' && statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    return filtered.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  };

  const paginateOrders = (orderList, tab) => {
    const startIndex = (currentPage[tab] - 1) * ordersPerPage;
    return orderList.slice(startIndex, startIndex + ordersPerPage);
  };

  const todaysOrders = filterOrders(orders.filter((order) => isToday(order.orderDate)), 'todays');
  const otherOrders = filterOrders(orders.filter((order) => ['pending', 'confirmed'].includes(order.status) && !isToday(order.orderDate)), 'other');
  const shippedOrders = filterOrders(orders.filter((order) => order.status === 'shipped'), 'shipped');
  const cancelledOrders = filterOrders(orders.filter((order) => order.status === 'cancelled'), 'cancelled');
  const cancellationRequestedOrders = filterOrders(orders.filter((order) => order.status === 'cancellation_requested'), 'cancellationRequested');

  const paginatedTodaysOrders = paginateOrders(todaysOrders, 'todays');
  const paginatedOtherOrders = paginateOrders(otherOrders, 'other');
  const paginatedShippedOrders = paginateOrders(shippedOrders, 'shipped');
  const paginatedCancelledOrders = paginateOrders(cancelledOrders, 'cancelled');
  const paginatedCancellationRequestedOrders = paginateOrders(cancellationRequestedOrders, 'cancellationRequested');

  const renderPagination = (orderList, tab) => {
    const pageCount = Math.ceil(orderList.length / ordersPerPage);
    if (pageCount <= 1) return null;

    return (
      <Pagination className="justify-content-center mt-4">
        {[...Array(pageCount)].map((_, index) => (
          <Pagination.Item
            key={index + 1}
            active={index + 1 === currentPage[tab]}
            onClick={() => setCurrentPage({ ...currentPage, [tab]: index + 1 })}
            className="bg-yellow-500 text-black active:bg-yellow-700 hover:bg-yellow-600"
          >
            {index + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    );
  };

  if (isLoading) {
    return (
      <Container className="text-center my-5 text-white bg-black">
        <Spinner animation="border" variant="warning" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5 text-white bg-black">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const renderOrderList = (orderList, emptyMessage) => (
    orderList.length === 0 ? (
      <div className="text-center py-6 text-gray-400">
        <p className="mb-4">{emptyMessage}</p>
        <Button
          variant="warning"
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          onClick={() => navigate('/menu')}
        >
          Browse Menu
        </Button>
      </div>
    ) : (
      <>
        <Row>
          {orderList.map((order) => (
            <Col xs={12} md={6} lg={4} key={order._id} className="mb-4">
              <Card className="bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300 border-0 rounded-lg overflow-hidden">
                <Card.Body className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <Card.Title className="text-xl font-semibold text-white">
                      Order #{order._id.slice(-6)}
                    </Card.Title>
                    <Badge bg={getStatusBadge(order.status)} className="px-3 py-1 text-sm">
                      {order.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <Card.Subtitle className="mb-3 text-gray-400">
                    Placed on: {formatDate(order.orderDate)}
                  </Card.Subtitle>

                  <ListGroup variant="flush">
                    {order.items.slice(0, 2).map((item, index) => (
                      <ListGroup.Item
                        key={index}
                        className="flex justify-between items-center border-0 py-2 bg-gray-700 rounded-md mb-2"
                      >
                        <div className="flex items-center">
                          <img
                            className="w-12 h-12 object-cover rounded-md mr-3"
                            src={burgerImage}
                            alt={item.name}
                          />
                          <div>
                            <span className="font-medium text-white">{item.name}</span>
                            <p className="text-sm text-gray-400 mb-0">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-medium text-white">
                          Rs. {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </ListGroup.Item>
                    ))}
                    {order.items.length > 2 && (
                      <ListGroup.Item className="text-center text-gray-400 bg-gray-700 rounded-md">
                        + {order.items.length - 2} more items
                      </ListGroup.Item>
                    )}
                  </ListGroup>

                  <div className="border-t border-gray-600 pt-3 mt-3">
                    <div className="flex justify-between font-bold mb-2 text-white">
                      <span>Total</span>
                      <span>Rs. {order.totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="text-sm mb-3">
                      <strong className="text-white">Delivery Address:</strong>
                      <p className="mb-0 text-gray-400">
                        {order.deliveryAddress?.address || "Unknown"}
                      </p>
                    </div>

                    {order.restaurantAddressId && (
                      <div className="text-sm mb-3">
                        <strong className="text-white">Restaurant:</strong>
                        <p className="mb-0 text-gray-400">
                          {order.restaurantAddressId.restaurantName || "Unknown"}
                        </p>
                      </div>
                    )}

                    <div className="text-sm mb-3">
                      <strong className="text-white">Payment Method:</strong>
                      <span className="text-gray-400"> {order.paymentMethod}</span>
                    </div>

                    {order.loyaltyPoints && (order.loyaltyPoints.pointsEarned > 0 || order.loyaltyPoints.pointsApplied > 0) && (
                      <div className="text-sm mb-3 p-2 bg-gray-700 rounded-lg">
                        <strong className="text-yellow-500">Loyalty Points:</strong>
                        {order.loyaltyPoints.pointsEarned > 0 && (
                          <p className="mb-0 text-gray-400">
                            <span className="text-green-400">+{order.loyaltyPoints.pointsEarned}</span> points earned
                          </p>
                        )}
                        {order.loyaltyPoints.pointsApplied > 0 && (
                          <p className="mb-0 text-gray-400">
                            <span className="text-red-400">-{order.loyaltyPoints.pointsApplied}</span> points used
                            {order.loyaltyPoints.discountAmount > 0 && (
                              <span> (Rs. {order.loyaltyPoints.discountAmount.toFixed(2)} discount)</span>
                            )}
                          </p>
                        )}
                      </div>
                    )}

                    {order.cancellationReason && (
                      <div className="mt-3 p-3 bg-gray-700 rounded-lg">
                        <strong className="text-yellow-500">Cancellation Details:</strong>
                        <p className="mb-1 text-gray-400">
                          <strong>Reason:</strong> {order.cancellationReason.requestedReason}
                        </p>
                        {order.cancellationReason.adminResponse === 'approved' && (
                          <p className="mb-1 text-green-400">
                            <strong>Status:</strong> Approved on {formatDate(order.cancellationReason.processedAt)}
                          </p>
                        )}
                        {order.cancellationReason.adminResponse === 'rejected' && (
                          <p className="mb-1 text-red-400">
                            <strong>Status:</strong> Rejected on {formatDate(order.cancellationReason.processedAt)}
                          </p>
                        )}
                        {order.cancellationReason.adminReason && (
                          <p className="mb-0 text-gray-400">
                            <strong>Admin Note:</strong> {order.cancellationReason.adminReason}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-3 flex gap-2 flex-wrap">
                      <Button
                        variant="outline-warning"
                        size="sm"
                        className="flex-grow-1 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-transform transform hover:scale-105"
                        onClick={() => handleViewDetails(order)}
                      >
                        View Details
                      </Button>
                      {order.status === 'shipped' && (
                        <Button
                          variant="warning"
                          size="sm"
                          className="flex-grow-1 bg-yellow-500 hover:bg-yellow-600 text-black transition-transform transform hover:scale-105"
                          onClick={() => handleTrackOrder(order)}
                        >
                          Track Order
                        </Button>
                      )}
                      {['pending', 'confirmed'].includes(order.status) && (
                        <Button
                          variant="danger"
                          size="sm"
                          className="flex-grow-1 bg-red-600 hover:bg-red-700 transition-transform transform hover:scale-105"
                          onClick={() => handleCancelClick(order._id)}
                        >
                          Request Cancellation
                        </Button>
                      )}
                      {['delivered', 'cancelled'].includes(order.status) && (
                        <Button
                          variant="success"
                          size="sm"
                          className="flex-grow-1 bg-green-600 hover:bg-green-700 transition-transform transform hover:scale-105"
                          onClick={() => handleReorder(order)}
                        >
                          Reorder
                        </Button>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        {renderPagination(orderList, orderList === todaysOrders ? 'todays' : orderList === otherOrders ? 'other' : orderList === shippedOrders ? 'shipped' : orderList === cancelledOrders ? 'cancelled' : 'cancellationRequested')}
      </>
    )
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-gradient-to-r from-gray-900 to-black py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Orders</h1>
        <p className="text-lg md:text-xl mb-6 text-gray-400">Track and manage your food orders with ease</p>
        <Button
          variant="warning"
          size="lg"
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold transition-transform transform hover:scale-105"
          onClick={() => navigate('/menu')}
        >
          Order More Food
        </Button>
      </div>

      <Container className="py-10">
        {userLoyaltyPoints > 0 && (
          <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-yellow-500">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-yellow-500 mb-2">Your Loyalty Points</h3>
                <p className="text-white mb-1">
                  You have <span className="text-yellow-500 font-bold">{userLoyaltyPoints}</span> loyalty points
                </p>
                {loyaltyRules && loyaltyRules.isActive && (
                  <p className="text-gray-400 text-sm">
                    {userLoyaltyPoints >= loyaltyRules.minPointsToRedeem ? (
                      <>You can redeem your points for a discount of Rs. {((userLoyaltyPoints * loyaltyRules.redemptionRate) / 100).toFixed(2)} on your next order.</>
                    ) : (
                      <>You need {loyaltyRules.minPointsToRedeem - userLoyaltyPoints} more points to be eligible for redemption.</>
                    )}
                  </p>
                )}
              </div>
              {loyaltyRules && loyaltyRules.isActive && userLoyaltyPoints >= loyaltyRules.minPointsToRedeem && (
                <Button
                  variant="warning"
                  className="mt-3 md:mt-0 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                  onClick={() => navigate('/checkout')}
                >
                  Use Points Now
                </Button>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-white">Order History</h2>
          <div className="flex gap-4 w-full md:w-auto">
            <Form.Control
              type="text"
              placeholder="Search by order ID or restaurant"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 text-white border-gray-600 focus:border-yellow-500 focus:ring-yellow-500"
            />
            <Dropdown>
              <Dropdown.Toggle
                variant="outline-warning"
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
              >
                {statusFilter === 'all' ? 'All Statuses' : statusFilter.replace('_', ' ').toUpperCase()}
              </Dropdown.Toggle>
              <Dropdown.Menu className="bg-gray-800 text-white border-gray-600">
                <Dropdown.Item onClick={() => setStatusFilter('all')} className="text-white hover:bg-yellow-500 hover:text-black">
                  All Statuses
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setStatusFilter('pending')} className="text-white hover:bg-yellow-500 hover:text-black">
                  Pending
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setStatusFilter('confirmed')} className="text-white hover:bg-yellow-500 hover:text-black">
                  Confirmed
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <Tabs
          defaultActiveKey="todays"
          id="order-tabs"
          className="mb-6"
          variant="pills"
          justify
        >
          <Tab
            eventKey="todays"
            title={`Today's Orders (${todaysOrders.length})`}
            className="py-4"
            tabClassName="bg-gray-800 text-white hover:bg-yellow-500 hover:text-black focus:bg-yellow-500 focus:text-black transition duration-300 rounded-t-lg"
          >
            {renderOrderList(paginatedTodaysOrders, "No orders placed today.")}
          </Tab>
          <Tab
            eventKey="other"
            title={`Pending/Confirmed (${otherOrders.length})`}
            className="py-4"
            tabClassName="bg-gray-800 text-white hover:bg-yellow-500 hover:text-black focus:bg-yellow-500 focus:text-black transition duration-300 rounded-t-lg"
          >
            {renderOrderList(paginatedOtherOrders, "No pending or confirmed orders.")}
          </Tab>
          <Tab
            eventKey="shipped"
            title={`Shipped (${shippedOrders.length})`}
            className="py-4"
            tabClassName="bg-gray-800 text-white hover:bg-yellow-500 hover:text-black focus:bg-yellow-500 focus:text-black transition duration-300 rounded-t-lg"
          >
            {renderOrderList(paginatedShippedOrders, "No shipped orders.")}
          </Tab>
          <Tab
            eventKey="cancelled"
            title={`Cancelled (${cancelledOrders.length})`}
            className="py-4"
            tabClassName="bg-gray-800 text-white hover:bg-yellow-500 hover:text-black focus:bg-yellow-500 focus:text-black transition duration-300 rounded-t-lg"
          >
            {renderOrderList(paginatedCancelledOrders, "No cancelled orders.")}
          </Tab>
          <Tab
            eventKey="cancellation-requested"
            title={`Cancellation Requested (${cancellationRequestedOrders.length})`}
            className="py-4"
            tabClassName="bg-gray-800 text-white hover:bg-yellow-500 hover:text-black focus:bg-yellow-500 focus:text-black transition duration-300 rounded-t-lg"
          >
            {renderOrderList(paginatedCancellationRequestedOrders, "No cancellation requests.")}
          </Tab>
        </Tabs>
      </Container>

      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton className="bg-gray-800 text-white border-b border-gray-600">
          <Modal.Title>Request Order Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-gray-800 text-white">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="mb-3">Please select the reason for cancellation:</Form.Label>
              {cancellationReasons.map((reason) => (
                <Form.Check
                  key={reason}
                  type="radio"
                  id={`reason-${reason}`}
                  label={reason}
                  name="cancelReason"
                  checked={cancelReason === reason}
                  onChange={() => setCancelReason(reason)}
                  className="text-white mb-2"
                />
              ))}
            </Form.Group>

            {cancelReason === "Other (please specify)" && (
              <Form.Group className="mb-3">
                <Form.Label>Please specify your reason:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="bg-gray-700 text-white border-gray-600 focus:border-yellow-500 focus:ring-yellow-500"
                  placeholder="Enter your reason for cancellation..."
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-gray-800 border-t border-gray-600">
          <Button
            variant="secondary"
            onClick={() => setShowCancelModal(false)}
            disabled={isSubmitting}
            className="bg-gray-600 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={submitCancellationRequest}
            disabled={isSubmitting || !cancelReason}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Submitting...</span>
              </>
            ) : 'Submit Request'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered>
        <Modal.Header closeButton className="bg-gray-800 text-white border-b border-gray-600">
          <Modal.Title>Order Details - #{selectedOrder?._id?.slice(-6)}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-gray-800 text-white">
          {selectedOrder && (
            <>
              <div className="mb-4">
                <strong className="text-yellow-500">Order Status:</strong>
                <Badge bg={getStatusBadge(selectedOrder.status)} className="ms-2">
                  {selectedOrder.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="mb-4">
                <strong className="text-yellow-500">Status Progress:</strong>
                <ProgressBar
                  now={getStatusProgress(selectedOrder.status)}
                  label={`${getStatusProgress(selectedOrder.status)}%`}
                  variant="warning"
                  className="mt-2"
                />
              </div>
              <div className="mb-4">
                <strong className="text-yellow-500">Placed On:</strong>
                <span className="ms-2">{formatDate(selectedOrder.orderDate)}</span>
              </div>
              <div className="mb-4">
                <strong className="text-yellow-500">Items:</strong>
                <ListGroup variant="flush" className="mt-2">
                  {selectedOrder.items.map((item, index) => (
                    <ListGroup.Item
                      key={index}
                      className="flex justify-between items-center border-0 py-2 bg-gray-700 rounded-md"
                    >
                      <div className="flex items-center">
                        <img
                          className="w-10 h-10 object-cover rounded-md mr-3"
                          src={burgerImage}
                          alt={item.name}
                        />
                        <div>
                          <span className="font-medium text-white">{item.name}</span>
                          <p className="text-sm text-gray-400 mb-0">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-medium text-white">
                        Rs. {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
              <div className="mb-4">
                <strong className="text-yellow-500">Total Amount:</strong>
                <span className="ms-2">Rs. {selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
              {selectedOrder.loyaltyPoints && (
                <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                  <strong className="text-yellow-500">Loyalty Points:</strong>
                  {selectedOrder.loyaltyPoints.pointsEarned > 0 && (
                    <p className="mb-1 text-gray-400">
                      <strong>Points Earned:</strong> {selectedOrder.loyaltyPoints.pointsEarned}
                    </p>
                  )}
                  {selectedOrder.loyaltyPoints.pointsApplied > 0 && (
                    <p className="mb-1 text-gray-400">
                      <strong>Points Applied:</strong> {selectedOrder.loyaltyPoints.pointsApplied}
                    </p>
                  )}
                  {selectedOrder.loyaltyPoints.discountAmount > 0 && (
                    <p className="mb-1 text-gray-400">
                      <strong>Discount Amount:</strong> Rs. {selectedOrder.loyaltyPoints.discountAmount.toFixed(2)}
                    </p>
                  )}
                  <p className="mb-1 text-gray-400">
                    <strong>Status:</strong> {selectedOrder.loyaltyPoints.status.replace('_', ' ').toUpperCase()}
                  </p>
                  {selectedOrder.loyaltyPoints.details && (
                    <p className="mb-0 text-gray-400">
                      <strong>Details:</strong> {selectedOrder.loyaltyPoints.details}
                    </p>
                  )}
                </div>
              )}
              <div className="mb-4">
                <strong className="text-yellow-500">Delivery Address:</strong>
                <p className="mb-0 text-gray-400 ms-2">
                  {selectedOrder.deliveryAddress?.address || "Unknown"}
                </p>
              </div>
              {selectedOrder.restaurantAddressId && (
                <div className="mb-4">
                  <strong className="text-yellow-500">Restaurant:</strong>
                  <p className="mb-0 text-gray-400 ms-2">
                    {selectedOrder.restaurantAddressId.restaurantName || "Unknown"}
                  </p>
                </div>
              )}
              <div className="mb-4">
                <strong className="text-yellow-500">Payment Method:</strong>
                <span className="ms-2 text-gray-400">{selectedOrder.paymentMethod}</span>
              </div>
              {selectedOrder.cancellationReason && (
                <div className="p-3 bg-gray-700 rounded-lg">
                  <strong className="text-yellow-500">Cancellation Details:</strong>
                  <p className="mb-1 text-gray-400">
                    <strong>Reason:</strong> {selectedOrder.cancellationReason.requestedReason}
                  </p>
                  {selectedOrder.cancellationReason.adminResponse && (
                    <p className="mb-1 text-gray-400">
                      <strong>Status:</strong> {selectedOrder.cancellationReason.adminResponse.toUpperCase()} on {formatDate(selectedOrder.cancellationReason.processedAt)}
                    </p>
                  )}
                  {selectedOrder.cancellationReason.adminReason && (
                    <p className="mb-0 text-gray-400">
                      <strong>Admin Note:</strong> {selectedOrder.cancellationReason.adminReason}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-gray-800 border-t border-gray-600">
          <Button
            variant="secondary"
            onClick={() => setShowDetailsModal(false)}
            className="bg-gray-600 hover:bg-gray-700"
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CompleteOrder;