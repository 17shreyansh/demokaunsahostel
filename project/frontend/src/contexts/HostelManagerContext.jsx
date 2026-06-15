import React, { createContext, useContext, useState, useEffect } from 'react';
import { hostelManagerAPI } from '../services/api';

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
      const res = await hostelManagerAPI.getMe();
      setManager(res.data.manager);
    } catch (error) {
      setManager(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await hostelManagerAPI.login({ email, password });
    setManager(res.data.manager);
    return res.data;
  };

  const signup = async (data) => {
    const res = await hostelManagerAPI.signup(data);
    setManager(res.data.manager);
    return res.data;
  };

  const logout = async () => {
    await hostelManagerAPI.logout();
    setManager(null);
  };

  const submitKYC = async (formData) => {
    const res = await hostelManagerAPI.submitKYC(formData);
    await checkAuth();
    return res.data;
  };

  return (
    <HostelManagerContext.Provider value={{ manager, loading, login, signup, logout, submitKYC, checkAuth }}>
      {children}
    </HostelManagerContext.Provider>
  );
};
