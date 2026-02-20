import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { createAnswer } from '../../services/answerService';
import { uploadImage } from '../../services/uploadService';
import './AnswerForm.css';

export default function AnswerForm({ questionId, onAnswerAdded }) {
  const { user } = useAuth();
  const toast = useToast();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please enter an answer');
      return;
    }

    try {
    setIsLoading(true);
    setError(null);
      setSuccess(null);

      let imageUrl = null;
      if (image) {
        try {
          imageUrl = await uploadImage(image);
          if (imageUrl && imageUrl.startsWith('http')) {
            imageUrl = imageUrl.split('/').pop();
          }
        } catch (uploadError) {
          setError(uploadError.message || 'Error uploading image');
          return;
        }
      }

      await createAnswer(user.id, questionId, {
        text,
        picture: imageUrl
      });

      setText('');
      setImage(null);
      setImagePreview(null);
      setSuccess('Answer added successfully!');
      toast.success('Answer added successfully!');
      if (onAnswerAdded) {
        onAnswerAdded();
      }
    } catch (err) {
      const msg = err.message || 'Error adding answer';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please upload images only');
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!user) {
    return (
      <div className="answer-form-section">
      <div className="error-message">
          <i className="bi bi-exclamation-circle"></i>
          You must be logged in to add an answer.
        </div>
      </div>
    );
  }

  return (
    <div className="answer-form-section">
    <form onSubmit={handleSubmit}>
        <div className="answer-form-header">
          <i className="bi bi-person-circle"></i>
          <span>Answer by {user.username}</span>
        </div>

        <textarea
          className="answer-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your answer here..."
          rows="6"
        />

        <div 
          className={`image-upload-section ${isDragging ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="image-upload-content">
            <i className="bi bi-cloud-upload upload-icon"></i>
            <p>Drag & drop an image here or</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="file-input"
              id="answer-image"
            />
            <label htmlFor="answer-image" className="upload-button">
              Choose an image
            </label>
            <p className="text-muted">Accepted format: JPG, PNG, GIF (max 5MB)</p>
          </div>

          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
              <button type="button" className="remove-image" onClick={removeImage}>
                <i className="bi bi-x"></i>
              </button>
            </div>
          )}
      </div>
      
      {error && (
        <div className="error-message">
          <i className="bi bi-exclamation-circle"></i>
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <i className="bi bi-check-circle"></i>
            {success}
        </div>
      )}
      
      <div className="answer-actions">
          <span className="text-muted">
            {text.length} characters
          </span>
        <button
          type="submit"
          className="btn btn-primary"
            disabled={isLoading || !text.trim()}
        >
          {isLoading ? (
            <>
                <i className="bi bi-arrow-repeat spin"></i>
              Sending...
            </>
          ) : (
              <>
                <i className="bi bi-send"></i>
                Submit answer
              </>
          )}
        </button>
      </div>
    </form>
    </div>
  );
}
