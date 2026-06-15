import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const HostelManagerContext = createContext();

export const useHostelManager = () => {
  const context = useContext(HostelManagerContext);
  if (!context) throw new Error('useHostelManager must be used within HostelManagerProvider');
  return context;
};

export const HostelManagerProvider = ({ children }) => {
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await axios.get('/api/hostel-manager/auth/me', { withCredentials: true });
      setManager(res.data.manager);
    } catch (error) {
      setManager(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post('/api/hostel-manager/auth/login', { email, password }, { withCredentials: true });
    setManager(res.data.manager);
    return res.data;
  };

  const signup = async (data) => {
    const res = await axios.post('/api/hostel-manager/auth/signup', data, { withCredentials: true });
    setManager(res.data.manager);
    return res.data;
  };

  const logout = async () => {
    await axios.post('/api/hostel-manager/auth/logout', {}, { withCredentials: true });
    setManager(null);
  };

  const submitKYC = async (formData) => {
    const res = await axios.post('/api/hostel-manager/auth/kyc', formData, { 
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    await checkAuth();
    return res.data;
  };

  return (
    <HostelManagerContext.Provider value={{ manager, loading, login, signup, logout, submitKYC, checkAuth }}>
      {children}
    </HostelManagerContext.Provider>
  );
};
