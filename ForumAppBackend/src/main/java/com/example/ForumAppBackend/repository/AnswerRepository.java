package com.example.ForumAppBackend.repository;

import com.example.ForumAppBackend.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findByQuestionIdOrderByCreationDateTimeDesc(Long questionId);
    List<Answer> findByAuthor_Id(Long authorId);
}
