import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllTags } from '../services/tagService';
import './TagsPage.css';

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllTags()
      .then(setTags)
      .catch(() => setError('Could not load tags'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="tags-page">
        <div className="tags-page-content">
          <div className="tags-loading">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading tags...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tags-page">
        <div className="tags-page-content">
          <div className="tags-error">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <p>{error}</p>
            <Link to="/" className="btn-primary">Back to questions</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tags-page">
      <div className="tags-page-content">
        <div className="tags-header">
          <h1>Popular tags</h1>
          <p>Browse by topic or <Link to="/">view all questions</Link></p>
        </div>
        <div className="tags-grid">
          {tags.length === 0 ? (
            <p className="tags-empty">No tags yet.</p>
          ) : (
            tags.map((tag) => (
              <Link
                key={tag.id}
                to="/"
                className="tag-card"
                state={{ selectedTag: tag.name }}
              >
                <i className="bi bi-tag-fill"></i>
                <span>{tag.name}</span>
              </Link>
            ))
          )}
        </div>
        <div className="tags-footer">
          <Link to="/" className="btn-secondary">
            <i className="bi bi-arrow-left"></i> Back to questions
          </Link>
        </div>
      </div>
    </div>
  );
}
