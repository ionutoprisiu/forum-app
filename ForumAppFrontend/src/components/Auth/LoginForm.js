import React, { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './LoginForm.css';

export default function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = useCallback(async e => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await loginUser(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  }, [form.email, form.password, loginUser, navigate]);

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Login</h2>
          <p>Sign in to access the forum</p>
        </div>
        <form onSubmit={handleSubmit} data-testid="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>
          <div
            className="error-message"
            data-testid="error-message"
            role="alert"
            style={{ display: error ? 'flex' : 'none' }}
          >
            <i className="bi bi-exclamation-circle"></i>
            {error}
          </div>
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
          <div className="register-link">
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}
