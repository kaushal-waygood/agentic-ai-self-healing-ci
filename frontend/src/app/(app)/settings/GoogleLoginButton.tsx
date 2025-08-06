'use client';
import React from 'react';

const GoogleLoginButton = () => {
  const handleLogin = () => {
    // 🔥 Direct browser redirect (NOT fetch)
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <button
      onClick={handleLogin}
      style={{
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#4285F4',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      Login with Google
    </button>
  );
};

export default GoogleLoginButton;
