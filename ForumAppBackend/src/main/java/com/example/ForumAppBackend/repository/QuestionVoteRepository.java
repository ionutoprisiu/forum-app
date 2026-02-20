package com.example.ForumAppBackend.repository;

import com.example.ForumAppBackend.entity.QuestionVote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QuestionVoteRepository extends JpaRepository<QuestionVote, Long> {
    Optional<QuestionVote> findByQuestionIdAndVoterId(Long questionId, Long voterId);
    void deleteByVoter_Id(Long voterId);
}
