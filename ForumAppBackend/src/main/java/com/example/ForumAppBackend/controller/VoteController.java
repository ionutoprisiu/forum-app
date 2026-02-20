package com.example.ForumAppBackend.controller;

import com.example.ForumAppBackend.entity.QuestionVote;
import com.example.ForumAppBackend.entity.AnswerVote;
import com.example.ForumAppBackend.service.VoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/votes")
public class VoteController {
    private final VoteService voteService;

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    }

    @PostMapping("/question/{questionId}/user/{userId}")
    public ResponseEntity<?> voteQuestion(
            @PathVariable Long questionId,
            @PathVariable Long userId,
            @RequestParam int value) {
        try {
            QuestionVote vote = voteService.voteQuestion(questionId, userId, value);
            return ResponseEntity.ok(vote);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/answer/{answerId}/user/{userId}")
    public ResponseEntity<?> voteAnswer(
            @PathVariable Long answerId,
            @PathVariable Long userId,
            @RequestParam int value) {
        try {
            AnswerVote vote = voteService.voteAnswer(answerId, userId, value);
            return ResponseEntity.ok(vote);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 