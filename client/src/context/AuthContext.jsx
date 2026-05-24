import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMe = async () => {
    try {
      const { data } = await axios.get('/api/auth/me');
      // Interceptor unwraps envelope → data is now { user, profile }
      setUser(data.user);
      setProfile(data.profile);
    } catch {
      // Token is invalid/expired/malformed — clear it silently
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    // Interceptor unwraps envelope → data is now { token, user, profile }
    localStorage.setItem('token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    setProfile(data.profile);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setProfile(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = (newProfile) => setProfile(newProfile);

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, updateProfile, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};
