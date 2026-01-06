import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState(localStorage.getItem('FoodCustomerToken'));

  useEffect(() => {
    // Check if there's a token in localStorage
    const token = localStorage.getItem('FoodCustomerToken');
    if (token) {
      // Fetch user data from the token
      fetchUserData(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      // You would typically have an endpoint to validate the token and return user data
      const response = await axios.get('http://localhost:3005/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If token is invalid, clear it
      localStorage.removeItem('FoodCustomerToken');
      setUserToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:3005/auth/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      localStorage.setItem('FoodCustomerToken', token);
      setUserToken(token);
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear token from localStorage
      localStorage.removeItem('FoodCustomerToken');
      setCurrentUser(null);
      setUserToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateToken = (token) => {
    localStorage.setItem('FoodCustomerToken', token);
    setUserToken(token);
  };

  const value = {
    currentUser,
    userToken,
    loading,
    login,
    logout,
    updateToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};