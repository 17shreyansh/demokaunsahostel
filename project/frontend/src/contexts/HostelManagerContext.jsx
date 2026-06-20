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
    // Skip API call if no auth cookie exists (anonymous visitors)
    const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith('token=') || c.trim().startsWith('jwt=') || c.trim().startsWith('connect.sid=') || c.trim().startsWith('hm_token='))
    if (!hasCookie) {
      setLoading(false)
      return
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await hostelManagerAPI.getMe();
      setManager(res.data.manager);
    } catch (error) {
      // If 404 or manager not found, clear cookies
      if (error.response?.status === 404 || error.response?.data?.code === 'MANAGER_NOT_FOUND') {
        console.log('🔴 Invalid token detected - clearing cookies');
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      }
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
    try {
      const res = await hostelManagerAPI.submitKYC(formData);
      await checkAuth();
      return res.data;
    } catch (error) {
      // If manager not found error, clear cookies and force re-login
      if (error.response?.status === 404 || error.response?.data?.code === 'MANAGER_NOT_FOUND') {
        console.log('🔴 Manager not found - clearing auth cookies');
        
        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        // Clear state
        setManager(null);
        
        // Redirect to login
        window.location.href = '/hostel-manager/auth?error=session_expired';
        
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  };

  return (
    <HostelManagerContext.Provider value={{ manager, loading, login, signup, logout, submitKYC, checkAuth }}>
      {children}
    </HostelManagerContext.Provider>
  );
};
