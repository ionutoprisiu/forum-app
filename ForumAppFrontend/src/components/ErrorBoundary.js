import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{ marginBottom: '0.5rem', color: 'var(--text-primary, #1a1a1a)' }}>Something went wrong</h1>
          <p style={{ color: 'var(--text-gray, #666)', marginBottom: '1.5rem' }}>
            An unexpected error occurred. Please try again.
          </p>
          <Link to="/" style={{
            padding: '0.5rem 1rem',
            background: 'var(--primary-orange, #e67e22)',
            color: '#fff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 500
          }}>
            Back to home
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
