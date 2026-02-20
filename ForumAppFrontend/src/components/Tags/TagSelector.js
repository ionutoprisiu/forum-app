import React, { useState, useEffect } from 'react';
import { getAllTags } from '../../services/tagService';
import './TagSelector.css';

export default function TagSelector({ selectedTags = [], onTagsChange }) {
  const [availableTags, setAvailableTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const tags = await getAllTags();
      setAvailableTags(tags);
    } catch (err) {
      setError('Could not load tags');
    }
  };

  const handleTagClick = (tagName) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter(tag => tag !== tagName));
    } else if (selectedTags.length < 5) {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const handleRemoveTag = (tagName) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagName));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      onTagsChange([...selectedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  return (
    <div className="tag-selector-container">
      <h3 className="tag-heading">Manage tags</h3>

      <div className="tag-input-container">
        <input
          type="text"
          className="tag-input"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add a new tag..."
        />
        <button
          className="add-tag-button"
          onClick={handleAddTag}
          disabled={!newTag.trim() || selectedTags.length >= 5}
        >
          Add
        </button>
      </div>

      {selectedTags.length > 0 && (
        <div className="selected-tags">
          {selectedTags.map(tag => (
            <span key={tag} className="selected-tag">
              {tag}
              <button
                className="remove-tag"
                onClick={() => handleRemoveTag(tag)}
                title="Remove tag"
              >
                <i className="bi bi-x"></i>
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="popular-tags">
        <h4 className="popular-tags-title">Popular tags:</h4>
        <div className="tag-list">
          {availableTags.map(tag => (
            <span
              key={tag.name}
              className={`tag-item ${selectedTags.includes(tag.name) ? 'selected' : ''}`}
              onClick={() => handleTagClick(tag.name)}
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
} 