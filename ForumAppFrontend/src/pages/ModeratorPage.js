import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import { getAllQuestions, deleteQuestion, updateQuestion } from '../services/questionService';
import { uploadImage } from '../services/uploadService';
import { getAllAnswers, deleteAnswer, updateAnswer } from '../services/answerService';
import './ModeratorPage.css';

export default function ModeratorPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', text: '', picture: null });
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [editingAnswer, setEditingAnswer] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (user && user.role === 'MODERATOR') {
      loadUsers();
      loadQuestions();
      loadAnswers();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await userService.getAll();
      setUsers(usersData);
      setError(null);
    } catch (err) {
      setError('Error loading users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      const questionsData = await getAllQuestions();
      setQuestions(questionsData);
    } catch (err) { }
  };

  const loadAnswers = async () => {
    try {
      const answersData = await getAllAnswers();
      setAnswers(answersData);
    } catch (err) { }
  };

  const handleBan = async (id, role) => {
    if (role === 'MODERATOR') {
      setActionMsg('Cannot ban a moderator!');
      setTimeout(() => setActionMsg(null), 3000);
      return;
    }

    try {
      await userService.banUser(id);
      setActionMsg('User banned successfully!');
      await loadUsers();
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err) {
      setActionMsg('Error banning user!');
      setTimeout(() => setActionMsg(null), 3000);
    }
  };

  const handleUnban = async (id) => {
    try {
      await userService.unbanUser(id);
      setActionMsg('User unbanned successfully!');
      setUsers(users => users.map(u => u.id === id ? { ...u, banned: false, isBanned: false } : u));
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err) {
      setActionMsg('Error unbanning user!');
      setTimeout(() => setActionMsg(null), 3000);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await deleteQuestion(id);
      setActionMsg('Question deleted successfully!');
      setQuestions(questions => questions.filter(q => q.id !== id));
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err) {
      setActionMsg('Error deleting question!');
      setTimeout(() => setActionMsg(null), 3000);
    }
  };

  const handleDeleteAnswer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this answer?')) return;
    try {
      await deleteAnswer(id);
      setAnswers(answers => answers.filter(a => a.id !== id));
      setActionMsg('Answer deleted successfully!');
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err) {
      setActionMsg('Error deleting answer!');
      setTimeout(() => setActionMsg(null), 3000);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setEditForm({
      title: question.title,
      text: question.text,
      picture: question.picture
    });
    setPreviewImage(question.picture ? `http://localhost:8080/api/upload/image/${question.picture}` : null);
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

  const handleSaveEdit = async () => {
    try {
      let imageUrl = editingQuestion.picture;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (imageUrl && imageUrl.startsWith('http')) {
          imageUrl = imageUrl.split('/').pop();
        }
      }

      const updatedQuestion = await updateQuestion(editingQuestion.id, {
        ...editingQuestion,
        ...editForm,
        picture: imageUrl
      });
      setQuestions(questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
      setEditingQuestion(null);
      setPreviewImage(null);
      setImageFile(null);
      setActionMsg('Question updated successfully!');
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err) {
      setActionMsg('Error updating question!');
      setTimeout(() => setActionMsg(null), 3000);
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setEditForm({ title: '', text: '', picture: null });
    setPreviewImage(null);
    setImageFile(null);
  };

  const handleEditAnswer = (answer) => {
    setEditingAnswer(answer);
    setEditText(answer.text);
  };

  const handleSaveEditAnswer = async () => {
    if (!editingAnswer) return;
    try {
      const updatedAnswer = await updateAnswer(editingAnswer.id, { text: editText });
      setAnswers(answers.map(a => a.id === updatedAnswer.id ? updatedAnswer : a));
      setEditingAnswer(null);
      setEditText('');
    } catch (error) { }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredQuestions = questions.filter(question =>
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAnswers = answers.filter(answer =>
    answer.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || user.role !== 'MODERATOR') {
    return <div className="moderator-error">Access denied. Only moderators can access this page.</div>;
  }

  return (
    <div className="moderator-page">
      <div className="moderator-header">
        <h1>Moderator Panel</h1>
        <p>Manage users and forum content</p>
      </div>

      <div className="moderator-tabs">
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <i className="bi bi-people-fill"></i>
          Users
        </button>
        <button
          className={`tab-button ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          <i className="bi bi-question-circle-fill"></i>
          Questions
        </button>
        <button
          className={`tab-button ${activeTab === 'answers' ? 'active' : ''}`}
          onClick={() => setActiveTab('answers')}
        >
          <i className="bi bi-chat-dots"></i>
          Answers
        </button>
      </div>

      <div className="moderator-section">
        <div className="section-header">
          <h2>{activeTab === 'users' ? 'Users' : activeTab === 'questions' ? 'Questions' : 'Answers'}</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder={`Search ${activeTab === 'users' ? 'by name or email...' : activeTab === 'questions' ? 'by title or content...' : 'by text...'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Loading...</span>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : activeTab === 'users' ? (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => {
                  const banned = u.isBanned !== undefined ? u.isBanned : u.banned;
                  return (
                    <tr key={u.id} className={banned ? 'banned-user' : ''}>
                      <td>{u.id}</td>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.role.toLowerCase()}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${banned ? 'banned' : 'active'}`}>
                          {banned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td>{u.score?.toFixed(1) || '0.0'}</td>
                      <td>
                        {banned ? (
                          <button
                            className="action-button unban-button"
                            onClick={() => handleUnban(u.id)}
                          >
                            <i className="bi bi-unlock"></i>
                            Unban
                          </button>
                        ) : (
                          <button
                            className="action-button ban-button"
                            onClick={() => handleBan(u.id, u.role)}
                          >
                            <i className="bi bi-lock"></i>
                            Ban
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'questions' ? (
          <div className="questions-table-container">
            {editingQuestion ? (
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
                    {previewImage && (
                      <div className="image-preview">
                        <img src={previewImage} alt="Preview" />
                        <button
                          className="remove-image-button"
                          onClick={() => {
                            setEditForm({ ...editForm, picture: null });
                            setPreviewImage(null);
                          }}
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    )}
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
              <table className="questions-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.map(q => (
                    <tr key={q.id}>
                      <td>{q.id}</td>
                      <td>{q.title}</td>
                      <td>{q.author?.username}</td>
                      <td>{new Date(q.creationDateTime).toLocaleString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-button edit-button"
                            onClick={() => handleEditQuestion(q)}
                          >
                            <i className="bi bi-pencil"></i>
                            Edit
                          </button>
                          <button
                            className="action-button delete-button"
                            onClick={() => handleDeleteQuestion(q.id)}
                          >
                            <i className="bi bi-trash"></i>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="answers-table-container">
            <table className="answers-table">
              <thead>
                <tr>
                  <th>Answer</th>
                  <th>Author</th>
                  <th>Question</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnswers.map(a => (
                  <tr key={a.id}>
                    <td className="answer-text">{a.text}</td>
                    <td>{a.author?.username}</td>
                    <td>
                      <a href={`/questions/${a.question?.id}`} className="question-link">
                        {a.question?.title}
                      </a>
                    </td>
                    <td>{new Date(a.creationDateTime).toLocaleString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-button edit-button"
                          onClick={() => handleEditAnswer(a)}
                        >
                          <i className="bi bi-pencil"></i>
                          Edit
                        </button>
                        <button
                          className="action-button delete-button"
                          onClick={() => handleDeleteAnswer(a.id)}
                        >
                          <i className="bi bi-trash"></i>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingAnswer && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Answer</h2>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows="6"
            />
            <div className="modal-buttons">
              <button onClick={handleSaveEditAnswer}>Save</button>
              <button onClick={() => {
                setEditingAnswer(null);
                setEditText('');
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {actionMsg && (
        <div className={`action-message ${actionMsg.includes('success') ? 'success' : 'error'}`}>
          {actionMsg}
        </div>
      )}
    </div>
  );
}