import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page not found | Forum App';
    return () => { document.title = 'Forum App'; };
  }, []);
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <span className="not-found-code">404</span>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="not-found-btn">
          <i className="bi bi-house-door"></i> Back to home
        </Link>
      </div>
    </div>
  );
}
