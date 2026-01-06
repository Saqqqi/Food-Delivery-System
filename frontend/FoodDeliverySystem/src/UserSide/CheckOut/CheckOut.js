import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import L from 'leaflet'; // Import Leaflet
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

// Initialize Stripe
let stripePromise;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_51QxD1yKceDVMdbbbXio8eCtlyRncg6HQqbPLQ8iyrJXKotyyy8WMPLM60ienb0OZQYQm4nfnVhju5e6BwLNHkqmn00rB3MPY1Z');
  }
  return stripePromise;
};

const CheckoutForm = ({ totalAmount, handlePaymentSuccess, handlePaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Format the total amount for display
  // Format the total amount for display


  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3005/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount * 100, currency: 'inr' }),
      });

      if (!response.ok) throw new Error('Failed to create payment intent');

      const { clientSecret } = await response.json();
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      });

      if (stripeError) throw stripeError;
      if (paymentIntent.status === 'succeeded') handlePaymentSuccess();
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      handlePaymentError(err);
      setProcessing(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="mb-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#FFFFFF',
                '::placeholder': { color: '#D1D1D1' },
                backgroundColor: '#2D2D2D',
              },
              invalid: { color: '#FF4444' },
            },
            hidePostalCode: true
          }}
          className="p-3 border rounded"
        />
      </div>
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      <Button
        type="submit"
        className="w-100 mt-3 py-2"
        style={{
          backgroundColor: '#FFC107',
          borderColor: '#FFC107',
          color: '#1A1A1A',
          fontWeight: '600'
        }}
        disabled={!stripe || processing}
      >
        {processing ? 'Processing...' : `Pay Rs. ${totalAmount.toFixed(2)}`}
      </Button>
    </Form>
  );
};

const CheckoutPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    address: '',
    instructions: '',
    latitude: null,
    longitude: null
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [mobileNumber, setMobileNumber] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [stripeReady, setStripeReady] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [originalSubtotal, setOriginalSubtotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountType, setDiscountType] = useState('none');
  const [discountInfo, setDiscountInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [map, setMap] = useState(null); // State for Leaflet map
  const navigate = useNavigate();

  const handlePaymentError = (error) => {
    console.error("Payment error:", error);
    setError(error.message || "Payment failed. Please try again.");
  };



  const fetchCartItems = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("FoodCustomerToken");
      if (!token) {
        navigate('/login');
        return;
      }

      const decoded = jwtDecode(token);
      const userId = decoded.id || decoded.userId || decoded._id;
      if (!userId) throw new Error("Invalid user token");

      const response = await axios.get(`http://localhost:3005/cart/get-cart/${userId}`);
      const cartData = response.data;

      const productsWithIds = cartData.products
        .filter(item => item.product_ID && item.product_ID._id)
        .map(item => ({
          ...item,
          productId: typeof item.product_ID === 'object' ? item.product_ID._id : item.product_ID
        }));

      setCartItems(productsWithIds);

      // Store original subtotal
      const originalSubtotal = cartData.sub_total || 0;
      setOriginalSubtotal(originalSubtotal);

      // Check if there's a discount applied and use final_total if available
      if (cartData.discountType && (cartData.discountType === 'coupon' || cartData.discountType === 'loyalty') && cartData.final_total) {
        setTotalAmount(cartData.final_total || 0);
        setDiscountAmount(originalSubtotal - cartData.final_total);
        setDiscountType(cartData.discountType);
        setDiscountInfo(cartData.discountType === 'coupon' ? cartData.coupon : cartData.loyaltyDiscount);
      } else {
        setTotalAmount(originalSubtotal);
        setDiscountAmount(0);
        setDiscountType('none');
        setDiscountInfo(null);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Failed to load cart items. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    getStripe().then(() => setStripeReady(true));
    fetchCartItems();
  }, [fetchCartItems]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'address' && value) {
      try {
        setLoading(true);
        const encodedAddress = encodeURIComponent(value);
        const response = await axios.get(
          `https://api.maptiler.com/geocoding/${encodedAddress}.json?key=l2NFru6YzgSuqQyd7OsY`, // Use your MapTiler API key
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const data = response.data;
        console.log('MapTiler Response:', data); // Debug the response

        if (data.features && data.features.length > 0) {
          const [lon, lat] = data.features[0].geometry.coordinates;
          setFormData(prev => ({
            ...prev,
            latitude: lat || null,
            longitude: lon || null
          }));

          // Update map if it exists
          if (map) {
            map.setView([lat, lon], 13);
            L.marker([lat, lon]).addTo(map).bindPopup(value).openPopup();
          }
        } else {
          setError("No geocoding results found. Please enter a valid address (e.g., 'Lahore, Punjab, Pakistan').");
          setFormData(prev => ({ ...prev, latitude: null, longitude: null }));
          if (map) map.setView([31.5497, 74.3436], 10); // Reset to Lahore
        }
      } catch (err) {
        console.error("Geocoding error:", err.response ? err.response.data : err.message);
        setError("Failed to geocode address. Please try again or check your internet connection.");
        setFormData(prev => ({ ...prev, latitude: null, longitude: null }));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmitOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("FoodCustomerToken");
      if (!token) {
        navigate('/login');
        return;
      }

      const decoded = jwtDecode(token);
      const userId = decoded.id || decoded.userId || decoded._id;
      if (!userId) throw new Error("Invalid user token");

      if (!formData.email || !formData.address || !formData.latitude || !formData.longitude) {
        throw new Error("Please fill in all required delivery information.");
      }

      const validItems = cartItems.filter(item => item.productId && item.product_ID?.name && item.product_ID?.price);
      if (!validItems.length) {
        throw new Error("No valid items in cart. Please add items and try again.");
      }

      const orderData = {
        userId,
        email: formData.email,
        items: validItems.map(item => ({
          productId: item.productId,
          name: item.product_ID.name,
          quantity: item.quantity,
          price: item.product_ID.price
        })),
        deliveryAddress: {
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude
        },
        instructions: formData.instructions,
        paymentMethod,
        totalAmount,
        status: 'pending'
      };

      const response = await axios.post('http://localhost:3005/order/create-order', orderData);
      await axios.delete(`http://localhost:3005/cart/clear-cart/${userId}`);
      await axios.post('http://localhost:3005/order/send-email', {
        email: formData.email,
        orderId: response.data._id,
        items: orderData.items,
        totalAmount: orderData.totalAmount
      });

      setPaymentSuccess(true);
    } catch (error) {
      setError(error.response?.data?.error || error.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize map when component mounts
    if (!map) {
      const newMap = L.map('map').setView([31.5497, 74.3436], 10); // Default to Lahore, Pakistan
      L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=l2NFru6YzgSuqQyd7OsY', {
        attribution: '© MapTiler © OpenStreetMap contributors',
      }).addTo(newMap);
      setMap(newMap);
    }

    // Cleanup map on unmount
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [map]);

  return (
    <div className="bg-dark" style={{ minHeight: '100vh', padding: '20px 0', color: '#FFFFFF' }}>
      <Container>
        {paymentSuccess ? (
          <Row className="justify-content-center">
            <Col md={8} className="text-center py-5">
              <div className="bg-dark p-5 rounded shadow" style={{ borderTop: '4px solid #FFC107' }}>
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mb-4"
                  style={{ color: '#FFC107' }}
                >
                  <path
                    d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 4L12 14.01L9 11.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h2 className="mb-3">Order Placed Successfully!</h2>
                <p className="lead mb-4">
                  Thank you for your order. We've sent a confirmation to {formData.email}.
                </p>
                <Button
                  style={{
                    backgroundColor: '#FFC107',
                    borderColor: '#FFC107',
                    color: '#1A1A1A',
                    fontWeight: '600',
                  }}
                  size="lg"
                  onClick={() => navigate('/home')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </Col>
          </Row>
        ) : (
          <>
            <Row className="justify-content-center mb-4">
              <Col md={8}>
                <h2 className="mb-4">Checkout</h2>
                <div className="d-flex align-items-center mb-4">
                  <div
                    className="flex-grow-1 border-top"
                    style={{ height: '1px', borderColor: '#FFC107' }}
                  ></div>
                  <span className="px-3" style={{ color: '#FFC107', fontWeight: '600' }}>
                    1. Delivery Information
                  </span>
                  <div
                    className="flex-grow-1 border-top"
                    style={{ height: '1px', borderColor: '#FFC107' }}
                  ></div>
                </div>
              </Col>
            </Row>

            <Row className="justify-content-center">
              <Col md={8} lg={6} className="mb-4">
                <Card className="shadow-sm bg-dark" style={{ borderTop: '4px solid #FFC107', color: '#FFFFFF' }}>
                  <Card.Body>
                    <h5 className="mb-4">Delivery Information</h5>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          style={{ backgroundColor: '#2D2D2D', color: '#FFFFFF', borderColor: '#444444' }}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Delivery Address</Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          placeholder="Enter delivery address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          style={{ backgroundColor: '#2D2D2D', color: '#FFFFFF', borderColor: '#444444' }}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Map Preview</Form.Label>
                        <div id="map" style={{ height: '300px', border: '1px solid #444444', borderRadius: '4px' }}></div>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Delivery Instructions</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="instructions"
                          placeholder="Any special instructions?"
                          value={formData.instructions}
                          onChange={handleInputChange}
                          style={{ backgroundColor: '#2D2D2D', color: '#FFFFFF', borderColor: '#444444' }}
                        />
                      </Form.Group>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={8} lg={6}>
                <Card className="shadow-sm bg-dark mb-4" style={{ borderTop: '4px solid #FFC107', color: '#FFFFFF' }}>
                  <Card.Body>
                    <h5 className="mb-4">Order Summary</h5>
                    {loading ? (
                      <div className="text-center py-3">
                        <div className="spinner-border" style={{ color: '#FFC107' }} role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : cartItems.length > 0 ? (
                      <>
                        <ListGroup variant="flush">
                          {cartItems.slice(0, 3).map((item, index) => (
                            <ListGroup.Item
                              key={index}
                              className="d-flex justify-content-between align-items-center bg-dark text-white"
                            >
                              <div>
                                <h6 className="mb-1">{item.product_ID?.name || 'Product'}</h6>
                                <small className="text-muted">Qty: {item.quantity}</small>
                              </div>
                              <div className="text-end">
                                <div>Rs. {(item.product_ID?.price * item.quantity).toFixed(2)}</div>
                              </div>
                            </ListGroup.Item>
                          ))}
                          {cartItems.length > 3 && (
                            <ListGroup.Item className="text-center text-muted bg-dark">
                              + {cartItems.length - 3} more items
                            </ListGroup.Item>
                          )}
                        </ListGroup>
                        <div className="mt-3 pt-3 border-top" style={{ borderColor: '#444444' }}>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Subtotal</span>
                            <span>Rs. {originalSubtotal.toFixed(2)}</span>
                          </div>

                          {discountAmount > 0 && (
                            <div className="d-flex justify-content-between mb-2 bg-success bg-opacity-10 p-2 rounded">
                              <span className="fw-bold text-success">
                                {discountType === 'coupon' ?
                                  `Coupon Discount (${discountInfo?.code || ''})` :
                                  discountType === 'loyalty' ?
                                    `Loyalty Points Discount (${discountInfo?.pointsRedeemed || ''} points)` :
                                    'Discount'}
                              </span>
                              <span className="fw-bold text-success">- Rs. {discountAmount.toFixed(2)}</span>
                            </div>
                          )}

                          <div className="d-flex justify-content-between mb-2">
                            <span>Delivery Fee</span>
                            <span>Rs. 0.00</span>
                          </div>
                          <div className="d-flex justify-content-between fw-bold fs-5 mt-3 p-2 bg-dark border-top border-bottom" style={{ borderColor: '#444444 !important' }}>
                            <span>Total</span>
                            <span style={{ color: '#FFC107', fontSize: '1.2rem' }}>Rs. {totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-3 text-muted">
                        Your cart is empty
                      </div>
                    )}
                  </Card.Body>
                </Card>

                <Card className="shadow-sm bg-dark" style={{ borderTop: '4px solid #FFC107', color: '#FFFFFF' }}>
                  <Card.Body>
                    <h5 className="mb-4">Payment Method</h5>
                    <div className="d-flex flex-wrap gap-2 mb-4">
                      <Button
                        variant={paymentMethod === 'cash' ? '' : 'outline-light'}
                        onClick={() => {
                          setPaymentMethod('cash');
                          setMobileNumber('');
                        }}
                        className="flex-grow-1"
                        style={{
                          backgroundColor: paymentMethod === 'cash' ? '#FFC107' : 'transparent',
                          borderColor: '#FFC107',
                          color: paymentMethod === 'cash' ? '#1A1A1A' : '#FFC107',
                          fontWeight: '600',
                        }}
                      >
                        Cash on Delivery
                      </Button>
                      <Button
                        variant={paymentMethod === 'card' ? '' : 'outline-light'}
                        onClick={() => {
                          setPaymentMethod('card');
                          setMobileNumber('');
                        }}
                        className="flex-grow-1"
                        style={{
                          backgroundColor: paymentMethod === 'card' ? '#FFC107' : 'transparent',
                          borderColor: '#FFC107',
                          color: paymentMethod === 'card' ? '#1A1A1A' : '#FFC107',
                          fontWeight: '600',
                        }}
                      >
                        Card Payment
                      </Button>
                      <Button
                        variant={paymentMethod === 'easypaisa' ? '' : 'outline-light'}
                        onClick={() => {
                          setPaymentMethod('easypaisa');
                          setMobileNumber('');
                        }}
                        className="flex-grow-1"
                        style={{
                          backgroundColor: paymentMethod === 'easypaisa' ? '#FFC107' : 'transparent',
                          borderColor: '#FFC107',
                          color: paymentMethod === 'easypaisa' ? '#1A1A1A' : '#FFC107',
                          fontWeight: '600',
                        }}
                      >
                        EasyPaisa
                      </Button>
                      <Button
                        variant={paymentMethod === 'jazzcash' ? '' : 'outline-light'}
                        onClick={() => {
                          setPaymentMethod('jazzcash');
                          setMobileNumber('');
                        }}
                        className="flex-grow-1"
                        style={{
                          backgroundColor: paymentMethod === 'jazzcash' ? '#FFC107' : 'transparent',
                          borderColor: '#FFC107',
                          color: paymentMethod === 'jazzcash' ? '#1A1A1A' : '#FFC107',
                          fontWeight: '600',
                        }}
                      >
                        JazzCash
                      </Button>
                    </div>

                    {paymentMethod === 'card' ? (
                      stripeReady ? (
                        <Elements stripe={getStripe()}>
                          <CheckoutForm
                            totalAmount={totalAmount}
                            handlePaymentSuccess={handleSubmitOrder}
                            handlePaymentError={handlePaymentError}
                          />
                        </Elements>
                      ) : (
                        <Alert variant="info">Loading payment gateway...</Alert>
                      )
                    ) : paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash' ? (
                      <div>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: '#FFFFFF' }}>
                            Enter {paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'} Mobile Number
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                            placeholder="Enter 11 digit mobile number"
                            className="mb-3"
                            style={{
                              backgroundColor: '#2D2D2D',
                              color: '#FFFFFF',
                              border: '1px solid #FFC107',
                            }}
                          />
                        </Form.Group>
                        <Button
                          size="lg"
                          className="w-100 py-2"
                          onClick={handleSubmitOrder}
                          disabled={loading || cartItems.length === 0 || mobileNumber.length !== 11}
                          style={{
                            backgroundColor: '#FFC107',
                            borderColor: '#FFC107',
                            color: '#1A1A1A',
                            fontWeight: '600',
                          }}
                        >
                          {loading
                            ? 'Processing Payment...'
                            : `Pay Rs. ${totalAmount.toFixed(2)} with ${paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'}`}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="lg"
                        className="w-100 py-2"
                        onClick={handleSubmitOrder}
                        disabled={loading || cartItems.length === 0}
                        style={{
                          backgroundColor: '#FFC107',
                          borderColor: '#FFC107',
                          color: '#1A1A1A',
                          fontWeight: '600',
                        }}
                      >
                        {loading ? 'Placing Order...' : `Pay Rs. ${totalAmount.toFixed(2)} (Cash on Delivery)`}
                      </Button>
                    )}
                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
};

export default CheckoutPage;