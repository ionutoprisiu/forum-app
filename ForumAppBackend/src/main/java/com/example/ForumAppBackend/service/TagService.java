package com.example.ForumAppBackend.service;

import com.example.ForumAppBackend.entity.Tag;
import com.example.ForumAppBackend.repository.TagRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TagService {

    private final TagRepository tagRepository;

    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    public Tag createOrGetTag(String name) {
        return tagRepository.findByName(name)
                .orElseGet(() -> tagRepository.save(new Tag(name)));
    }

    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    public Tag getTagByName(String name) {
        return tagRepository.findByName(name).orElse(null);
    }
}