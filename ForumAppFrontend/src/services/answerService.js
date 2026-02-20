import api from './api';

export function getAllAnswers() {
  return api.get('/answers').then(res => res.data);
}

export function getAnswerById(id) {
  return api.get(`/answers/${id}`).then(res => res.data);
}

export function createAnswer(userId, questionId, answerData) {
  return api.post(`/answers/user/${userId}/question/${questionId}`, answerData).then(res => res.data);
}

export function updateAnswer(id, answerData) {
  return api.put(`/answers/${id}`, answerData).then(res => res.data);
}

export function deleteAnswer(id) {
  return api.delete(`/answers/${id}`);
}

export function getAnswersForQuestion(questionId) {
  return api.get(`/answers/question/${questionId}`).then(res => res.data);
}

export function acceptAnswer(questionId, answerId, userId) {
  return api.put(`/questions/${questionId}/accept/${answerId}`, null, {
    params: { userId }
  }).then(res => res.data);
}
