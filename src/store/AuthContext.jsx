import { createContext, useContext, useState, useEffect } from 'react';

const AUTH_KEY = 'indusvit_auth';

const CREDENTIALS = {
  username: 'indusvit.admin',
  password: 'indusvit123',
};

const DEFAULT_PROFILE = {
  nombre: 'Santiago Ramírez',
  cargo: 'Administrador del Sistema',
  email: 'admin@indusvit.com',
  telefono: '601 000 0000',
  empresa: 'Indusvit S.A.S.',
  nitEmpresa: '900.000.001-1',
  direccionEmpresa: 'Cll 13 # 31-41, Bogotá',
};

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
  // profile se guarda separado para poder editarlo sin re-login
  const [profile, setProfile] = useState(() => {
    try {
      const s = localStorage.getItem('indusvit_profile');
      return s ? JSON.parse(s) : DEFAULT_PROFILE;
    } catch { return DEFAULT_PROFILE; }
  });

  useEffect(() => {
    if (session) localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    else localStorage.removeItem(AUTH_KEY);
  }, [session]);

  useEffect(() => {
    localStorage.setItem('indusvit_profile', JSON.stringify(profile));
  }, [profile]);

  function login(username, password) {
    if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
      const s = { username, loginAt: new Date().toISOString() };
      setSession(s);
      return true;
    }
    return false;
  }

  function logout() {
    setSession(null);
  }

  function updateProfile(data) {
    setProfile(p => ({ ...p, ...data }));
  }

  return (
    <AuthContext.Provider value={{ session, profile, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
