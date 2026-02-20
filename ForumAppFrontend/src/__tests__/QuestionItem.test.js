import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import QuestionItem from '../components/Questions/QuestionItem';

describe('QuestionItem', () => {
  const question = {
    id: 123,
    title: 'Test question',
    author: {
      username: 'testuser',
      score: 42.5
    }
  };

  test('displays question title', () => {
    render(
      <BrowserRouter>
        <QuestionItem question={question} />
      </BrowserRouter>
    );
    expect(screen.getByText('Test question')).toBeInTheDocument();
  });

  test('displays author name', () => {
    render(
      <BrowserRouter>
        <QuestionItem question={question} />
      </BrowserRouter>
    );
    expect(screen.getByText(/by testuser/i)).toBeInTheDocument();
  });

  test('displays author score', () => {
    render(
      <BrowserRouter>
        <QuestionItem question={question} />
      </BrowserRouter>
    );
    expect(screen.getByText('42.5')).toBeInTheDocument();
  });
}); 