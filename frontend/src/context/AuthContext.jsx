import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Setup Axios defaults for cookies
  axios.defaults.withCredentials = true;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const checkAuthStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/status`);
      if (res.data.isAuthenticated) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const loginWithGoogle = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const connectCalendar = () => {
    window.location.href = `${API_BASE_URL}/auth/google/calendar`;
  };

  const logout = () => {
    window.location.href = `${API_BASE_URL}/auth/logout`;
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, connectCalendar, logout, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
