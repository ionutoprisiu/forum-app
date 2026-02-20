import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getQuestionsByUser } from '../services/questionService';
import { getAllAnswers } from '../services/answerService';
import userService from '../services/userService';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateUserProfile, logoutUser } = useAuth();
  const toast = useToast();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalAnswers: 0,
    totalVotes: 0,
    acceptedAnswers: 0
  });

  const [editForm, setEditForm] = useState({ username: '', email: '', phoneNumber: '', newPassword: '', confirmPassword: '' });
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editLoaded, setEditLoaded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    setIsDeleting(true);
    setEditError(null);
    try {
      await userService.delete(user.id);
      toast.success('Account deleted');
      await logoutUser();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete account';
      setEditError(msg);
      toast.error(msg);
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'edit' && user && !editLoaded) {
      userService.getById(user.id)
        .then((profile) => {
          setEditForm({
            username: profile.username || '',
            email: profile.email || '',
            phoneNumber: profile.phoneNumber || '',
            newPassword: '',
            confirmPassword: ''
          });
          setEditLoaded(true);
        })
        .catch(() => setEditError('Could not load profile'));
    }
  }, [activeTab, user, editLoaded]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    setEditError(null);
    setEditSuccess(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError(null);
    setEditSuccess(false);
    if (editForm.username.trim().length < 3) {
      setEditError('Username must be at least 3 characters');
      return;
    }
    if (editForm.newPassword && editForm.newPassword.length < 8) {
      setEditError('New password must be at least 8 characters');
      return;
    }
    if (editForm.newPassword !== editForm.confirmPassword) {
      setEditError('New password and confirmation do not match');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        username: editForm.username.trim(),
        email: editForm.email.trim(),
        phoneNumber: editForm.phoneNumber.trim() || null,
        password: editForm.newPassword || ''
      };
      const updated = await userService.update(user.id, payload);
      updateUserProfile(updated);
      setEditSuccess(true);
      setEditForm((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }));
      setTimeout(() => setEditSuccess(false), 3000);
      toast.success('Profile updated successfully');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile';
      setEditError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        const [userQuestions, allAnswers] = await Promise.all([
          getQuestionsByUser(user.id),
          getAllAnswers()
        ]);

        setQuestions(userQuestions);
        const userAnswers = allAnswers.filter(answer => answer.author.id === user.id);
        setAnswers(userAnswers);

        const totalVotes = [
          ...userQuestions.map(q => q.votes || []),
          ...userAnswers.map(a => a.votes || [])
        ].flat().reduce((sum, vote) => sum + vote.value, 0);

        const acceptedAnswers = userAnswers.filter(a => a.accepted).length;

        setStats({
          totalQuestions: userQuestions.length,
          totalAnswers: userAnswers.length,
          totalVotes,
          acceptedAnswers
        });
      } catch (err) {
        setError('Error loading user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-layout">
          <div className="profile-card">
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              You must be logged in to view your profile.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-layout">
          <div className="profile-card">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-layout">
          <div className="profile-card">
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-layout">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <i className="bi bi-person-circle"></i>
            </div>
            <div className="profile-info">
              <h2>{user.username}
                {user.role === 'MODERATOR' && (
                  <span style={{
                    background: '#ff6b00',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '0.2em 0.8em',
                    fontSize: '1rem',
                    marginLeft: '0.7em',
                    verticalAlign: 'middle',
                    fontWeight: 700
                  }}>MODERATOR</span>
                )}
              </h2>
              <p className="user-email">
                <i className="bi bi-envelope"></i> {user.email}
              </p>
              <div className="user-stats">
                <div className="user-score" title="Your current score">
                  <i className="bi bi-star-fill text-warning"></i>
                  <span>{(user.score || 0).toFixed(1)} points</span>
                </div>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <i className="bi bi-question-circle"></i>
              <h3>{stats.totalQuestions}</h3>
              <p>Questions</p>
            </div>
            <div className="stat-card">
              <i className="bi bi-chat-square-text"></i>
              <h3>{stats.totalAnswers}</h3>
              <p>Answers</p>
            </div>
            <div className="stat-card">
              <i className="bi bi-hand-thumbs-up"></i>
              <h3>{stats.totalVotes}</h3>
              <p>Votes received</p>
            </div>
            <div className="stat-card">
              <i className="bi bi-check-circle"></i>
              <h3>{stats.acceptedAnswers}</h3>
              <p>Accepted answers</p>
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-house"></i> Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            <i className="bi bi-question-circle"></i> My questions
          </button>
          <button
            className={`tab-button ${activeTab === 'answers' ? 'active' : ''}`}
            onClick={() => setActiveTab('answers')}
          >
            <i className="bi bi-chat-square-text"></i> My answers
          </button>
          <button
            className={`tab-button ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => { setActiveTab('edit'); setEditLoaded(false); }}
          >
            <i className="bi bi-pencil-square"></i> Edit profile
          </button>
        </div>

        <div className="content-sections">
          {activeTab === 'overview' && (
            <div className="content-section">
              <div className="activity-summary">
                <h3>Recent activity</h3>
                <div className="activity-timeline">
                  {[...questions, ...answers]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5)
                    .map(item => (
                      <div key={item.id} className="activity-item">
                        <div className="activity-icon">
                          {item.title ? (
                            <i className="bi bi-question-circle"></i>
                          ) : (
                            <i className="bi bi-chat-square-text"></i>
                          )}
                        </div>
                        <div className="activity-content">
                          <p>
                            {item.title ? 'You added a question' : 'You answered a question'}
                          </p>
                          <small>{formatDate(item.createdAt)}</small>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="content-section">
              <div className="section-header">
                <h3>My questions</h3>
                <Link to="/ask" className="add-question-btn">
                  <i className="bi bi-plus-lg"></i>
                  Add new question
                </Link>
              </div>
              {questions.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-question-circle"></i>
                  <p>You haven't added any questions yet.</p>
                  <Link to="/ask" className="btn-primary">
                    Add your first question
                  </Link>
                </div>
              ) : (
                <div className="question-list">
                  {questions.map(question => (
                    <Link
                      key={question.id}
                      to={`/questions/${question.id}`}
                      className="question-item"
                    >
                      <div className="item-header">
                        <h5 className="item-title">{question.title}</h5>
                        <small className="item-date">
                          {formatDate(question.createdAt)}
                        </small>
                      </div>
                      <p className="item-content">
                        {question.text.length > 100
                          ? `${question.text.substring(0, 100)}...`
                          : question.text}
                      </p>
                      <div className="item-footer">
                        <div className="tag-list">
                          {question.questionTags?.map(qt => (
                            <span key={qt.tag.id} className="tag">
                              {qt.tag.name}
                            </span>
                          ))}
                        </div>
                        <div className="item-stats">
                          <span>
                            <i className="bi bi-chat"></i>
                            {question.answers?.length || 0} answers
                          </span>
                          <span>
                            <i className="bi bi-hand-thumbs-up"></i>
                            {question.votes?.reduce((sum, vote) => sum + vote.value, 0) || 0} votes
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="content-section">
              <h3>Edit profile</h3>
              <form onSubmit={handleEditSubmit} className="profile-edit-form">
                <div className="form-group">
                  <label htmlFor="edit-username">Username</label>
                  <input
                    id="edit-username"
                    name="username"
                    type="text"
                    value={editForm.username}
                    onChange={handleEditChange}
                    required
                    minLength={3}
                    disabled={isSaving}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-email">Email</label>
                  <input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    required
                    disabled={isSaving}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-phone">Phone number</label>
                  <input
                    id="edit-phone"
                    name="phoneNumber"
                    type="tel"
                    value={editForm.phoneNumber}
                    onChange={handleEditChange}
                    disabled={isSaving}
                    placeholder="e.g. +40712345678"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-new-password">New password <span className="text-muted">(leave empty to keep current)</span></label>
                  <input
                    id="edit-new-password"
                    name="newPassword"
                    type="password"
                    value={editForm.newPassword}
                    onChange={handleEditChange}
                    disabled={isSaving}
                    minLength={8}
                    placeholder="••••••••"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-confirm-password">Confirm new password</label>
                  <input
                    id="edit-confirm-password"
                    name="confirmPassword"
                    type="password"
                    value={editForm.confirmPassword}
                    onChange={handleEditChange}
                    disabled={isSaving}
                    placeholder="••••••••"
                  />
                </div>
                {editError && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {editError}
                  </div>
                )}
                {editSuccess && (
                  <div className="alert alert-success" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    Profile updated successfully.
                  </div>
                )}
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
                <div className="profile-delete-section">
                  <h4>Danger zone</h4>
                  <p>Once you delete your account, there is no going back.</p>
                  <button
                    type="button"
                    className="btn-delete-account"
                    onClick={handleDeleteAccount}
                    disabled={isSaving || isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete account'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'answers' && (
            <div className="content-section">
              <h3>My answers</h3>
              {answers.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-chat-square-text"></i>
                  <p>You haven't answered any questions yet.</p>
                  <Link to="/" className="btn-primary">
                    Explore questions
                  </Link>
                </div>
              ) : (
                <div className="answer-list">
                  {answers.map(answer => (
                    <Link
                      key={answer.id}
                      to={`/questions/${answer.question?.id || ''}`}
                      className={`answer-item ${!answer.question ? 'disabled' : ''}`}
                    >
                      <div className="item-header">
                        <h5 className="item-title">
                          {answer.question?.title || 'Question unavailable'}
                        </h5>
                        <small className="item-date">
                          {formatDate(answer.createdAt)}
                        </small>
                      </div>
                      <p className="item-content">
                        {answer.text.length > 100
                          ? `${answer.text.substring(0, 100)}...`
                          : answer.text}
                      </p>
                      <div className="item-footer">
                        {answer.accepted && (
                          <span className="badge-accepted">
                            <i className="bi bi-check-circle"></i>
                            Accepted answer
                          </span>
                        )}
                        <div className="item-stats">
                          <span>
                            <i className="bi bi-hand-thumbs-up"></i>
                            {answer.votes?.reduce((sum, vote) => sum + vote.value, 0) || 0} votes
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
