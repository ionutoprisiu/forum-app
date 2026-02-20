import api from './api';

export function getAllQuestions() {
  return api.get('/questions').then(res => res.data);
}

export function getQuestionById(id) {
  return api.get(`/questions/${id}`).then(res => res.data);
}

export function createQuestion(userId, questionData) {
  const requestData = {
    title: questionData.title,
    text: questionData.text,
    picture: questionData.picture || null,
    tagNames: Array.isArray(questionData.tagNames) ? questionData.tagNames : []
  };
  return api.post(`/questions/user/${userId}`, requestData).then(res => res.data);
}

export function updateQuestion(id, questionData) {
  return api.put(`/questions/${id}`, questionData).then(res => res.data);
}

export function deleteQuestion(id) {
  return api.delete(`/questions/${id}`);
}

export function searchQuestions(title) {
  return api.get('/questions/search', { params: { q: title } }).then(res => res.data);
}

export function filterQuestionsByTag(tagName) {
  return api.get('/questions/filter', { params: { tag: tagName } }).then(res => res.data);
}

export function getQuestionsByUser(userId) {
  return api.get(`/questions/user/${userId}`).then(res => res.data);
}

export function acceptAnswer(questionId, answerId, userId) {
  return api
    .put(`/questions/${questionId}/accept/${answerId}`, null, { params: { userId } })
    .then(res => res.data);
}

export function reloadQuestionWithVotes(questionId) {
  return api.get(`/questions/${questionId}`).then(res => res.data);
}
