import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import VoteButtons from '../Common/VoteButtons';
import { updateAnswer, deleteAnswer } from '../../services/answerService';
import './AnswerItem.css';

export default function AnswerItem({ answer, onAnswerUpdated }) {
  const { user } = useAuth();
  const isAuthor = user && answer.author?.id === user.id;
  const isModerator = user && user.role === 'MODERATOR';
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(answer.text);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEdit = async () => {
    if (isEditing) {
      setIsLoading(true);
      setError(null);
      try {
        await updateAnswer(answer.id, { text: editedText });
        setIsEditing(false);
        if (onAnswerUpdated) {
          onAnswerUpdated();
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error updating answer');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsEditing(true);
      setEditedText(answer.text);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this answer?')) {
      setIsLoading(true);
      setError(null);
      try {
        await deleteAnswer(answer.id);
        if (onAnswerUpdated) {
          onAnswerUpdated();
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error deleting answer');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex">
          <div className="flex-grow-1">
            {isEditing ? (
              <div className="mb-3">
                <textarea
                  className="form-control"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  disabled={isLoading}
                  rows="3"
                />
                {error && (
                  <div className="alert alert-danger mt-2" role="alert">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <p className="card-text">{answer.text}</p>
            )}
            <div className="answer-meta">
              <div className="author-info">
                <span className="author-name">Answer by {answer.author?.username}</span>
                <span className="author-score" title="User score">
                  <i className="bi bi-star-fill text-warning me-1"></i>
                  {answer.author?.score.toFixed(1)}
                </span>
              </div>
              <span className="answer-date">
                {new Date(answer.creationDateTime).toLocaleString()}
              </span>
            </div>
            {(isAuthor || isModerator) && !isEditing && (
              <div className="mt-2">
                <button 
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={handleEdit}
                  disabled={isLoading}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-sm btn-outline-danger"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  Delete
                </button>
              </div>
            )}
            {(isAuthor || isModerator) && isEditing && (
              <div className="mt-2">
                <button 
                  className="btn btn-sm btn-primary me-2"
                  onClick={handleEdit}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className="ms-3">
            <VoteButtons 
              entity={answer} 
              type="answer" 
              onVoteUpdated={onAnswerUpdated}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 