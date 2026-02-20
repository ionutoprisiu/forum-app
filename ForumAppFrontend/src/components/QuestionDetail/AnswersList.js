import React, { useState, useEffect, useCallback } from 'react';
import { getAnswersForQuestion } from '../../services/answerService';
import AnswerItem from './AnswerItem';

export default function AnswersList({ questionId }) {
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnswers = useCallback(async () => {
    try {
      const data = await getAnswersForQuestion(questionId);
      setAnswers(data);
    } catch (err) {
      setError('Error loading answers');
    } finally {
      setIsLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    loadAnswers();
  }, [loadAnswers]);

  if (isLoading) {
    return <div>Loading answers...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (answers.length === 0) {
    return <div className="text-muted">No answers yet.</div>;
  }

  return (
    <div className="mt-4">
      <h3>Answers ({answers.length})</h3>
      {answers.map(answer => (
        <AnswerItem 
          key={answer.id} 
          answer={answer} 
          onAnswerUpdated={loadAnswers}
        />
      ))}
    </div>
  );
}
