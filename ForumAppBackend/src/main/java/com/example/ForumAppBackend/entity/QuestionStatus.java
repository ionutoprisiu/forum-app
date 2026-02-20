package com.example.ForumAppBackend.entity;

public enum QuestionStatus {
    RECEIVED,      // Question was posted
    IN_PROGRESS,   // At least one answer was added
    SOLVED         // Author accepted an answer
}
