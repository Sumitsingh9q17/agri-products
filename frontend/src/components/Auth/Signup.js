import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import './Signup.css';
import agriLogo from './logo.png'; // ✅ Import your image

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.match(/^\S+@\S+\.\S+$/)) {
      newErrors.email = "Enter a valid email";
    }

    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/\d/.test(password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!/[@$!%*?&]/.test(password)) {
      newErrors.password = "Password must contain at least one special character (@$!%*?&)";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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

    try {
      await axios.post('http://localhost:5000/api/auth/signup', formData);
      setMessage("Registered successfully! Redirecting...");
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
        <img src={agriLogo} alt="Logo" className="signup-logo" />
        <h1>Welcome to the Community!</h1>
        <p>Sign up to start your journey with us</p>
      </div>
      <div className="signup-right">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2>Sign Up</h2>

          {/* Full Name Input */}
          <div className="input-box">
        <FaUser className="input-icon" />

            <input
              type="text"
              id="fullName"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder=" "
            />
            <label htmlFor="fullName">Full Name</label>
            <i className="input-icon fas fa-user"></i>
          </div>

          {/* Email Input */}
          <div className="input-box">
        <FaEnvelope className="input-icon" />

            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder=" "
            />
            <label htmlFor="email">Email Address</label>
            <i className="input-icon fas fa-envelope"></i>
          </div>

          {/* Password Input */}
          <div className="input-box">
                    <FaLock className="input-icon" />

            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder=" "
            />
            <label htmlFor="password">Password</label>
            <i className="input-icon fas fa-lock"></i>
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="eye-icon">
              {showPassword ? <FaEyeSlash /> : <FaEye /> }
            </button>
          </div>

          {/* Confirm Password Input */}
          <div className="input-box">
          <FaLock className="input-icon" />

            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder=" "
            />
            <label htmlFor="confirmPassword">Confirm Password</label>
            <i className="input-icon fas fa-lock"></i>
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="eye-icon">
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Error Messages */}
          {Object.keys(errors).map((key) => (
            <p key={key} className="error-text">{errors[key]}</p>
          ))}

          {/* Signup Button */}
          <button type="submit" className="signup-button">Sign Up</button>

          {/* Login Link */}
          <div className="login-link">
            <p>Already have an account? <a href="/login">Login</a></p>
          </div>

          {/* Success or Error Message */}
          {message && <p className="info-text">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default Signup;
