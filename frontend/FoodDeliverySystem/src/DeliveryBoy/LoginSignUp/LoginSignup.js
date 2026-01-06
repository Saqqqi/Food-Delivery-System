import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import './LoginSignup.css';

const DeliveryBoyLoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    vehicleType: 'bike',
    licenseNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const email = formData.email.trim();
    const password = formData.password.trim();
    const name = formData.name.trim();
    const phoneNumber = formData.phoneNumber.trim();
    const licenseNumber = formData.licenseNumber.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!isLogin) {
      if (!name || name.length < 2) {
        setError('Please enter a valid full name (at least 2 characters)');
        return false;
      }
      if (!phoneNumber || !/^\+?\d{10,15}$/.test(phoneNumber)) {
        setError('Please enter a valid phone number (10-15 digits)');
        return false;
      }
      if (!licenseNumber || licenseNumber.length < 5) {
        setError('Please enter a valid license number (at least 5 characters)');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const idToken = await userCredential.user.getIdToken();
        
        const response = await fetch('http://localhost:3005/auth/firebase-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken, email: formData.email })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Login failed with status ${response.status}`);
        }

        const data = await response.json();

        if (data.user && data.user.role === 'delivery_boy') {
          localStorage.setItem('deliveryBoyToken', data.token);
          localStorage.setItem('deliveryBoyUser', JSON.stringify(data.user));
          navigate('/delivery/dashboard');
        } else {
          throw new Error('Access denied. This login is for delivery boys only.');
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const idToken = await userCredential.user.getIdToken();

        const response = await fetch('http://localhost:3005/auth/firebase-register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken,
            userData: {
              name: formData.name,
              email: formData.email,
              uid: userCredential.user.uid,
              emailVerified: userCredential.user.emailVerified
            },
            role: 'delivery_boy',
            vehicleType: formData.vehicleType,
            licenseNumber: formData.licenseNumber,
            phoneNumber: formData.phoneNumber
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Registration failed with status ${response.status}`);
        }

        setSuccessMessage('Registration successful! Please login with your credentials.');
        setIsLogin(true);
        setFormData({
          name: '',
          email: '',
          password: '',
          phoneNumber: '',
          vehicleType: 'bike',
          licenseNumber: ''
        });
      }
    } catch (error) {
      const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/invalid-email': 'Invalid email format.',
        'auth/weak-password': 'Password is too weak (minimum 6 characters).',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your connection.'
      };
      setError(errorMessages[error.code] || error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="delivery-auth-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="delivery-auth-card"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="delivery-auth-header">
          <motion.h2 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {isLogin ? 'Delivery Partner Login' : 'Join Our Delivery Team'}
          </motion.h2>
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {isLogin ? 'Access your delivery dashboard' : 'Start earning with FoodieFly'}
          </motion.p>
        </div>

        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span>{error}</span>
          </motion.div>
        )}

        {successMessage && (
          <motion.div 
            className="success-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>{successMessage}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="delivery-auth-form">
          {!isLogin && (
            <motion.div
              className="form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </motion.div>
          )}

          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: isLogin ? 0.4 : 0.5 }}
          >
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </motion.div>

          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: isLogin ? 0.5 : 0.6 }}
          >
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </motion.div>

          {!isLogin && (
            <>
              <motion.div
                className="form-group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <label htmlFor="vehicleType">Vehicle Type</label>
                <select
                  name="vehicleType"
                  id="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="bike">Bike</option>
                  
                </select>
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <label htmlFor="licenseNumber">License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  id="licenseNumber"
                  placeholder="Enter license number"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  required
                />
              </motion.div>
            </>
          )}

          <motion.button
            type="submit"
            className={`delivery-auth-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isLogin ? 0.6 : 1.0 }}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              isLogin ? 'Login' : 'Register'
            )}
          </motion.button>
        </form>

        <motion.div 
          className="delivery-auth-switch"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: isLogin ? 0.7 : 1.1 }}
        >
          <p>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccessMessage('');
              }}
              className="switch-link"
            >
              {isLogin ? 'Register here' : 'Login here'}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default DeliveryBoyLoginSignup;