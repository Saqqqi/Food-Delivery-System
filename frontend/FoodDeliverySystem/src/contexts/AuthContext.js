import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, signOutUser } from '../firebase/auth';

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
    const unsubscribe = onAuthStateChange((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOutUser();
      setCurrentUser(null);
      setUserToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateToken = (token) => {
    setUserToken(token);
  };

  const value = {
    currentUser,
    userToken,
    loading,
    logout,
    updateToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
