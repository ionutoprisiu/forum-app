import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import QuestionPage from './pages/QuestionPage';
import AnswerPage from './pages/AnswerPage';
import NewQuestionPage from './pages/NewQuestionPage';
import ProfilePage from './pages/ProfilePage';
import ModeratorPage from './pages/ModeratorPage';
import TagsPage from './pages/TagsPage';
import NotFoundPage from './pages/NotFoundPage';

const DEFAULT_TITLE = 'Forum App';

function PageTitle() {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;
    const titles = {
      '/': 'Home | Forum App',
      '/login': 'Login | Forum App',
      '/register': 'Register | Forum App',
      '/ask': 'Ask a question | Forum App',
      '/profile': 'Profile | Forum App',
      '/tags': 'Popular tags | Forum App',
      '/moderator': 'Moderator | Forum App'
    };
    document.title = path.startsWith('/questions/') ? 'Question | Forum App' : (titles[path] || DEFAULT_TITLE);
    return () => { document.title = DEFAULT_TITLE; };
  }, [location.pathname]);
  return null;
}

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function ModeratorRoute({ children }) {
  const { user } = useAuth();
  return user && user.role === 'MODERATOR' ? children : <Navigate to="/" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <PageTitle />
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/questions/:id" element={<PrivateRoute><QuestionPage /></PrivateRoute>} />
          <Route path="/questions/:id/answer" element={<PrivateRoute><AnswerPage /></PrivateRoute>} />
          <Route path="/ask" element={<PrivateRoute><NewQuestionPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/tags" element={<PrivateRoute><TagsPage /></PrivateRoute>} />
          <Route path="/moderator" element={<ModeratorRoute><ModeratorPage /></ModeratorRoute>} />

          <Route path="/not-found" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
