package com.example.ForumAppBackend.service;

import com.example.ForumAppBackend.entity.*;
import com.example.ForumAppBackend.repository.QuestionVoteRepository;
import com.example.ForumAppBackend.repository.AnswerVoteRepository;
import com.example.ForumAppBackend.repository.QuestionRepository;
import com.example.ForumAppBackend.repository.AnswerRepository;
import com.example.ForumAppBackend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VoteService {
    private final QuestionVoteRepository questionVoteRepository;
    private final AnswerVoteRepository answerVoteRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final UserRepository userRepository;

    // Score constants according to requirements
    private static final double QUESTION_UPVOTE_POINTS = 2.5;
    private static final double QUESTION_DOWNVOTE_POINTS = -1.5;
    private static final double ANSWER_UPVOTE_POINTS = 5.0;
    private static final double ANSWER_DOWNVOTE_POINTS = -2.5;
    private static final double DOWNVOTE_PENALTY = -1.5;

    public VoteService(
            QuestionVoteRepository questionVoteRepository,
            AnswerVoteRepository answerVoteRepository,
            QuestionRepository questionRepository,
            AnswerRepository answerRepository,
            UserRepository userRepository) {
        this.questionVoteRepository = questionVoteRepository;
        this.answerVoteRepository = answerVoteRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public QuestionVote voteQuestion(Long questionId, Long voterId, int value) {
        if (value != 1 && value != -1) {
            throw new IllegalArgumentException("Vote value must be 1 or -1");
        }

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));
        User voter = userRepository.findById(voterId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (question.getAuthor().getId().equals(voterId)) {
            throw new IllegalArgumentException("Cannot vote on your own question");
        }

        QuestionVote existingVote = questionVoteRepository.findByQuestionIdAndVoterId(questionId, voterId)
                .orElse(null);

        // Update author's score
        User author = question.getAuthor();
        if (existingVote != null) {
            if (existingVote.getValue() == value) {
                // If voting the same way, remove the vote and revert score
                double scoreChange = -calculateQuestionScoreChange(existingVote.getValue());
                author.setScore(author.getScore() + scoreChange);
                userRepository.save(author);
                questionVoteRepository.delete(existingVote);
                return null;
            } else {
                // If voting differently, update the vote and adjust score
                double oldScoreChange = -calculateQuestionScoreChange(existingVote.getValue());
                double newScoreChange = calculateQuestionScoreChange(value);
                author.setScore(author.getScore() + oldScoreChange + newScoreChange);
                userRepository.save(author);
                existingVote.setValue(value);
                return questionVoteRepository.save(existingVote);
            }
        } else {
            // Create new vote
            QuestionVote newVote = new QuestionVote();
            newVote.setQuestion(question);
            newVote.setVoter(voter);
            newVote.setValue(value);

            // Update scores
            double authorScoreChange = calculateQuestionScoreChange(value);
            author.setScore(author.getScore() + authorScoreChange);

            // Apply downvote penalty to voter
            if (value == -1) {
                voter.setScore(voter.getScore() + DOWNVOTE_PENALTY);
                userRepository.save(voter);
            }

            userRepository.save(author);
            return questionVoteRepository.save(newVote);
        }
    }

    @Transactional
    public AnswerVote voteAnswer(Long answerId, Long voterId, int value) {
        if (value != 1 && value != -1) {
            throw new IllegalArgumentException("Vote value must be 1 or -1");
        }

        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new IllegalArgumentException("Answer not found"));
        User voter = userRepository.findById(voterId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (answer.getAuthor().getId().equals(voterId)) {
            throw new IllegalArgumentException("Cannot vote on your own answer");
        }

        AnswerVote existingVote = answerVoteRepository.findByAnswerIdAndVoterId(answerId, voterId)
                .orElse(null);

        // Update author's score
        User author = answer.getAuthor();
        if (existingVote != null) {
            if (existingVote.getValue() == value) {
                // If voting the same way, remove the vote and revert score
                double scoreChange = -calculateAnswerScoreChange(existingVote.getValue());
                author.setScore(author.getScore() + scoreChange);
                userRepository.save(author);
                answerVoteRepository.delete(existingVote);
                return null;
            } else {
                // If voting differently, update the vote and adjust score
                double oldScoreChange = -calculateAnswerScoreChange(existingVote.getValue());
                double newScoreChange = calculateAnswerScoreChange(value);
                author.setScore(author.getScore() + oldScoreChange + newScoreChange);
                userRepository.save(author);
                existingVote.setValue(value);
                return answerVoteRepository.save(existingVote);
            }
        } else {
            // Create new vote
            AnswerVote newVote = new AnswerVote();
            newVote.setAnswer(answer);
            newVote.setVoter(voter);
            newVote.setValue(value);

            // Update scores
            double authorScoreChange = calculateAnswerScoreChange(value);
            author.setScore(author.getScore() + authorScoreChange);

            // Apply downvote penalty to voter
            if (value == -1) {
                voter.setScore(voter.getScore() + DOWNVOTE_PENALTY);
                userRepository.save(voter);
            }

            userRepository.save(author);
            return answerVoteRepository.save(newVote);
        }
    }

    private double calculateQuestionScoreChange(int voteValue) {
        return voteValue == 1 ? QUESTION_UPVOTE_POINTS : QUESTION_DOWNVOTE_POINTS;
    }

    private double calculateAnswerScoreChange(int voteValue) {
        return voteValue == 1 ? ANSWER_UPVOTE_POINTS : ANSWER_DOWNVOTE_POINTS;
    }
}