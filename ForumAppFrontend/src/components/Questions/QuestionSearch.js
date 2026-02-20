import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getAllQuestions, searchQuestions, filterQuestionsByTag, getQuestionsByUser } from '../../services/questionService';
import { getAllTags } from '../../services/tagService';
import QuestionList from './QuestionList';
import './QuestionSearch.css';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';

const PAGE_SIZE = 10;
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'votes', label: 'Most voted' },
  { value: 'unanswered', label: 'Unanswered' }
];

function voteSum(q) {
  return (q.votes || []).reduce((s, v) => s + (v?.value ?? 0), 0);
}

export default function QuestionSearch({ initialTag = null }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [questions, setQuestions] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [popularTags, setPopularTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTagLoading, setIsTagLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tagsError, setTagsError] = useState(null);
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    loadInitialData();
    userService.getAll().then(setUsers).catch(() => setUsers([]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialTag) {
      setSelectedTag(initialTag);
      setSearchQuery('');
      setSelectedUser(null);
      setIsLoading(true);
      setError(null);
      filterQuestionsByTag(initialTag)
        .then(setQuestions)
        .catch(() => setError(`Error filtering by tag "${initialTag}"`))
        .finally(() => setIsLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTag]);

  const debounceRef = useRef(null);
  useEffect(() => {
    if (!searchQuery.trim()) return;
    debounceRef.current = setTimeout(() => {
      setIsLoading(true);
      setError(null);
      setSelectedTag(null);
      setSelectedUser(null);
      searchQuestions(searchQuery)
        .then(setQuestions)
        .catch(() => setError('Error searching questions'))
        .finally(() => setIsLoading(false));
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setQuestions(await getAllQuestions());
      await loadPopularTags();
    } catch {
      setError('Error loading initial data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPopularTags = async () => {
    try {
      setTagsError(null);
      setPopularTags(await getAllTags());
    } catch {
      setTagsError('Error loading tags');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (!searchQuery.trim()) {
      await loadInitialData();
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      setSelectedTag(null);
      setSelectedUser(null);
      setQuestions(await searchQuestions(searchQuery));
    } catch {
      setError('Error searching questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagClick = async (tag) => {
    try {
      setIsTagLoading(true);
      setError(null);
      
      if (selectedTag === tag.name) {
        setSelectedTag(null);
        setQuestions(await getAllQuestions());
      } else {
        setSelectedTag(tag.name);
        setSearchQuery('');
        setQuestions(await filterQuestionsByTag(tag.name));
      }
    } catch {
      setError(`Error filtering by tag "${tag.name}"`);
    } finally {
      setIsTagLoading(false);
    }
  };

  const handleClearFilters = async () => {
    setSearchQuery('');
    setSelectedTag(null);
    await loadInitialData();
  };

  const handleUserChange = async (e) => {
    const userId = e.target.value;
    setSelectedUser(userId || null);
    setSelectedTag(null);
    setSearchQuery('');
    if (!userId) {
      await loadInitialData();
      return;
    }
    setIsLoading(true);
    try {
      const questions = await getQuestionsByUser(userId);
      setQuestions(questions);
    } catch (err) {
      setError('Error filtering by user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMyQuestions = async () => {
    if (!user) return;
    setSelectedUser(user.id);
    setSelectedTag(null);
    setSearchQuery('');
    setIsLoading(true);
    try {
      const questions = await getQuestionsByUser(user.id);
      setQuestions(questions);
    } catch (err) {
      setError('Error filtering by your questions');
    } finally {
      setIsLoading(false);
    }
  };

  const sortedAndFiltered = useMemo(() => {
    let list = [...(questions || [])];
    if (sortBy === 'unanswered') {
      list = list.filter((q) => !q.acceptedAnswerId);
    }
    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.creationDateTime) - new Date(a.creationDateTime));
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.creationDateTime) - new Date(b.creationDateTime));
    } else if (sortBy === 'votes') {
      list.sort((a, b) => voteSum(b) - voteSum(a));
    }
    return list;
  }, [questions, sortBy]);

  const totalItems = sortedAndFiltered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const pageIndex = Math.min(currentPage, totalPages - 1);
  const paginatedQuestions = useMemo(() => {
    const start = pageIndex * PAGE_SIZE;
    return sortedAndFiltered.slice(start, start + PAGE_SIZE);
  }, [sortedAndFiltered, pageIndex]);

  useEffect(() => {
    setCurrentPage(0);
  }, [questions, sortBy]);

  return (
    <div className="question-search-container">
      <header className="questions-page-header">
        <h1 className="questions-page-title">All Questions</h1>
        <p className="questions-page-subtitle">
          {selectedTag ? `Tag: ${selectedTag}` : 'Browse and search community questions'}
        </p>
      </header>

      <div className="search-toolbar">
        <form onSubmit={handleSearch} className="search-form-inline">
          <input
            type="text"
            className="search-input"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn-search" aria-label="Search">
            <i className="bi bi-search"></i>
          </button>
        </form>
        <div className="filter-bar">
          <select className="sort-filter" value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort">
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select className="user-filter" value={selectedUser || ''} onChange={handleUserChange} aria-label="User">
            <option value="">All users</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.username}</option>
            ))}
          </select>
          {user && (
            <button
              type="button"
              className={`btn-my-questions ${String(selectedUser) === String(user?.id) ? 'active' : ''}`}
              onClick={handleMyQuestions}
            >
              My questions
            </button>
          )}
          {(searchQuery || selectedTag) && (
            <button type="button" className="btn-reset" onClick={handleClearFilters}>
              Reset
            </button>
          )}
        </div>
      </div>

      {!tagsError && popularTags.length > 0 && (
        <div className="tags-row">
          <span className="tags-label">Tags</span>
          <div className="tags-list">
            {popularTags.map(tag => (
              <button
                key={tag.id}
                type="button"
                className={`tag-button ${selectedTag === tag.name ? 'active' : ''}`}
                onClick={() => handleTagClick(tag)}
                disabled={isTagLoading}
              >
                {tag.name}
                {selectedTag === tag.name && isTagLoading && (
                  <span className="tag-spinner" role="status" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <i className="bi bi-exclamation-triangle-fill"></i>
          {error}
          <button type="button" className="error-close" onClick={() => setError(null)} aria-label="Close">
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {tagsError && (
        <div className="warning-message">
          <i className="bi bi-exclamation-circle-fill"></i>
          {tagsError}
          <button type="button" className="warning-close" onClick={() => setTagsError(null)} aria-label="Close">
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      <QuestionList
        questions={paginatedQuestions}
        totalItems={totalItems}
        currentPage={pageIndex}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
} 