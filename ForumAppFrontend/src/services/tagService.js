import api from './api';

export function getAllTags() {
  return api.get('/tags').then(res => res.data);
}

export function createTag(name) {
  return api.post('/tags', null, {
    params: { name }
  }).then(res => res.data);
}

export function getTagsForQuestion(questionId) {
  return api.get(`/tags/question/${questionId}`).then(res => res.data);
}

export function addTagToQuestion(questionId, tagName) {
  return api.post(`/tags/question/${questionId}`, null, {
    params: { name: tagName }
  }).then(res => res.data);
}

export function removeTagFromQuestion(questionId, tagName) {
  return api.delete(`/tags/question/${questionId}`, {
    params: { name: tagName }
  });
}

export function getPopularTags() {
  return api.get('/tags').then(res => res.data).catch(() => []);
}
