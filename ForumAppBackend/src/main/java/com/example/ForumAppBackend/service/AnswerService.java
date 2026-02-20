package com.example.ForumAppBackend.service;

import com.example.ForumAppBackend.entity.Answer;
import com.example.ForumAppBackend.entity.Question;
import com.example.ForumAppBackend.entity.QuestionStatus;
import com.example.ForumAppBackend.entity.User;
import com.example.ForumAppBackend.repository.AnswerRepository;
import com.example.ForumAppBackend.repository.QuestionRepository;
import com.example.ForumAppBackend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AnswerService {

    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;

    public AnswerService(
            AnswerRepository answerRepository,
            QuestionRepository questionRepository,
            UserRepository userRepository,
            FileUploadService fileUploadService) {
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
        this.fileUploadService = fileUploadService;
    }

    @Transactional
    public Answer createAnswer(Long userId, Long questionId, Answer answer) {
        User author = userRepository.findById(userId).orElse(null);
        Question question = questionRepository.findById(questionId).orElse(null);
        if (author == null || question == null) {
            return null;
        }

        answer.setAuthor(author);
        answer.setQuestion(question);
        answer.setCreationDateTime(LocalDateTime.now());
        Answer saved = answerRepository.save(answer);

        if (question.getStatus() == QuestionStatus.RECEIVED) {
            question.setStatus(QuestionStatus.IN_PROGRESS);
            questionRepository.save(question);
        }

        return saved;
    }

    public List<Answer> getAllAnswers() {
        return answerRepository.findAll();
    }

    public Answer getAnswerById(Long answerId) {
        return answerRepository.findById(answerId).orElse(null);
    }

    public Answer updateAnswer(Long answerId, Answer updatedData) {
        Answer existing = getAnswerById(answerId);
        if (existing != null) {
            existing.setText(updatedData.getText());

            String newPicture = updatedData.getPicture();
            String oldPicture = existing.getPicture();

            try {
                if (newPicture == null || newPicture.isBlank()) {
                    if (oldPicture != null) {
                        fileUploadService.deleteFile(oldPicture);
                    }
                    existing.setPicture(null);
                } else if (!newPicture.equals(oldPicture)) {
                    if (oldPicture != null) {
                        fileUploadService.deleteFile(oldPicture);
                    }
                    existing.setPicture(newPicture);
                }
            } catch (IOException ignored) {
            }

            return answerRepository.save(existing);
        }
        return null;
    }

    @Transactional
    public boolean deleteAnswer(Long id) {
        Answer answer = getAnswerById(id);
        if (answer == null)
            return false;

        if (answer.getPicture() != null) {
            try {
                fileUploadService.deleteFile(answer.getPicture());
            } catch (IOException ignored) {
            }
        }

        answerRepository.delete(answer);
        return true;
    }

    public List<Answer> getAnswersForQuestion(Long questionId) {
        return answerRepository.findByQuestionIdOrderByCreationDateTimeDesc(questionId);
    }
}
