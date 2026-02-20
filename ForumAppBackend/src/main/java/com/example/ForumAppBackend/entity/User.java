package com.example.ForumAppBackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private boolean isBanned = false;

    @Column(nullable = false)
    private double score = 0.0;

    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;

    private String phoneNumber;

    public User(Long id) {
        this.id = id;
    }
}
