import React from 'react';
import { Link } from 'react-router-dom';
import QuestionForm from '../components/Questions/QuestionForm';
import './NewQuestionPage.css';

export default function NewQuestionPage() {
  return (
    <div className="ask-question-page">
      <div className="ask-question-header">
        <Link to="/" className="back-link">
          <i className="bi bi-arrow-left"></i>
          Back to questions
        </Link>
        <h1>Ask a question</h1>
        <p className="ask-question-intro">
          Share your question with the community. Be clear and add relevant tags so others can find and answer it.
        </p>
      </div>
      <QuestionForm />
    </div>
  );
}
