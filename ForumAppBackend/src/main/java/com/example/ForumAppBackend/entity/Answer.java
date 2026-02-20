package com.example.ForumAppBackend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String text;
    private LocalDateTime creationDateTime;
    private String picture;

    @ManyToOne
    @JoinColumn(name = "question_id")
    @JsonBackReference
    private Question question;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;

    @OneToMany(mappedBy = "answer", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference(value = "av-answer")
    private List<AnswerVote> votes = new ArrayList<>();

    /** Used for JSON serialization: true if this answer is the accepted one for the question. */
    public boolean isAccepted() {
        return question != null && question.getAcceptedAnswerId() != null && question.getAcceptedAnswerId().equals(this.id);
    }
}
