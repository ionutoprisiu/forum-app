import api from './api';

export function login({ email, password }) {
  return api
    .post('/auth/login', { email, password })
    .then(res => {
      if (!res.data) throw new Error('Invalid response from server');
      const user = res.data;
      if (user.isBanned) {
        throw new Error('Your account has been banned by a moderator. You cannot access the application.');
      }
      const token = btoa(JSON.stringify({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isBanned: user.isBanned
      }));
      return { token, user };
    })
    .catch(error => {
      const status = error.response?.status;
      const msg = error.response?.data?.message || error.response?.data;
      if (status === 401) {
        throw new Error(msg || 'No account found with this email, or the password is incorrect. If you don\'t have an account, you can register here.');
      }
      if (status === 403) {
        throw new Error(msg || 'Your account has been banned. Contact a moderator for more information.');
      }
      if (typeof msg === 'string') throw new Error(msg);
      throw new Error(msg?.message || error.message || 'Authentication failed. Please try again.');
    });
}

export function register({ username, email, password, phoneNumber }) {
  return api
    .post('/auth/register', { username, email, password, phoneNumber })
    .then(res => res.data);
}

export function logout() {
  localStorage.removeItem('token');
  return Promise.resolve();
}

export function isAuthenticated() {
  return !!localStorage.getItem('token');
}
