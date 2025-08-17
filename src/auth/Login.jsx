import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import Input from "../../components/ui/input";
import Label from "../../components/ui/label";


import { AlertCircle, Mail, Lock, LogIn, CheckCircle } from 'lucide-react';
import { authAPI, setAuthToken } from '../services/api';

import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check if user came from registration
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      if (location.state.email) {
        setFormData(prev => ({ ...prev, email: location.state.email }));
      }
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    
    try {
      console.log('Attempting login with API...');
      
      // Try the real API first, fall back to mock if it fails
      try {
        const response = await authAPI.login(formData);
        
        if (response.success && response.data.user && response.data.token) {
          const { user, token } = response.data;
          
          // Set auth token for future API calls
          setAuthToken(token);
          
          // Store current user session
          const currentUser = {
            ...user,
            token,
            isAuthenticated: true,
            loginTime: new Date().toISOString()
          };
          
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          
          console.log('Login successful via API');
          
          // Redirect based on role
          switch (user.role) {
            case 'customer':
              navigate('/customer/home');
              break;
            case 'staff':
              navigate('/staff/home');
              break;
            case 'manager':
              navigate('/manager/home');
              break;
            default:
              navigate('/customer/home');
          }
          return;
        }
      } catch (apiError) {
        console.log('API login failed, falling back to mock authentication:', apiError.message);
      }
      
      // Fallback to mock authentication for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get registered user data
      const registeredUser = JSON.parse(localStorage.getItem('registeredUser') || '{}');
      
      // Simulate authentication check
      if (registeredUser.email === formData.email && formData.password.length >= 6) {
        // Store current user session
        const currentUser = {
          ...registeredUser,
          isAuthenticated: true,
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        console.log('Login successful via mock authentication');
        
        // Redirect based on role
        switch (registeredUser.role) {
          case 'customer':
            navigate('/customer/home');
            break;
          case 'staff':
            navigate('/staff/home');
            break;
          case 'manager':
            navigate('/manager/home');
            break;
          default:
            navigate('/customer/home');
        }
        
      } else {
        setErrors({ submit: 'Invalid email or password. Please try again.' });
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // In a real app, this would navigate to a forgot password page
    alert('Forgot password functionality will be implemented. For demo purposes, use any email from registration and a password with at least 6 characters.');
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-content">
          <Card className="login-card">
            <div className="login-header">
              <div className="logo-section">
                <div className="logo-icon">
                  <LogIn size={40} />
                </div>
                <h1>SnackBox</h1>
                <p>Smart Canteen Management</p>
              </div>
              <h2>Welcome Back</h2>
              <p className="subtitle">Sign in to your account</p>
            </div>

            {successMessage && (
              <div className="success-message">
                <CheckCircle size={16} />
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <Label htmlFor="email">Email Address</Label>
                <div className="input-with-icon">
                  <Mail size={18} />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                  />
                </div>
                {errors.email && (
                  <span className="error-text">
                    <AlertCircle size={14} />
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="form-group">
                <Label htmlFor="password">Password</Label>
                <div className="input-with-icon">
                  <Lock size={18} />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'error' : ''}
                  />
                </div>
                {errors.password && (
                  <span className="error-text">
                    <AlertCircle size={14} />
                    {errors.password}
                  </span>
                )}
              </div>

              <div className="form-options">
                <div className="remember-me">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <button 
                  type="button" 
                  className="forgot-password"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              </div>

              {errors.submit && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {errors.submit}
                </div>
              )}

              <Button 
                type="submit" 
                className="login-button"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="login-footer">
              <p>
                Don't have an account?{' '}
                <button 
                  type="button" 
                  className="link-button"
                  onClick={() => navigate('/register')}
                >
                  Register here
                </button>
              </p>
            </div>

            <div className="demo-info">
              <h4>Demo Instructions:</h4>
              <p>
                1. Register first with any role (Customer, Staff, or Manager)<br/>
                2. Use the same email and any password (6+ characters) to login<br/>
                3. You'll be redirected based on your selected role
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;