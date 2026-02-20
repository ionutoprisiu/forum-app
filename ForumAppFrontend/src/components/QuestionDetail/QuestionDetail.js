import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getQuestionById, updateQuestion } from '../../services/questionService';
import { getAnswersForQuestion } from '../../services/answerService';
import { uploadImage } from '../../services/uploadService';
import VoteButtons from '../Common/VoteButtons';
import AcceptAnswerButton from '../Common/AcceptAnswerButton';
import TagManager from '../Tags/TagManager';
import AnswerForm from './AnswerForm';
import { formatDate } from '../../utils/dateUtils';
import './QuestionDetail.css';

export default function QuestionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', text: '', picture: null });
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const loadQuestionData = async () => {
    try {
      const questionData = await getQuestionById(id);
      setQuestion(questionData);
      const answersData = await getAnswersForQuestion(id);
      setAnswers(answersData);
    } catch (err) {
      setError('Error loading question');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestionData();
  }, [id]);

  const handleVoteUpdated = async () => {
    try {
      const updatedQuestion = await getQuestionById(id);
      setQuestion(updatedQuestion);
      const updatedAnswers = await getAnswersForQuestion(id);
      setAnswers(updatedAnswers);
    } catch (err) {
    }
  };

  const handleAnswerAccepted = async () => {
    try {
      const updatedAnswers = await getAnswersForQuestion(id);
      setAnswers(updatedAnswers);
    } catch (err) {
    }
  };

  const handleTagsUpdated = async () => {
    try {
      const updatedQuestion = await getQuestionById(id);
      setQuestion(updatedQuestion);
    } catch (err) {
    }
  };

  const handleAnswerAdded = async () => {
    try {
      const updatedAnswers = await getAnswersForQuestion(id);
      setAnswers(updatedAnswers);
    } catch (err) {
    }
  };

  const handleEditQuestion = () => {
    setEditForm({
      title: question.title,
      text: question.text,
      picture: question.picture
    });
    setPreviewImage(question.picture ? `http://localhost:8080/api/upload/image/${question.picture}` : null);
    setIsEditing(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = async () => {
    try {
      let imageUrl = question.picture;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (imageUrl && imageUrl.startsWith('http')) {
          imageUrl = imageUrl.split('/').pop();
        }
      } else if (!editForm.picture && !previewImage) {
        imageUrl = null;
      }

      const updatedQuestion = await updateQuestion(question.id, {
        ...question,
        ...editForm,
        picture: imageUrl
      });
      setQuestion(updatedQuestion);
      setIsEditing(false);
      setPreviewImage(null);
      setImageFile(null);
    } catch (err) {
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({ title: '', text: '', picture: null });
    setPreviewImage(null);
    setImageFile(null);
  };

  const sortedAnswers = [...answers].sort((a, b) => {
    const votesA = a.votes ? a.votes.length : 0;
    const votesB = b.votes ? b.votes.length : 0;
    return votesB - votesA;
    });

  if (isLoading) {
    return (
      <div className="text-center mt-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!question) {
    return (
      <div className="alert alert-info" role="alert">
        Question not found.
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card mb-4">
        <div className="card-body">
          {isEditing ? (
            <div className="edit-question-form">
              <h3>Edit question</h3>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={editForm.text}
                  onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                  className="form-textarea"
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Image</label>
                <div className="image-upload-container">
                  {(previewImage || editForm.picture) && (
                    <div className="image-preview mb-3">
                      <img src={previewImage || `http://localhost:8080/api/upload/image/${editForm.picture}`} alt="Preview" />
                    </div>
                  )}

                  <div className="image-actions d-flex gap-2 align-items-center mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="image-input"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="image-upload-label">
                      <i className="bi bi-cloud-upload"></i>
                      {imageFile ? 'Change image' : 'Upload image'}
                    </label>

                    {(previewImage || editForm.picture) && (
                      <button
                        type="button"
                        className="remove-image-button btn btn-danger"
                        onClick={() => {
                          setEditForm({ ...editForm, picture: null });
                          setPreviewImage(null);
                          setImageFile(null);
                        }}
                      >
                        <i className="bi bi-x-lg"></i>
                        Remove image
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button className="action-button save-button" onClick={handleSaveEdit}>
                  <i className="bi bi-check-lg"></i>
                  Save
                </button>
                <button className="action-button cancel-button" onClick={handleCancelEdit}>
                  <i className="bi bi-x-lg"></i>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
          <div className="row">
            <div className="col-auto">
              <VoteButtons entity={question} type="question" onVoteUpdated={handleVoteUpdated} />
            </div>
            <div className="col">
                <div className="d-flex justify-content-between align-items-start">
              <h2 className="card-title">{question.title}</h2>
                  {user && user.id === question.author.id && (
                    <button 
                      className="action-button edit-button"
                      onClick={handleEditQuestion}
                    >
                      <i className="bi bi-pencil"></i>
                      Edit
                    </button>
                  )}
                </div>
              
              {question.picture && (
                <div className="question-detail-image-container">
                  <img 
                    src={`http://localhost:8080/api/upload/image/${encodeURIComponent(
                      question.picture.includes('/') ? question.picture.split('/').pop() : question.picture
                    )}`}
                    alt={`Image for question: ${question.title}`}
                    className="question-detail-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/800x400?text=Image+unavailable';
                    }}
                  />
                </div>
              )}

              <p className="card-text">{question.text}</p>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="d-flex gap-2">
                  {question.tags?.map(tag => (
                    <span key={tag.id} className="badge">
                      {tag.name}
                    </span>
                  ))}
                </div>
                <div className="text-muted small">
                  <span className="me-2">
                    <i className="bi bi-person me-1"></i>
                    {question.author.username}
                  </span>
                  <span>
                    <i className="bi bi-clock me-1"></i>
                      {formatDate(question.creationDateTime)}
                  </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {user && user.id === question.author.id && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Manage tags</h5>
            <TagManager questionId={question.id} onTagsUpdated={handleTagsUpdated} />
          </div>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Add an answer</h5>
          <AnswerForm questionId={id} onAnswerAdded={handleAnswerAdded} />
        </div>
      </div>

      <div className="answers-section mb-4">
        <h3 className="mb-3">
          Answers ({sortedAnswers.length})
        </h3>
        {sortedAnswers.map(answer => (
          <div key={answer.id} className="card mb-3">
            <div className="card-body">
              <div className="row">
                <div className="col-auto">
                  <VoteButtons entity={answer} type="answer" onVoteUpdated={handleVoteUpdated} />
                </div>
                <div className="col">
                  <p className="card-text">{answer.text}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-muted small">
                      <span className="me-2">
                        <i className="bi bi-person me-1"></i>
                        {answer.author.username}
                      </span>
                      <span>
                        <i className="bi bi-clock me-1"></i>
                        {formatDate(answer.creationDateTime)}
                      </span>
                    </div>
                    <AcceptAnswerButton
                      answer={answer}
                      question={question}
                      onAnswerAccepted={handleAnswerAccepted}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
