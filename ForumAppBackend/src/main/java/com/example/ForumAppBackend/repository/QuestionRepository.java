package com.example.ForumAppBackend.repository;

import com.example.ForumAppBackend.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    /** All questions, newest first */
    List<Question> findAllByOrderByCreationDateTimeDesc();

    /** Questions by author, newest first */
    List<Question> findByAuthor_IdOrderByCreationDateTimeDesc(Long authorId);

    /** Search by title (ignore case) */
    List<Question> findByTitleContainingIgnoreCase(String title);

    /** Filter by tag name, newest first */
    List<Question> findByQuestionTags_Tag_NameOrderByCreationDateTimeDesc(String name);

    /** Questions that have acceptedAnswerId in the given list (e.g. before deleting those answers) */
    List<Question> findByAcceptedAnswerIdIn(java.util.Collection<Long> answerIds);
}
