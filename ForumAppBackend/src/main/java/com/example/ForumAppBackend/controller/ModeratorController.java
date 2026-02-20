package com.example.ForumAppBackend.controller;

import com.example.ForumAppBackend.entity.User;
import com.example.ForumAppBackend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/moderator")
public class ModeratorController {

    private final UserService userService;

    public ModeratorController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/unban/{userId}")
    public ResponseEntity<User> unbanUser(@PathVariable Long userId) {
        try {
            User user = userService.unbanUser(userId);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
