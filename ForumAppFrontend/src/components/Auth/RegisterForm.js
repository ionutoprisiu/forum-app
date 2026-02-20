import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import './RegisterForm.css';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validations, setValidations] = useState({
    username: { isValid: true, message: '' },
    email: { isValid: true, message: '' },
    password: { isValid: true, message: '' },
    phoneNumber: { isValid: true, message: '' }
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  const validatePassword = (password) => {
    const strength = {
      score: 0,
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    if (strength.hasMinLength) strength.score++;
    if (strength.hasUpperCase) strength.score++;
    if (strength.hasLowerCase) strength.score++;
    if (strength.hasNumber) strength.score++;
    if (strength.hasSpecialChar) strength.score++;

    setPasswordStrength(strength);
  };

  const validateField = (name, value) => {
    let isValid = true;
    let message = '';

    switch (name) {
      case 'username':
        if (value.length < 3) {
          isValid = false;
          message = 'Username must be at least 3 characters';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          message = 'Email address is not valid';
        }
        break;
      case 'password':
        validatePassword(value);
        if (value.length < 8) {
          isValid = false;
          message = 'Password must be at least 8 characters';
        }
        break;
      case 'phoneNumber':
        const phoneRegex = /^\+40[0-9]{9}$/;
        if (!phoneRegex.test(value)) {
          isValid = false;
          message = 'Phone number must start with +40 followed by 9 digits';
        }
        break;
      default:
        break;
    }

    setValidations(prev => ({
      ...prev,
      [name]: { isValid, message }
    }));
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    let isFormValid = true;
    Object.keys(form).forEach(key => {
      validateField(key, form[key]);
      if (!validations[key].isValid) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      setIsLoading(false);
      setError('Please correct the errors in the form');
      return;
    }

    try {
      await authService.register(form);
      await loginUser(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration error');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthClass = () => {
    if (passwordStrength.score <= 2) return 'weak';
    if (passwordStrength.score <= 4) return 'medium';
    return 'strong';
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>Register</h2>
          <p>Create a new account to access the forum</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nume utilizator</label>
            <input
              type="text"
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              className={!validations.username.isValid ? 'invalid' : ''}
              disabled={isLoading}
            />
            {!validations.username.isValid && (
              <div className="validation-message">{validations.username.message}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={!validations.email.isValid ? 'invalid' : ''}
              disabled={isLoading}
            />
            {!validations.email.isValid && (
              <div className="validation-message">{validations.email.message}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className={!validations.password.isValid ? 'invalid' : ''}
              disabled={isLoading}
            />
            <div className="password-strength">
              <div className={`strength-bar ${getPasswordStrengthClass()}`}></div>
              <div className="password-requirements">
                <ul>
                  <li className={passwordStrength.hasMinLength ? 'requirement-met' : 'requirement-not-met'}>
                    ✓ At least 8 characters
                  </li>
                  <li className={passwordStrength.hasUpperCase ? 'requirement-met' : 'requirement-not-met'}>
                    ✓ One uppercase letter
                  </li>
                  <li className={passwordStrength.hasLowerCase ? 'requirement-met' : 'requirement-not-met'}>
                    ✓ One lowercase letter
                  </li>
                  <li className={passwordStrength.hasNumber ? 'requirement-met' : 'requirement-not-met'}>
                    ✓ One number
                  </li>
                  <li className={passwordStrength.hasSpecialChar ? 'requirement-met' : 'requirement-not-met'}>
                    ✓ One special character
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              className={!validations.phoneNumber.isValid ? 'invalid' : ''}
              disabled={isLoading}
            />
            {!validations.phoneNumber.isValid && (
              <div className="validation-message">{validations.phoneNumber.message}</div>
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Register'}
          </button>

          <div className="login-link">
            <p>
              Already have an account? <Link to="/login">Sign in here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
