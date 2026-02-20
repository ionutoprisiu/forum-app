package com.example.ForumAppBackend.repository;

import com.example.ForumAppBackend.entity.AnswerVote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnswerVoteRepository extends JpaRepository<AnswerVote, Long> {
    Optional<AnswerVote> findByAnswerIdAndVoterId(Long answerId, Long voterId);
    void deleteByVoter_Id(Long voterId);
}
