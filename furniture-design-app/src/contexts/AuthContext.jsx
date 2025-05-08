// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authenticateUser } from '../models/userData';

// Create the Auth Context
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in session storage
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (username, password) => {
    const user = authenticateUser(username, password);
    if (user) {
      setCurrentUser(user);
      sessionStorage.setItem('user', JSON.stringify(user));
      return user; // Return the user object instead of just a boolean
    }
    return false;
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('user');
  };

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;