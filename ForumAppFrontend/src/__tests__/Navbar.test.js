import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null, logoutUser: jest.fn() })
}));

describe('Navbar', () => {
  test('displays app title', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(screen.getByText('Forum App')).toBeInTheDocument();
  });

  test('displays login and register buttons when user is not authenticated', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });
}); 