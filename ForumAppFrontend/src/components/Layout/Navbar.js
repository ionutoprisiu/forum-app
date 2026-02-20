import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch {}
  };

  return (
    <nav className="main-navbar">
      <div className="navbar-container">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-chat-square-text-fill"></i>
          <span>Forum App</span>
        </Link>
        
        <div className="navbar-content">
          {user?.role === 'MODERATOR' && (
            <div className="navbar-links">
              <Link className="nav-link" to="/moderator">
                <i className="bi bi-shield-lock-fill"></i>
                <span>Moderator</span>
              </Link>
            </div>
          )}
          {user && (
            <Link to="/ask" className="navbar-ask-btn">
              <i className="bi bi-plus-lg"></i>
              <span>Ask question</span>
            </Link>
          )}
          <div className="navbar-auth">
            {user ? (
              <>
                <Link to="/profile" className="profile-link" data-testid="user-menu">
                  <i className="bi bi-person-circle"></i>
                  <span>{user.username}</span>
                </Link>
                <button 
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="login-btn">
                  <i className="bi bi-box-arrow-in-right"></i>
                  <span>Login</span>
                </Link>
                <Link to="/register" className="register-btn">
                  <i className="bi bi-person-plus"></i>
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
