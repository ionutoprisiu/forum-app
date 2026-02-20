package com.example.ForumAppBackend.controller;

import com.example.ForumAppBackend.entity.Tag;
import com.example.ForumAppBackend.service.TagService;
import com.example.ForumAppBackend.service.QuestionTagService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagService tagService;
    private final QuestionTagService questionTagService;

    public TagController(TagService tagService, QuestionTagService questionTagService) {
        this.tagService = tagService;
        this.questionTagService = questionTagService;
    }

    @PostMapping
    public ResponseEntity<Tag> createTag(@RequestParam String name) {
        Tag tag = tagService.createOrGetTag(name);
        return new ResponseEntity<>(tag, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Tag>> getAllTags() {
        List<Tag> tags = tagService.getAllTags();
        return ResponseEntity.ok(tags);
    }

    @GetMapping("/question/{questionId}")
    public ResponseEntity<List<Tag>> getTagsForQuestion(@PathVariable Long questionId) {
        List<Tag> tags = questionTagService.getTagsForQuestion(questionId);
        return ResponseEntity.ok(tags);
    }

    @PostMapping("/question/{questionId}")
    public ResponseEntity<Tag> addTagToQuestion(@PathVariable Long questionId, @RequestParam String name) {
        Tag tag = questionTagService.addTagToQuestion(questionId, name);
        return new ResponseEntity<>(tag, HttpStatus.CREATED);
    }

    @DeleteMapping("/question/{questionId}")
    public ResponseEntity<Void> removeTagFromQuestion(@PathVariable Long questionId, @RequestParam String name) {
        questionTagService.removeTagFromQuestion(questionId, name);
        return ResponseEntity.noContent().build();
    }
}