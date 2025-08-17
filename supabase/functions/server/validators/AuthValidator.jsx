// AuthValidator.jsx - Frontend-friendly validation utilities

class AuthValidator {
  // Registration validation
  validateRegistration(data) {
    const errors = {};

    // Full name
    if (!data.fullName?.trim()) {
      errors.fullName = ['Full name is required'];
    } else if (data.fullName.trim().length < 2) {
      errors.fullName = ['Full name must be at least 2 characters'];
    }

    // Email
    if (!data.email?.trim()) {
      errors.email = ['Email is required'];
    } else if (!this.isValidEmail(data.email)) {
      errors.email = ['Please enter a valid email address'];
    }

    // Password
    if (!data.password) {
      errors.password = ['Password is required'];
    } else {
      const passwordErrors = this.validatePassword(data.password);
      if (passwordErrors.length) errors.password = passwordErrors;
    }

    // Confirm password
    if (!data.confirmPassword) {
      errors.confirmPassword = ['Password confirmation is required'];
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = ['Passwords do not match'];
    }

    // Role
    if (!data.role) {
      errors.role = ['Role selection is required'];
    } else if (!['customer', 'staff', 'manager'].includes(data.role)) {
      errors.role = ['Invalid role selected'];
    }

    // Phone
    if (!data.phone?.trim()) {
      errors.phone = ['Phone number is required'];
    } else if (!this.isValidPhone(data.phone)) {
      errors.phone = ['Please enter a valid phone number'];
    }

    // Employee ID for staff/managers
    if ((data.role === 'staff' || data.role === 'manager') && !data.employeeId?.trim()) {
      errors.employeeId = ['Employee ID is required for staff and managers'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Login validation
  validateLogin(data) {
    const errors = {};

    if (!data.email?.trim()) {
      errors.email = ['Email is required'];
    } else if (!this.isValidEmail(data.email)) {
      errors.email = ['Please enter a valid email address'];
    }

    if (!data.password) {
      errors.password = ['Password is required'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Password rules
  validatePassword(password) {
    const errors = [];

    if (password.length < 6) errors.push('Password must be at least 6 characters long');
    if (password.length > 128) errors.push('Password must be less than 128 characters');
    if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
    if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
    if (!/\d/.test(password)) errors.push('Password must contain at least one number');

    return errors;
  }

  // Helpers
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPhone(phone) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  }
}

// Exports
const authValidator = new AuthValidator();
export const validateRegistration = (data) => authValidator.validateRegistration(data);
export const validateLogin = (data) => authValidator.validateLogin(data);
export default authValidator;
