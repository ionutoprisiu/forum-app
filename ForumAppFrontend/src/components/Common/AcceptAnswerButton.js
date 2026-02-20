import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { acceptAnswer } from '../../services/answerService';

export default function AcceptAnswerButton({ answer, question, onAnswerAccepted }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAccept = async () => {
    if (!user) {
      setError('You must be logged in to accept an answer');
      return;
    }

    if (question.author.id !== user.id) {
      setError('Only the question author can accept an answer');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await acceptAnswer(question.id, answer.id, user.id);
      if (onAnswerAccepted) {
        onAnswerAccepted();
      }
    } catch (err) {
      setError(err.message || 'Error accepting answer');
    } finally {
      setIsLoading(false);
    }
  };

  const isQuestionAuthor = user && question.author.id === user.id;
  const isAccepted = answer.accepted;

  return (
    <div>
      <button
        className={`btn btn-sm ${isAccepted ? 'btn-success' : 'btn-outline-success'}`}
        onClick={handleAccept}
        disabled={isLoading || !isQuestionAuthor || isAccepted}
        title={isAccepted ? "Accepted answer" : "Accept answer"}
      >
        <i className={`bi ${isAccepted ? 'bi-check-circle-fill' : 'bi-check-circle'} me-1`}></i>
        {isAccepted ? 'Accepted' : 'Accept'}
      </button>

      {error && (
        <div className="text-danger small mt-2">
          {error}
        </div>
      )}
    </div>
  );
} 