import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import AnswerForm from '../components/QuestionDetail/AnswerForm';

jest.mock('../services/answerService', () => ({
  createAnswer: jest.fn(),
}));
jest.mock('../services/uploadService', () => ({
  uploadImage: jest.fn(),
}));

let mockUser = null;

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

describe('AnswerForm', () => {
  afterEach(() => {
    mockUser = null;
  });

  test('displays textarea and submit button for authenticated user', () => {
    mockUser = { id: 1, username: 'testuser' };
    render(<AnswerForm questionId={123} />);
    expect(screen.getByPlaceholderText('Write your answer here...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit answer/i })).toBeInTheDocument();
  });

  test('displays login message for unauthenticated user', () => {
    mockUser = null;
    render(<AnswerForm questionId={123} />);
    expect(screen.getByText(/must be logged in/i)).toBeInTheDocument();
  });
}); 