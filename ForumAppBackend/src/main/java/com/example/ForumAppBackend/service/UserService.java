package com.example.ForumAppBackend.service;

import com.example.ForumAppBackend.entity.Answer;
import com.example.ForumAppBackend.entity.Question;
import com.example.ForumAppBackend.entity.QuestionStatus;
import com.example.ForumAppBackend.entity.User;
import com.example.ForumAppBackend.repository.UserRepository;
import com.example.ForumAppBackend.repository.QuestionVoteRepository;
import com.example.ForumAppBackend.repository.AnswerVoteRepository;
import com.example.ForumAppBackend.repository.AnswerRepository;
import com.example.ForumAppBackend.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final QuestionVoteRepository questionVoteRepository;
    private final AnswerVoteRepository answerVoteRepository;
    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;

    public UserService(UserRepository userRepository,
                       QuestionVoteRepository questionVoteRepository,
                       AnswerVoteRepository answerVoteRepository,
                       AnswerRepository answerRepository,
                       QuestionRepository questionRepository) {
        this.userRepository = userRepository;
        this.questionVoteRepository = questionVoteRepository;
        this.answerVoteRepository = answerVoteRepository;
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
    }

    public User createUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("User with this email already exists.");
        }
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User updateUser(Long id, User updatedData) {
        User existingUser = getUserById(id);
        if (existingUser != null) {
            existingUser.setUsername(updatedData.getUsername());
            existingUser.setEmail(updatedData.getEmail());
            if (updatedData.getPassword() != null && !updatedData.getPassword().isBlank()) {
                existingUser.setPassword(updatedData.getPassword());
            }
            existingUser.setPhoneNumber(updatedData.getPhoneNumber());
            return userRepository.save(existingUser);
        }
        return null;
    }

    @Transactional
    public boolean deleteUser(Long id) {
        User existingUser = getUserById(id);
        if (existingUser == null) {
            return false;
        }
        // Remove votes cast by this user (so no FK from question_votes/answer_votes to user)
        questionVoteRepository.deleteByVoter_Id(id);
        answerVoteRepository.deleteByVoter_Id(id);
        // Before deleting user's answers: clear acceptedAnswerId on questions that had this user's answer accepted
        List<Answer> userAnswers = answerRepository.findByAuthor_Id(id);
        if (!userAnswers.isEmpty()) {
            List<Long> userAnswerIds = userAnswers.stream().map(Answer::getId).toList();
            List<Question> questionsWithAcceptedFromUser = questionRepository.findByAcceptedAnswerIdIn(userAnswerIds);
            for (Question q : questionsWithAcceptedFromUser) {
                q.setAcceptedAnswerId(null);
                q.setStatus(QuestionStatus.RECEIVED);
                questionRepository.save(q);
            }
        }
        // Remove user's answers (so no FK from answers to user)
        answerRepository.deleteAll(answerRepository.findByAuthor_Id(id));
        // Remove user's questions (cascade removes their answers, tags, votes)
        questionRepository.deleteAll(questionRepository.findByAuthor_IdOrderByCreationDateTimeDesc(id));
        userRepository.delete(existingUser);
        return true;
    }

    public User authenticate(String email, String password) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (password.equals(user.getPassword())) {
                return user;
            }
        }
        return null;
    }

    @Transactional
    public User banUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setBanned(true);
        return userRepository.save(user);
    }

    @Transactional
    public User unbanUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setBanned(false);
        return userRepository.save(user);
    }

    @Transactional
    public void updatePhoneNumberFormats() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            String phone = user.getPhoneNumber();
            if (phone != null && phone.startsWith("07")) {
                user.setPhoneNumber("+40" + phone.substring(1));
                userRepository.save(user);
            }
        }
    }

    @Transactional
    public void deleteAllTestUsers() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (user.getEmail() != null && user.getEmail().endsWith("@example.com")) {
                userRepository.delete(user);
            }
        }
    }
}
