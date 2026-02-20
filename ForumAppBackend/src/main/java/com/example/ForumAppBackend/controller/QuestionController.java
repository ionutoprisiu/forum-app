package com.example.ForumAppBackend.controller;

import com.example.ForumAppBackend.dto.QuestionDTO;
import com.example.ForumAppBackend.entity.Question;
import com.example.ForumAppBackend.entity.User;
import com.example.ForumAppBackend.service.QuestionService;
import com.example.ForumAppBackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService questionService;
    private final UserRepository userRepository;

    public QuestionController(QuestionService questionService, UserRepository userRepository) {
        this.questionService = questionService;
        this.userRepository = userRepository;
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<Question> createQuestion(@PathVariable Long userId, @RequestBody QuestionDTO dto) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        if (user.isBanned()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Question q = new Question();
        q.setTitle(dto.getTitle());
        q.setText(dto.getText());
        q.setPicture(dto.getPicture());
        Question created = questionService.createQuestion(userId, q, dto.getTagNames());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public List<Question> getAll() {
        return questionService.getAllSorted();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Question> getById(@PathVariable Long id) {
        Question q = questionService.getQuestionById(id);
        return q != null ? ResponseEntity.ok(q) : ResponseEntity.notFound().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Question>> getByUser(@PathVariable Long userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(questionService.getByUser(userId));
    }

    @GetMapping("/search")
    public List<Question> search(@RequestParam("q") String query) {
        return questionService.searchByTitle(query);
    }

    @GetMapping("/filter")
    public List<Question> filterByTag(@RequestParam("tag") String tagName) {
        return questionService.getByTag(tagName);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Question> update(@PathVariable Long id, @RequestBody Question data) {
        Question updated = questionService.updateQuestion(id, data);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return questionService.deleteQuestion(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @PutMapping("/{questionId}/accept/{answerId}")
    public ResponseEntity<?> acceptAnswer(
            @PathVariable Long questionId,
            @PathVariable Long answerId,
            @RequestParam("userId") Long userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        try {
            Question solved = questionService.acceptAnswer(questionId, answerId, userId);
            return ResponseEntity.ok(solved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
}
