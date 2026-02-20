import React from 'react';
import QuestionSearch from '../components/Questions/QuestionSearch';
import { Link, useLocation } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const location = useLocation();
  const initialTag = location.state?.selectedTag ?? null;

  return (
    <div className="home-container">
      <div className="home-layout">
        <main className="main-content">
          <QuestionSearch initialTag={initialTag} />
        </main>
        <aside className="home-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-title">Popular tags</h3>
            <Link to="/tags" className="sidebar-link">
              Browse all tags →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
