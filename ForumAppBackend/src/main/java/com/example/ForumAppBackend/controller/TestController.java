package com.example.ForumAppBackend.controller;

import com.example.ForumAppBackend.entity.User;
import com.example.ForumAppBackend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    private final UserService userService;

    public TestController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/cleanup")
    @Transactional
    public ResponseEntity<Void> cleanupDatabase() {
        userService.deleteAllTestUsers();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/create-moderator")
    public ResponseEntity<User> createModerator(@RequestBody User moderatorData) {
        User moderator = new User();
        moderator.setUsername(moderatorData.getUsername());
        moderator.setEmail(moderatorData.getEmail());
        moderator.setPassword(moderatorData.getPassword());
        moderator.setPhoneNumber(moderatorData.getPhoneNumber());
        moderator.setRole(com.example.ForumAppBackend.entity.Role.MODERATOR);

        User created = userService.createUser(moderator);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getTestStatus() {
        Map<String, Object> status = new HashMap<>();
        try {
            List<User> users = userService.getAllUsers();
            status.put("totalUsers", users.size());
            status.put("testUsers", users.stream()
                    .filter(u -> u.getEmail() != null && u.getEmail().endsWith("@example.com"))
                    .count());
            status.put("status", "OK");
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            status.put("status", "ERROR");
            status.put("error", e.getMessage());
            return ResponseEntity.status(500).body(status);
        }
    }
}