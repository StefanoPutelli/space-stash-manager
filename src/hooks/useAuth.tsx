/*  Autenticazione (JWT)  */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:6789/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]   = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* al mount, prova a caricare user + token */
  useEffect(() => {
    const savedUser  = localStorage.getItem('hackerspace_user');
    const savedToken = localStorage.getItem('hackerspace_token');
    if (savedUser && savedToken) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const msg = (await res.json())?.message ?? 'Login fallito';
      throw new Error(msg);
    }

    const { token, user } = await res.json();
    localStorage.setItem('hackerspace_token', token);
    localStorage.setItem('hackerspace_user', JSON.stringify(user));
    setUser(user);
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
      const msg = (await res.json())?.message ?? 'Registrazione fallita';
      throw new Error(msg);
    }

    const { token, user } = await res.json();
    localStorage.setItem('hackerspace_token', token);
    localStorage.setItem('hackerspace_user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('hackerspace_token');
    localStorage.removeItem('hackerspace_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
