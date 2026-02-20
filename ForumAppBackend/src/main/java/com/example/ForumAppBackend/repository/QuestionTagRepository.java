package com.example.ForumAppBackend.repository;

import com.example.ForumAppBackend.entity.Question;
import com.example.ForumAppBackend.entity.QuestionTag;
import com.example.ForumAppBackend.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionTagRepository extends JpaRepository<QuestionTag, Long> {
    List<QuestionTag> findByQuestionId(Long questionId);
    void deleteByQuestionAndTag(Question question, Tag tag);
}