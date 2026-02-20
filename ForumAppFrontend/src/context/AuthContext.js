import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';
import userService from '../services/userService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        setUser(JSON.parse(atob(token)));
      } catch {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const loginUser = async (email, password) => {
    const { token, user } = await authService.login({ email, password });
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const logoutUser = async () => {
    await authService.logout();
    setUser(null);
    window.location.href = '/login';
  };

  const updateUserProfile = (updatedUserFromApi) => {
    const safeUser = {
      id: updatedUserFromApi.id,
      username: updatedUserFromApi.username,
      email: updatedUserFromApi.email,
      role: updatedUserFromApi.role ?? user?.role,
      isBanned: updatedUserFromApi.isBanned ?? user?.isBanned,
      score: updatedUserFromApi.score ?? user?.score,
      phoneNumber: updatedUserFromApi.phoneNumber ?? user?.phoneNumber
    };
    const token = btoa(JSON.stringify(safeUser));
    localStorage.setItem('token', token);
    setUser(safeUser);
  };

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        const fresh = await userService.getById(user.id);
        if (fresh?.isBanned) {
          alert('Your account has been banned. You will be logged out.');
          logoutUser();
        }
      } catch {}
    }, 15000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
