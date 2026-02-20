package com.example.ForumAppBackend.service;

import com.example.ForumAppBackend.entity.Answer;
import com.example.ForumAppBackend.entity.Question;
import com.example.ForumAppBackend.entity.QuestionStatus;
import com.example.ForumAppBackend.entity.Tag;
import com.example.ForumAppBackend.entity.User;
import com.example.ForumAppBackend.repository.QuestionRepository;
import com.example.ForumAppBackend.repository.UserRepository;
import com.example.ForumAppBackend.repository.AnswerRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final AnswerRepository answerRepository;
    private final TagService tagService;
    private final QuestionTagService questionTagService;
    private final FileUploadService fileUploadService;

    public QuestionService(
            QuestionRepository questionRepository,
            UserRepository userRepository,
            AnswerRepository answerRepository,
            TagService tagService,
            QuestionTagService questionTagService,
            FileUploadService fileUploadService) {
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
        this.answerRepository = answerRepository;
        this.tagService = tagService;
        this.questionTagService = questionTagService;
        this.fileUploadService = fileUploadService;
    }

    public Question createQuestion(Long userId, Question question, List<String> tagNames) {
        question.setCreationDateTime(LocalDateTime.now());
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        question.setAuthor(author);

        Question saved = questionRepository.save(question);

        if (tagNames != null && !tagNames.isEmpty()) {
            for (String name : tagNames) {
                Tag tag = tagService.createOrGetTag(name);
                questionTagService.createAssociation(saved, tag);
            }
        }
        return saved;
    }

    public List<Question> getAllSorted() {
        return questionRepository.findAllByOrderByCreationDateTimeDesc();
    }

    public List<Question> getByUser(Long userId) {
        return questionRepository.findByAuthor_IdOrderByCreationDateTimeDesc(userId);
    }

    public List<Question> searchByTitle(String title) {
        return questionRepository.findByTitleContainingIgnoreCase(title);
    }

    public List<Question> getByTag(String tagName) {
        return questionRepository.findByQuestionTags_Tag_NameOrderByCreationDateTimeDesc(tagName);
    }

    public Question getQuestionById(Long id) {
        return questionRepository.findById(id).orElse(null);
    }

    public Question updateQuestion(Long questionId, Question data) {
        Question q = getQuestionById(questionId);
        if (q == null)
            return null;
        q.setTitle(data.getTitle());
        q.setText(data.getText());
        q.setPicture(data.getPicture());
        return questionRepository.save(q);
    }

    @Transactional
    public boolean deleteQuestion(Long id) {
        Question question = getQuestionById(id);
        if (question == null)
            return false;

        if (question.getPicture() != null) {
            try {
                fileUploadService.deleteFile(question.getPicture());
            } catch (IOException ignored) {
            }
        }

        questionRepository.delete(question);
        return true;
    }

    @Transactional
    public Question acceptAnswer(Long questionId, Long answerId, Long actingUserId) {
        Question q = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        if (!q.getAuthor().getId().equals(actingUserId)) {
            throw new SecurityException("Only the question author can accept an answer");
        }

        Answer a = answerRepository.findById(answerId)
                .orElseThrow(() -> new IllegalArgumentException("Answer not found"));
        if (!a.getQuestion().getId().equals(questionId)) {
            throw new IllegalArgumentException("Answer does not belong to this question");
        }

        q.setStatus(QuestionStatus.SOLVED);
        q.setAcceptedAnswerId(answerId);
        return questionRepository.save(q);
    }
}
