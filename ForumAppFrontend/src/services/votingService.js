import api from './api';

export function voteQuestion(questionId, voterId, vote) {
  if (!questionId || !voterId) {
    return Promise.reject(new Error('IDs are required'));
  }
  if (vote !== 1 && vote !== -1) {
    return Promise.reject(new Error('Vote must be 1 or -1'));
  }
  return api.post(`/votes/question/${questionId}/user/${voterId}`, null, {
    params: {
      value: vote
    }
  }).then(res => res.data)
    .catch(error => {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    });
}

export function voteAnswer(answerId, voterId, vote) {
  if (!answerId || !voterId) {
    return Promise.reject(new Error('IDs are required'));
  }
  if (vote !== 1 && vote !== -1) {
    return Promise.reject(new Error('Vote must be 1 or -1'));
  }
  return api.post(`/votes/answer/${answerId}/user/${voterId}`, null, {
    params: {
      value: vote
    }
  }).then(res => res.data)
    .catch(error => {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    });
} 