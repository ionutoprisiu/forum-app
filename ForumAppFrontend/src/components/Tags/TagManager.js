import React, { useState, useEffect } from 'react';
import { getTagsForQuestion, addTagToQuestion, removeTagFromQuestion, getPopularTags } from '../../services/tagService';

export default function TagManager({ questionId, onTagsUpdated }) {
  const [tags, setTags] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const questionTags = await getTagsForQuestion(questionId);
        setTags(questionTags);
      } catch (err) {
      }
    };

    const loadPopularTags = async () => {
      try {
        const popular = await getPopularTags();
        setPopularTags(popular);
      } catch (err) {
      }
    };

    loadTags();
    loadPopularTags();
  }, [questionId]);

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await addTagToQuestion(questionId, newTag.trim());
      const updatedTags = await getTagsForQuestion(questionId);
      setTags(updatedTags);
      setNewTag('');
      if (onTagsUpdated) {
        onTagsUpdated();
      }
    } catch (err) {
      setError(err.message || 'Error adding tag');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTag = async (tagName) => {
    setIsLoading(true);
    setError(null);

    try {
      await removeTagFromQuestion(questionId, tagName);
      const updatedTags = await getTagsForQuestion(questionId);
      setTags(updatedTags);
      if (onTagsUpdated) {
        onTagsUpdated();
      }
    } catch (err) {
      setError(err.message || 'Error removing tag');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopularTagClick = (tagName) => {
    setNewTag(tagName);
  };

  return (
    <div className="tag-manager">
      <div className="mb-3">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Add a new tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            disabled={isLoading}
          />
          <button
            className="btn btn-primary"
            onClick={handleAddTag}
            disabled={isLoading || !newTag.trim()}
          >
            Add
          </button>
        </div>
      </div>

      {error && (
        <div className="text-danger small mb-3">
          {error}
        </div>
      )}

      <div className="mb-3">
        <h6>Popular tags:</h6>
        <div className="d-flex flex-wrap gap-2">
          {popularTags.map(tag => (
            <button
              key={tag.id}
              className="btn btn-sm btn-outline-secondary"
              onClick={() => handlePopularTagClick(tag.name)}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h6>Added tags:</h6>
        <div className="d-flex flex-wrap gap-2">
          {tags.map(tag => (
            <div key={tag.id} className="badge bg-primary d-flex align-items-center">
              {tag.name}
              <button
                className="btn btn-sm btn-link text-white p-0 ms-2"
                onClick={() => handleRemoveTag(tag.name)}
                disabled={isLoading}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 