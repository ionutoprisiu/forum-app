package com.example.ForumAppBackend.service;

import com.example.ForumAppBackend.entity.Question;
import com.example.ForumAppBackend.entity.QuestionTag;
import com.example.ForumAppBackend.entity.Tag;
import com.example.ForumAppBackend.repository.QuestionRepository;
import com.example.ForumAppBackend.repository.QuestionTagRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class QuestionTagService {

    private final QuestionTagRepository questionTagRepository;
    private final QuestionRepository questionRepository;
    private final TagService tagService;

    public QuestionTagService(
            QuestionTagRepository questionTagRepository,
            QuestionRepository questionRepository,
            TagService tagService) {
        this.questionTagRepository = questionTagRepository;
        this.questionRepository = questionRepository;
        this.tagService = tagService;
    }

    public void createAssociation(Question question, Tag tag) {
        QuestionTag qt = new QuestionTag(question, tag);
        questionTagRepository.save(qt);
    }

    public List<Tag> getTagsForQuestion(Long questionId) {
        return questionTagRepository.findByQuestionId(questionId)
                .stream()
                .map(QuestionTag::getTag)
                .toList();
    }

    @Transactional
    public Tag addTagToQuestion(Long questionId, String tagName) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        Tag tag = tagService.createOrGetTag(tagName);
        createAssociation(question, tag);
        return tag;
    }

    @Transactional
    public void removeTagFromQuestion(Long questionId, String tagName) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        Tag tag = tagService.getTagByName(tagName);
        if (tag == null) {
            throw new IllegalArgumentException("Tag not found");
        }

        questionTagRepository.deleteByQuestionAndTag(question, tag);
    }
}