import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { voteQuestion, voteAnswer } from '../../services/votingService';
import { reloadQuestionWithVotes } from '../../services/questionService';
import './VoteButtons.css';

export default function VoteButtons({ entity, type, onVoteUpdated }) {
  const { user } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localVotes, setLocalVotes] = useState([]);
  const [userVote, setUserVote] = useState(0);

  useEffect(() => {
    const loadVotes = async () => {
      if (!entity || !user) return;
      try {
        setLocalVotes(entity.votes || []);
        if (entity.votes) {
          const currentUserVote = entity.votes.find(v => v?.voter?.id === user.id);
          setUserVote(currentUserVote ? currentUserVote.value : 0);
        }
      } catch (err) {
        setError('Error loading votes');
      }
    };

    loadVotes();
  }, [entity, user]);

  const calculateTotalVotes = () => {
    if (!localVotes || !Array.isArray(localVotes)) return 0;
    return localVotes.reduce((total, vote) => total + (vote.value || 0), 0);
  };

  const handleVote = async (voteValue) => {
    if (!user) {
      setError('You must be logged in to vote');
      return;
    }

    if (!entity) {
      setError('Error: Entity does not exist');
      return;
    }

    if (!entity.id) {
      setError('Error: Entity ID is missing');
      return;
    }

    if (entity.author?.id === user.id) {
      setError('You cannot vote for your own question/answer');
      return;
    }

    const currentVotes = localVotes || [];
    const existingVote = currentVotes.find(v => v?.voter?.id === user.id);
    if (existingVote) {
      setError('You have already voted for this ' + (type === 'question' ? 'question' : 'answer'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = type === 'question' 
        ? await voteQuestion(entity.id, user.id, voteValue)
        : await voteAnswer(entity.id, user.id, voteValue);

      if (response) {
        if (type === 'question') {
          const updatedQuestion = await reloadQuestionWithVotes(entity.id);
          if (updatedQuestion) {
            setLocalVotes(updatedQuestion.votes || []);
            const newUserVote = updatedQuestion.votes?.find(v => v?.voter?.id === user.id);
            setUserVote(newUserVote ? newUserVote.value : 0);
            if (onVoteUpdated) {
              onVoteUpdated(updatedQuestion);
            }
            toast.success('Vote recorded');
          }
        } else {
          setLocalVotes(prev => [...prev, { voter: { id: user.id }, value: voteValue }]);
          setUserVote(voteValue);
          if (onVoteUpdated) {
            onVoteUpdated();
          }
          toast.success('Vote recorded');
        }
      }
    } catch (err) {
      const msg = err.message || 'Error voting. Please try again.';
      setError(msg);
      toast.error(msg);
      if (entity?.votes) {
        setLocalVotes(entity.votes);
        const userVote = entity.votes.find(v => v?.voter?.id === user.id);
        setUserVote(userVote ? userVote.value : 0);
      } else {
        setLocalVotes([]);
        setUserVote(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="vote-section">
      <button
        className={`vote-button ${userVote === 1 ? 'active' : ''}`}
        onClick={() => !isLoading && handleVote(1)}
        disabled={isLoading}
        title={userVote === 1 ? 'Your positive vote' : 'Vote up'}
      >
        <i className="bi bi-arrow-up-circle"></i>
      </button>
      
      <span className={`vote-count ${calculateTotalVotes() > 0 ? 'positive' : calculateTotalVotes() < 0 ? 'negative' : 'zero'}`}>
        {calculateTotalVotes()}
      </span>
      
      <button
        className={`vote-button ${userVote === -1 ? 'active' : ''}`}
        onClick={() => !isLoading && handleVote(-1)}
        disabled={isLoading}
        title={userVote === -1 ? 'Your negative vote' : 'Vote down'}
      >
        <i className="bi bi-arrow-down-circle"></i>
      </button>

      {error && (
        <div className="error-message" style={{
          color: '#ff4444',
          fontSize: '0.9rem',
          marginTop: '0.5rem',
          textAlign: 'center',
          maxWidth: '200px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
} 