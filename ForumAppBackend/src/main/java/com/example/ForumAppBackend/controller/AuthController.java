package com.example.ForumAppBackend.controller;

import com.example.ForumAppBackend.dto.LoginRequest;
import com.example.ForumAppBackend.dto.UserDTO;
import com.example.ForumAppBackend.entity.User;
import com.example.ForumAppBackend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        User user = userService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("message", "No account found with this email, or the password is incorrect. If you don't have an account, you can register here."));
        }
        if (user.isBanned()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(java.util.Map.of("message", "Your account has been banned. Contact a moderator for more information."));
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody UserDTO dto) {
        User toCreate = new User();
        toCreate.setUsername(dto.getUsername());
        toCreate.setEmail(dto.getEmail());
        toCreate.setPassword(dto.getPassword());
        toCreate.setPhoneNumber(dto.getPhoneNumber());
        User created = userService.createUser(toCreate);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}
