import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import QuestionForm from '../components/Questions/QuestionForm';

jest.mock('../services/questionService', () => ({
  createQuestion: jest.fn(),
}));
jest.mock('../services/uploadService', () => ({
  uploadImage: jest.fn(),
}));
jest.mock('../services/tagService', () => ({
  getAllTags: jest.fn(),
  createTag: jest.fn(),
}));

let mockUser = { id: 1, username: 'testuser' };
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

describe('QuestionForm', () => {
  afterEach(() => {
    mockUser = { id: 1, username: 'testuser' };
  });

  test('displays form title and title input', () => {
    render(
      <BrowserRouter>
        <QuestionForm />
      </BrowserRouter>
    );
    expect(screen.getByText('Add a new question')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
  });
}); 