import React from 'react';
import { FiRefreshCw, FiAlertCircle } from 'react-icons/fi';

/**
 * Emergency Auth Reset Component
 * Use this to clear all authentication tokens and cookies
 * Place this temporarily in your app when auth issues occur
 */
const ClearAuthData = () => {
  const clearAllAuth = () => {
    // Clear all localStorage tokens
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('managerToken');
    
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    console.log('✅ All auth data cleared!');
    alert('All authentication data cleared! Page will reload. Please login again.');
    
    // Reload page
    window.location.href = '/';
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        background: '#ef4444',
        color: 'white',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        maxWidth: '300px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
        <FiAlertCircle style={{ fontSize: '24px', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
            Authentication Issue Detected
          </h3>
          <p style={{ margin: '0 0 12px 0', fontSize: '12px', lineHeight: '1.4' }}>
            Old token found. Click below to clear all auth data and login again.
          </p>
          <button
            onClick={clearAllAuth}
            style={{
              width: '100%',
              background: 'white',
              color: '#ef4444',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FiRefreshCw /> Clear & Reload
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClearAuthData;
