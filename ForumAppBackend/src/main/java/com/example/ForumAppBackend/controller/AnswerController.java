package com.example.ForumAppBackend.controller;

import com.example.ForumAppBackend.entity.Answer;
import com.example.ForumAppBackend.service.AnswerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/answers")
public class AnswerController {

    private final AnswerService answerService;

    public AnswerController(AnswerService answerService) {
        this.answerService = answerService;
    }

    @PostMapping("/user/{userId}/question/{questionId}")
    public ResponseEntity<Answer> createAnswer(
            @PathVariable Long userId,
            @PathVariable Long questionId,
            @RequestBody Answer answer) {
        Answer createdAnswer = answerService.createAnswer(userId, questionId, answer);
        if (createdAnswer != null) {
            return new ResponseEntity<>(createdAnswer, HttpStatus.CREATED);
        }
        return ResponseEntity.badRequest().build();
    }

    @GetMapping
    public List<Answer> getAllAnswers() {
        return answerService.getAllAnswers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Answer> getAnswerById(@PathVariable Long id) {
        Answer answer = answerService.getAnswerById(id);
        return answer != null ? ResponseEntity.ok(answer) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Answer> updateAnswer(@PathVariable Long id, @RequestBody Answer answerData) {
        Answer updated = answerService.updateAnswer(id, answerData);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnswer(@PathVariable Long id) {
        boolean deleted = answerService.deleteAnswer(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/question/{questionId}")
    public ResponseEntity<List<Answer>> getAnswersForQuestion(@PathVariable Long questionId) {
        List<Answer> answers = answerService.getAnswersForQuestion(questionId);
        return ResponseEntity.ok(answers);
    }
}
