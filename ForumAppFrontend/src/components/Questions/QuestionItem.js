import React from 'react';
import { Link } from 'react-router-dom';
import './QuestionItem.css';

export default function QuestionItem({ question }) {
  return (
    <div className="question-item">
      <Link to={`/questions/${question.id}`}>
        <h3>{question.title}</h3>
      </Link>
      <div className="author-info">
        <span className="author-name">by {question.author.username}</span>
        <span className="author-score" title="User score">
          <i className="bi bi-star-fill text-warning me-1"></i>
          {question.author.score.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
