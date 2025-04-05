import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './Login.css';
import agriLogo from './logo.png'; // ✅ Import your image

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    const savedRemember = localStorage.getItem('rememberMe') === 'true';

    if (savedEmail && savedPassword && savedRemember) {
      setFormData({ email: savedEmail, password: savedPassword });
      setRememberMe(true);
    }
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) {
      newErrors.email = "Enter a valid email";
    }
    if (formData.password.length < 6) {
      newErrors.password = "Password should be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      const token = res.data.token;

      if (rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('savedEmail', formData.email);
        localStorage.setItem('savedPassword', formData.password);
        localStorage.setItem('rememberMe', true);
      } else {
        sessionStorage.setItem('token', token);
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('savedPassword');
        localStorage.removeItem('rememberMe');
      }

      setMessage("Welcome back! Redirecting...");
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name } = decoded;

      const res = await axios.post('http://localhost:5000/api/auth/google-login', { email, name });
      const token = res.data.token;

      localStorage.setItem('token', token);
      setMessage("Welcome back! Redirecting...");
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error("Google login failed", err);
      setMessage("Google login failed. Try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={agriLogo} alt="Agri Products Logo" className="login-logo" />
        <h1>Welcome to Agri-Products</h1>
        <p>Real-Time Monitoring & Quality Assurance at Your Fingertips</p>
      </div>

      <div className="login-right">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Login</h2>

          <div className="input-box">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder=" "
            />
            <label>Email Address</label>
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="input-box">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder=" "
            />
            <label>Password</label>
            <span className="toggle-eye" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <div className="extras">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              /> Remember Me
            </label>
            <a href="/forgot-password">Forgot Password?</a>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="info-text">
            <p>Or sign in with Google</p>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => console.log("Google Login Failed")}
            />
          </div>

          {message && <p className="info-text">{message}</p>}

          <div className="signup-link">
            Don’t have an account? <a href="/signup">Sign up here</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
