import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getQuestionById, updateQuestion, deleteQuestion as deleteQuestionApi } from '../services/questionService';
import { getAnswersForQuestion, updateAnswer, deleteAnswer } from '../services/answerService';
import { uploadImage } from '../services/uploadService';
import VoteButtons from '../components/Common/VoteButtons';
import AcceptAnswerButton from '../components/Common/AcceptAnswerButton';
import TagManager from '../components/Tags/TagManager';
import AnswerForm from '../components/QuestionDetail/AnswerForm';
import { formatDate } from '../utils/dateUtils';
import './AnswerPage.css';

export default function AnswerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedText, setEditedText] = useState('');
  const [editedPicture, setEditedPicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [editingAnswer, setEditingAnswer] = useState(null);
  const [editAnswerText, setEditAnswerText] = useState('');
  const [editAnswerPicture, setEditAnswerPicture] = useState(null);
  const [previewAnswerImage, setPreviewAnswerImage] = useState(null);
  const [answerImageFile, setAnswerImageFile] = useState(null);

  const [showTagManager, setShowTagManager] = useState(false);

  const loadQuestionData = async () => {
    try {
      const questionData = await getQuestionById(id);
      setQuestion(questionData);
      const answersData = await getAnswersForQuestion(id);
      setAnswers(answersData);
      setError(null);
    } catch (err) {
      if (err.response?.status === 404) {
        navigate('/not-found', { replace: true });
        return;
      }
      setError('Error loading question');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestionData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleVoteUpdated = async () => {
    try {
      const updatedQuestion = await getQuestionById(id);
      setQuestion(updatedQuestion);
      const updatedAnswers = await getAnswersForQuestion(id);
      setAnswers(updatedAnswers);
    } catch (err) { }
  };

  const handleAnswerAccepted = async () => {
    try {
      const updatedQuestion = await getQuestionById(id);
      setQuestion(updatedQuestion);
      const updatedAnswers = await getAnswersForQuestion(id);
      setAnswers(updatedAnswers);
    } catch (err) { }
  };

  const handleTagsUpdated = async () => {
    try {
      const updatedQuestion = await getQuestionById(id);
      setQuestion(updatedQuestion);
    } catch (err) { }
  };

  const handleAnswerAdded = async () => {
    try {
      const updatedAnswers = await getAnswersForQuestion(id);
      setAnswers(updatedAnswers);
    } catch (err) { }
  };

  const handleTagClick = (tagName) => {
    navigate(`/?tag=${tagName}`);
  };

  const sortAnswers = (answers) => {
    return [...answers].sort((a, b) => {
      if (a.accepted && !b.accepted) return -1;
      if (!a.accepted && b.accepted) return 1;
      const scoreA = a.votes?.reduce((sum, vote) => sum + vote.value, 0) || 0;
      const scoreB = b.votes?.reduce((sum, vote) => sum + vote.value, 0) || 0;
      if (scoreA !== scoreB) return scoreB - scoreA;
      return new Date(b.creationDateTime) - new Date(a.creationDateTime);
    });
  };

  const isAuthor = user && question && user.id === question.author.id;
  const isModerator = user && user.role === 'MODERATOR';

  const startEditing = () => {
    if (!question) return;
    setEditedTitle(question.title);
    setEditedText(question.text);
    setEditedPicture(question.picture);
    setPreviewImage(question.picture ? buildImageUrl(question.picture) : null);
    setIsEditingQuestion(true);
  };

  const cancelEditing = () => {
    setIsEditingQuestion(false);
    setError(null);
    setImageFile(null);
    setPreviewImage(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveQuestion = async () => {
    try {
      setIsLoading(true);
      let imageUrl = question.picture;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (imageUrl && imageUrl.startsWith('http')) {
          imageUrl = imageUrl.split('/').pop();
        }
      } else if (!editedPicture && !previewImage) {
        imageUrl = null;
      }

      await updateQuestion(question.id, {
        title: editedTitle,
        text: editedText,
        picture: imageUrl
      });
      setIsEditingQuestion(false);
      await loadQuestionData();
    } catch (err) {
      setError('Error updating question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      setIsLoading(true);
      await deleteQuestionApi(question.id);
      navigate('/');
    } catch (err) {
      setError('Error deleting question');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditAnswer = (answer) => {
    setEditingAnswer(answer);
    setEditAnswerText(answer.text);
    setEditAnswerPicture(answer.picture);
    setPreviewAnswerImage(answer.picture ? buildImageUrl(answer.picture) : null);
    setAnswerImageFile(null);
  };

  const cancelEditAnswer = () => {
    setEditingAnswer(null);
    setEditAnswerText('');
    setEditAnswerPicture(null);
    setPreviewAnswerImage(null);
    setAnswerImageFile(null);
  };

  const handleAnswerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAnswerImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewAnswerImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const saveEditAnswer = async () => {
    if (!editingAnswer) return;
    try {
      let imageUrl = editingAnswer.picture;
      if (answerImageFile) {
        imageUrl = await uploadImage(answerImageFile);
        if (imageUrl && imageUrl.startsWith('http')) {
          imageUrl = imageUrl.split('/').pop();
        }
      } else if (!editAnswerPicture && !previewAnswerImage) {
        imageUrl = null;
      }

      const updated = await updateAnswer(editingAnswer.id, {
        text: editAnswerText,
        picture: imageUrl
      });

      setAnswers((prev) => prev.map(a => a.id === updated.id ? updated : a));
      cancelEditAnswer();
    } catch (err) {
      setError('Error updating answer');
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm('Are you sure you want to delete this answer?')) return;
    try {
      await deleteAnswer(answerId);
      setAnswers(prev => prev.filter(a => a.id !== answerId));
    } catch (err) {
      setError('Error deleting answer');
    }
  };

  const buildImageUrl = (picture) => {
    if (!picture) return null;
    if (picture.startsWith('data:') || picture.startsWith('http')) return picture;
    const filename = picture.includes('/') ? picture.split('/').pop() : picture;
    return `http://localhost:8080/api/upload/image/${encodeURIComponent(filename)}?t=${Date.now()}`;
  };

  if (isLoading) {
    return (
      <div className="answer-page">
        <div className="answer-layout">
          <div className="text-center mt-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="answer-page">
        <div className="answer-layout">
          <div className="error-message">
            <i className="bi bi-exclamation-circle"></i>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="answer-page">
        <div className="answer-layout">
          <div className="error-message">
            <i className="bi bi-info-circle"></i>
            Question not found.
          </div>
        </div>
      </div>
    );
  }

  const sortedAnswers = sortAnswers(answers);

  return (
    <div className="answer-page">
      <div className="answer-layout">
        <div className="question-card">
          <div className="question-header">
            <div className="vote-section">
              <VoteButtons entity={question} type="question" onVoteUpdated={handleVoteUpdated} />
            </div>
            <div className="question-content">
              {isEditingQuestion ? (
                <>
                  <input
                    type="text"
                    className="form-control mb-2"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                  />
                  <textarea
                    className="form-control mb-2"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    rows="4"
                  />
                  <div className="mb-2">
                    {(previewImage || editedPicture) && (
                      <div className="image-preview mb-2 position-relative" style={{ maxWidth: '300px' }}>
                        <img src={previewImage || buildImageUrl(editedPicture)} alt="Preview" className="img-fluid rounded" />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 translate-middle p-1 rounded-circle"
                          onClick={() => {
                            setEditedPicture(null);
                            setPreviewImage(null);
                            setImageFile(null);
                          }}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    )}
                    <input type="file" accept="image/*" id="image-upload" className="d-none" onChange={handleImageChange} />
                    <label htmlFor="image-upload" className="btn btn-outline-secondary btn-sm">
                      <i className="bi bi-cloud-upload"></i> {imageFile ? 'Change image' : 'Upload image'}
                    </label>
                  </div>
                  <div className="mb-2">
                    <button className="btn btn-primary me-2" onClick={handleSaveQuestion} disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button className="btn btn-secondary" onClick={cancelEditing} disabled={isLoading}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <h2>{question.title}</h2>
                  {question.picture && (
                    <div className="question-detail-image-container mb-3">
                      <img
                        src={buildImageUrl(question.picture)}
                        alt={question.title}
                        className="question-detail-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/800x400?text=Image+unavailable';
                        }}
                      />
                    </div>
                  )}
                  <p className="question-text">{question.text}</p>
                </>
              )}
              <div className="question-meta">
                <div className="tag-list">
                  {question.tags?.map(tag => (
                    <button key={tag.id} className="tag" onClick={() => handleTagClick(tag.name)}>
                      {tag.name}
                    </button>
                  ))}
                </div>
                <div className="meta-info">
                  <span><i className="bi bi-person"></i> {question.author.username}</span>
                  <span><i className="bi bi-clock"></i> {formatDate(question.creationDateTime)}</span>
                </div>
              </div>

              {(isAuthor || isModerator) && !isEditingQuestion && (
                <div className="mt-3 d-flex gap-2">
                  <button className="btn btn-outline-primary btn-sm" onClick={startEditing}>
                    {isModerator ? 'Edit as moderator' : 'Edit question'}
                  </button>
                  <button className="btn btn-outline-danger btn-sm" onClick={handleDeleteQuestion}>
                    {isModerator ? 'Delete as moderator' : 'Delete question'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {user && user.id === question.author.id && (
          <div className="answer-form-section">
            {!showTagManager ? (
              <button className="btn btn-outline-secondary mb-2" onClick={() => setShowTagManager(true)}>
                Edit tags
              </button>
            ) : (
              <>
                <h3 className="answer-form-header">Manage tags</h3>
                <TagManager questionId={question.id} onTagsUpdated={handleTagsUpdated} />
                <button className="btn btn-link mt-2" onClick={() => setShowTagManager(false)}>
                  Close tag manager
                </button>
              </>
            )}
          </div>
        )}

        <div className="answers-section">
          <h3 className="answers-header">Answers ({sortedAnswers.length})</h3>
          {sortedAnswers.map(answer => (
            <div key={answer.id} className={`answer-card ${answer.accepted ? 'accepted-answer' : ''}`}>
              <div className="question-header">
                <div className="vote-section">
                  <VoteButtons entity={answer} type="answer" onVoteUpdated={handleVoteUpdated} />
                </div>
                <div className="answer-content">
                  {editingAnswer && editingAnswer.id === answer.id ? (
                    <>
                      <textarea
                        className="form-control mb-2"
                        value={editAnswerText}
                        onChange={(e) => setEditAnswerText(e.target.value)}
                        rows="4"
                      />
                      <div className="mb-2">
                        {(previewAnswerImage || editAnswerPicture) && (
                          <div className="image-preview mb-2 position-relative" style={{ maxWidth: '300px' }}>
                            <img src={previewAnswerImage || buildImageUrl(editAnswerPicture)} alt="Preview" className="img-fluid rounded" />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0 translate-middle p-1 rounded-circle"
                              onClick={() => {
                                setEditAnswerPicture(null);
                                setPreviewAnswerImage(null);
                                setAnswerImageFile(null);
                              }}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </div>
                        )}
                        <input type="file" accept="image/*" id={`answer-image-upload-${answer.id}`} className="d-none" onChange={handleAnswerImageChange} />
                        <label htmlFor={`answer-image-upload-${answer.id}`} className="btn btn-outline-secondary btn-sm">
                          <i className="bi bi-cloud-upload"></i> {answerImageFile ? 'Change image' : 'Upload image'}
                        </label>
                      </div>
                      <div className="mb-2 d-flex gap-2">
                        <button className="btn btn-success btn-sm" onClick={saveEditAnswer}>Save</button>
                        <button className="btn btn-secondary btn-sm" onClick={cancelEditAnswer}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>{answer.text}</p>
                      {answer.picture && (
                        <div className="question-detail-image-container mb-3">
                          <img
                            src={buildImageUrl(answer.picture)}
                            alt="Answer attachment"
                            className="question-detail-image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/800x400?text=Image+unavailable';
                            }}
                          />
                        </div>
                      )}
                      <div className="answer-meta">
                        <div className="meta-info">
                          <span><i className="bi bi-person"></i> {answer.author.username}</span>
                          <span><i className="bi bi-clock"></i> {formatDate(answer.creationDateTime)}</span>
                        </div>
                        <AcceptAnswerButton answer={answer} question={question} onAnswerAccepted={handleAnswerAccepted} />
                      </div>
                      {(user && (user.id === answer.author.id || isModerator)) && (
                        <div className="mt-2 d-flex gap-2">
                          <button className="btn btn-outline-primary btn-sm" onClick={() => startEditAnswer(answer)}>
                            Edit answer
                          </button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteAnswer(answer.id)}>
                            Delete answer
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="answer-form-section">
            <h3 className="answer-form-header">Add an answer</h3>
            <AnswerForm questionId={id} onAnswerAdded={handleAnswerAdded} />
          </div>
        </div>
      </div>
    </div>
  );
}