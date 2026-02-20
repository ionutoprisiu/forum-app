package com.example.ForumAppBackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileUploadService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    public String uploadFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File is too large. Maximum allowed size is 10MB.");
        }

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String newFilename = UUID.randomUUID().toString() + extension;

        Path filePath = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath);

        return newFilename;
    }

    public void deleteFile(String filename) throws IOException {
        if (filename != null) {
            String cleanFilename = filename.replace("/uploads/", "");
            int lastSlash = cleanFilename.lastIndexOf('/');
            if (lastSlash >= 0) {
                cleanFilename = cleanFilename.substring(lastSlash + 1);
            }
            Path filePath = Paths.get(uploadDir, cleanFilename);
            Files.deleteIfExists(filePath);
        }
    }
}