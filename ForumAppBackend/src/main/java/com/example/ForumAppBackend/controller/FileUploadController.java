package com.example.ForumAppBackend.controller;

import com.example.ForumAppBackend.service.FileUploadService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    private final FileUploadService fileUploadService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public FileUploadController(FileUploadService fileUploadService) {
        this.fileUploadService = fileUploadService;
    }

    @PostMapping("/image")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = fileUploadService.uploadFile(file);
            return ResponseEntity.ok(fileUrl);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error uploading file: " + e.getMessage());
        }
    }

    @GetMapping("/image/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = determineContentType(filename);
                }

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(contentType));
                headers.setContentDisposition(org.springframework.http.ContentDisposition
                        .builder("inline")
                        .filename(resource.getFilename())
                        .build());
                headers.setCacheControl("no-cache, no-store, must-revalidate");
                headers.setPragma("no-cache");
                headers.setExpires(0);

                return ResponseEntity.ok().headers(headers).body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private String determineContentType(String filename) {
        filename = filename.toLowerCase();
        if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
            return MediaType.IMAGE_JPEG_VALUE;
        } else if (filename.endsWith(".png")) {
            return MediaType.IMAGE_PNG_VALUE;
        } else if (filename.endsWith(".gif")) {
            return MediaType.IMAGE_GIF_VALUE;
        }
        return MediaType.APPLICATION_OCTET_STREAM_VALUE;
    }

    @DeleteMapping("/image")
    public ResponseEntity<Void> deleteImage(@RequestParam("url") String fileUrl) {
        try {
            fileUploadService.deleteFile(fileUrl);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
