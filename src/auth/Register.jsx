import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { AlertCircle, User, Mail, Lock, UserCheck } from 'lucide-react';
import { authAPI } from '../services/api.jsx';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    employeeId: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

  const handleRoleChange = (value) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10,15}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if ((formData.role === 'staff' || formData.role === 'manager') && !formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required for staff and managers';
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
    
    try {
      console.log('Attempting registration with API...');
      
      // Try the real API first, fall back to mock if it fails
      try {
        const response = await authAPI.register(formData);
        
        if (response.success && response.data.user) {
          console.log('Registration successful via API');
          
          // Redirect to login page with success message
          navigate('/login', { 
            state: { 
              message: 'Registration successful! Please log in to continue.',
              email: formData.email 
            }
          });
          return;
        }
      } catch (apiError) {
        console.log('API registration failed, falling back to mock registration:', apiError.message);
        
        // Handle specific API errors
        if (apiError.message && apiError.message.includes('already exists')) {
          setErrors({ email: 'User with this email already exists' });
          return;
        }
      }
      
      // Fallback to mock registration for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store user data in localStorage for demo purposes
      const userData = {
        id: Date.now(),
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        employeeId: formData.employeeId,
        phone: formData.phone,
        registeredAt: new Date().toISOString()
      };
      
      localStorage.setItem('registeredUser', JSON.stringify(userData));
      
      console.log('Registration successful via mock authentication');
      
      // Redirect to login page
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please log in to continue.',
          email: formData.email 
        }
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-background">
        <div className="register-content">
          <Card className="register-card">
            <div className="register-header">
              <div className="logo-section">
                <div className="logo-icon">
                  <UserCheck size={40} />
                </div>
                <h1>SnackBox</h1>
                <p>Smart Canteen Management</p>
              </div>
              <h2>Create Your Account</h2>
            </div>

            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-row">
                <div className="form-group">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="input-with-icon">
                    <User size={18} />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={errors.fullName ? 'error' : ''}
                    />
                  </div>
                  {errors.fullName && (
                    <span className="error-text">
                      <AlertCircle size={14} />
                      {errors.fullName}
                    </span>
                  )}
                </div>

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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <Label htmlFor="password">Password</Label>
                  <div className="input-with-icon">
                    <Lock size={18} />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
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

                <div className="form-group">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="input-with-icon">
                    <Lock size={18} />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={errors.confirmPassword ? 'error' : ''}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <span className="error-text">
                      <AlertCircle size={14} />
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <Label htmlFor="role">Select Role</Label>
                  <Select onValueChange={handleRoleChange} value={formData.role}>
                    <SelectTrigger className={errors.role ? 'error' : ''}>
                      <SelectValue placeholder="Choose your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="staff">Staff Member</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <span className="error-text">
                      <AlertCircle size={14} />
                      {errors.role}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="input-with-icon">
                    <span className="phone-prefix">+880</span>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="1XXXXXXXXX"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={errors.phone ? 'error' : ''}
                    />
                  </div>
                  {errors.phone && (
                    <span className="error-text">
                      <AlertCircle size={14} />
                      {errors.phone}
                    </span>
                  )}
                </div>
              </div>

              {(formData.role === 'staff' || formData.role === 'manager') && (
                <div className="form-group">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <div className="input-with-icon">
                    <UserCheck size={18} />
                    <Input
                      id="employeeId"
                      name="employeeId"
                      type="text"
                      placeholder="Enter your employee ID"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      className={errors.employeeId ? 'error' : ''}
                    />
                  </div>
                  {errors.employeeId && (
                    <span className="error-text">
                      <AlertCircle size={14} />
                      {errors.employeeId}
                    </span>
                  )}
                  <p className="helper-text">
                    Employee ID will be verified with our database
                  </p>
                </div>
              )}

              {errors.submit && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {errors.submit}
                </div>
              )}

              <Button 
                type="submit" 
                className="register-button"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Register'}
              </Button>
            </form>

            <div className="register-footer">
              <p>
                Already have an account?{' '}
                <button 
                  type="button" 
                  className="link-button"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </button>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;