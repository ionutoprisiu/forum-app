package com.example.ForumAppBackend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "question_votes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"question_id", "voter_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuestionVote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    @JsonBackReference(value = "qv-question")
    private Question question;

    @ManyToOne
    @JoinColumn(name = "voter_id", nullable = false)
    private User voter;

    private int value; // 1 for upvote, -1 for downvote
}
