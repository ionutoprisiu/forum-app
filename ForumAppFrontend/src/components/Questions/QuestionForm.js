import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { createQuestion } from '../../services/questionService';
import { uploadImage } from '../../services/uploadService';
import TagSelector from '../Tags/TagSelector';
import './QuestionForm.css';

export default function QuestionForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    text: '',
    picture: '',
    tagNames: []
  });

  const [validationErrors, setValidationErrors] = useState({
    title: '',
    text: '',
    picture: '',
    tags: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    setValidationErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    setError(null);
  };

  const handleTagsChange = (selectedTags) => {
    setForm(prev => ({
      ...prev,
      tagNames: selectedTags
    }));
    setValidationErrors(prev => ({
      ...prev,
      tags: ''
    }));
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setUploadError(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload image files only (jpg, png, gif).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be less than 5MB.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setUploadError(null);
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!form.title.trim()) {
      errors.title = 'Title is required';
    } else if (form.title.length < 15) {
      errors.title = 'Title must be at least 15 characters';
    } else if (form.title.length > 150) {
      errors.title = 'Title cannot exceed 150 characters';
    } else if (!/^[A-Z]/.test(form.title)) {
      errors.title = 'Title must start with a capital letter';
    } else if (/(.)\1{4,}/.test(form.title)) {
      errors.title = 'Title contains excessive repeated characters';
    }

    if (!form.text.trim()) {
      errors.text = 'Content is required';
    } else if (form.text.length < 30) {
      errors.text = 'Content must be at least 30 characters';
    } else if (form.text.length > 10000) {
      errors.text = 'Content cannot exceed 10000 characters';
    } else if (form.text.trim().split(/\s+/).length < 5) {
      errors.text = 'Content must contain at least 5 words';
    } else if (/(.)\1{9,}/.test(form.text)) {
      errors.text = 'Content contains excessive repeated characters';
    }

    if (!form.tagNames || form.tagNames.length === 0) {
      errors.tags = 'Select at least one tag';
    } else if (form.tagNames.length > 5) {
      errors.tags = 'You cannot select more than 5 tags';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to post a question');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (imageUrl && imageUrl.startsWith('http')) {
          imageUrl = imageUrl.split('/').pop();
        }
      }

      const questionData = {
        ...form,
        picture: imageUrl
      };

      const createdQuestion = await createQuestion(user.id, questionData);
      toast.success('Question posted!');
      navigate(`/questions/${createdQuestion.id}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'An error occurred while creating the question';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const titleCount = form.title.length;
  const textCount = form.text.length;
  const titleCountClass = titleCount > 150 ? 'count-error' : titleCount >= 15 ? 'count-ok' : 'count-muted';
  const textCountClass = textCount > 10000 ? 'count-error' : textCount >= 30 ? 'count-ok' : 'count-muted';

  return (
    <div className="question-form-container">
      <div className="form-tips">
        <i className="bi bi-lightbulb"></i>
        <div>
          <strong>Tips:</strong> Use a clear title that summarizes the problem. Add enough detail so others can understand and help. Choose 1–5 tags to make your question easy to find.
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <section className="form-section">
          <h3 className="form-section-title">Your question</h3>
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title
            </label>
            <input
              type="text"
              className={`form-control ${validationErrors.title ? 'is-invalid' : ''}`}
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="e.g. How do I fix a null pointer in Java?"
              maxLength={150}
            />
            <div className={`char-count ${titleCountClass}`}>
              {titleCount}/150 {titleCount < 15 && '(min 15)'}
            </div>
            {validationErrors.title && (
              <div className="error-message" role="alert">
                <i className="bi bi-exclamation-circle"></i>
                {validationErrors.title}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="text" className="form-label">
              Content
            </label>
            <textarea
              className={`form-control form-control-textarea ${validationErrors.text ? 'is-invalid' : ''}`}
              id="text"
              name="text"
              value={form.text}
              onChange={handleChange}
              disabled={isLoading}
              rows={8}
              placeholder="Describe your problem or question in detail. Include what you've already tried, if relevant."
              maxLength={10000}
            />
            <div className={`char-count ${textCountClass}`}>
              {textCount}/10000 {textCount < 30 && '(min 30)'}
            </div>
            {validationErrors.text && (
              <div className="error-message" role="alert">
                <i className="bi bi-exclamation-circle"></i>
                {validationErrors.text}
              </div>
            )}
          </div>
        </section>

        <section className="form-section">
          <h3 className="form-section-title">Image <span className="optional">(optional)</span></h3>
          <div
            className={`image-upload-section ${isDragging ? 'drag-active' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="file-input"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />
            {!imagePreview ? (
              <div className="image-upload-content">
                <i className="bi bi-image upload-icon"></i>
                <p>Drag and drop an image here or</p>
                <button
                  type="button"
                  className="upload-button"
                  onClick={handleFileButtonClick}
                >
                  <i className="bi bi-cloud-upload"></i> Choose file
                </button>
                <span className="upload-hint">JPG, PNG or GIF, max 5MB</span>
              </div>
            ) : (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Upload preview" className="image-preview" />
                <button
                  type="button"
                  className="remove-image"
                  onClick={handleRemoveImage}
                  title="Remove image"
                  aria-label="Remove image"
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
            )}
            {uploadError && (
              <div className="upload-error" role="alert">
                <i className="bi bi-exclamation-circle"></i> {uploadError}
              </div>
            )}
          </div>
        </section>

        <section className="form-section">
          <h3 className="form-section-title">Tags <span className="optional">(1–5 required)</span></h3>
          <div className={`tag-input-container ${validationErrors.tags ? 'is-invalid' : ''}`}>
            <TagSelector
              selectedTags={form.tagNames}
              onTagsChange={handleTagsChange}
            />
          </div>
          {validationErrors.tags && (
            <div className="error-message" role="alert">
              <i className="bi bi-exclamation-circle"></i> {validationErrors.tags}
            </div>
          )}
        </section>

        {error && (
          <div className="error-message form-error-alert" role="alert">
            <i className="bi bi-exclamation-triangle-fill"></i>
            {error}
          </div>
        )}

        <div className="form-actions">
          <Link to="/" className="btn-cancel">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="bi bi-arrow-repeat spin"></i> Submitting...
              </>
            ) : (
              <>
                <i className="bi bi-send-fill"></i> Post question
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
