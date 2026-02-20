package com.example.ForumAppBackend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "question_tags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuestionTag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    @JsonBackReference(value = "qt-question")
    private Question question;

    @ManyToOne
    @JoinColumn(name = "tag_id", nullable = false)
    private Tag tag;

    public QuestionTag(Question question, Tag tag) {
        this.question = question;
        this.tag = tag;
    }
}