package com.example.ForumAppBackend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "answer_votes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"answer_id", "voter_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AnswerVote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "answer_id", nullable = false)
    @JsonBackReference(value = "av-answer")
    private Answer answer;

    @ManyToOne
    @JoinColumn(name = "voter_id", nullable = false)
    private User voter;

    private int value; // 1 for upvote, -1 for downvote
}
