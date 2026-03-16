import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AUTH_KEY = 'indusvit_auth';

function loadAuth() {
  try {
    const s = localStorage.getItem(AUTH_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return null;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadAuth);

  async function login(username, password) {
    const res = await api.post('/auth/login', { username, password });
    const { token, user } = res.data.data;
    const s = { token, user };
    localStorage.setItem(AUTH_KEY, JSON.stringify(s));
    setSession(s);
    return true;
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    setSession(null);
  }

  async function updateProfile(data) {
    const res = await api.put('/auth/profile', data);
    const updated = res.data.data;
    setSession((prev) => ({
      ...prev,
      user: { ...prev.user, ...updated },
    }));
    return updated;
  }

  async function changePassword(currentPassword, newPassword) {
    await api.put('/auth/password', { currentPassword, newPassword });
  }

  // profile expone los datos del usuario para compatibilidad con páginas existentes
  const profile = session?.user ?? null;

  return (
    <AuthContext.Provider value={{ session, profile, login, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
