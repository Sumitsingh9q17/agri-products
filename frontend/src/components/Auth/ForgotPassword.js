import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(res.data.message || "Password reset link sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link.");
    }

    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        {message && <p className="info-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
        <p><a href="/login">Back to Login</a></p>
      </div>
    </div>
  );
};

export default ForgotPassword;
