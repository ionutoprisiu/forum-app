import React from 'react';
import { Link } from 'react-router-dom';
import './QuestionList.css';

function voteSum(q) {
  return (q.votes || []).reduce((s, v) => s + (v?.value ?? 0), 0);
}

function answerCount(q) {
  return (q.answers || []).length;
}

export default function QuestionList({
  questions,
  isLoading,
  error,
  totalItems = 0,
  currentPage = 0,
  totalPages = 1,
  pageSize = 10,
  onPageChange
}) {
  if (isLoading) {
    return (
      <div className="questions-list-wrapper">
        <div className="questions-loading-skeleton">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-line skeleton-title" />
              <div className="skeleton-line skeleton-text" />
              <div className="skeleton-line skeleton-text short" />
              <div className="skeleton-line skeleton-meta" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="questions-error">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <p>{error}</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="questions-empty">
        <i className="bi bi-chat-square-text"></i>
        <p>No questions found.</p>
        <small>Try adjusting your filters or add a new question.</small>
      </div>
    );
  }

  return (
    <div className="questions-list-wrapper">
      {totalItems > 0 && (
        <p className="questions-list-meta">
          Showing {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalItems)} of {totalItems}
        </p>
      )}
      <div className="questions-list">
        {questions.map(question => (
          <article key={question.id} className="question-row">
            <div className="question-stats">
              <div className="stat-item">
                <span className="stat-value">{voteSum(question)}</span>
                <span className="stat-label">votes</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{answerCount(question)}</span>
                <span className="stat-label">answers</span>
              </div>
              {question.acceptedAnswerId && (
                <div className="stat-item stat-accepted" title="Has accepted answer">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
              )}
            </div>
            <Link to={`/questions/${question.id}`} className="question-body">
              <h3 className="question-title">{question.title}</h3>
              <p className="question-excerpt">
                {question.text.length > 180 ? `${question.text.substring(0, 180).trim()}...` : question.text}
              </p>
              <div className="question-footer">
                <div className="question-tags">
                  {question.questionTags?.map(qt => (
                    <span key={qt.id} className="question-tag">{qt.tag.name}</span>
                  ))}
                </div>
                <div className="question-meta">
                  <span className="meta-author">{question.author?.username}</span>
                  <span className="meta-date">{new Date(question.creationDateTime).toLocaleDateString('en-US')}</span>
                  <span className={`question-status status-${(question.status || '').toLowerCase()}`}>
                    {question.status === 'RECEIVED' ? 'Open' :
                      question.status === 'IN_PROGRESS' ? 'Answered' :
                        question.status === 'SOLVED' ? 'Solved' : question.status}
                  </span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
      {totalPages > 1 && onPageChange && (
        <nav className="questions-pagination" aria-label="Questions pagination">
          <button
            type="button"
            className="pagination-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 0}
            aria-label="Previous page"
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <span className="pagination-info">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            type="button"
            className="pagination-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            aria-label="Next page"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </nav>
      )}
    </div>
  );
}