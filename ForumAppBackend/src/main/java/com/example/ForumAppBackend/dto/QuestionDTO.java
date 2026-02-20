package com.example.ForumAppBackend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class QuestionDTO {
    private String title;
    private String text;
    private String picture;
    private List<String> tagNames;
}
