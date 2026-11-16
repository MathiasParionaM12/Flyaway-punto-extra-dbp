import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, loginUser } from '../services/authService';
import { getErrorMessage } from '../services/errors';
import type { User } from '../types';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean; // true mientras se recupera la sesión guardada
  sessionError: string; // sesión expirada, servidor apagado, etc.
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  reloadUser: () => void;
}

// El contexto se crea fuera del componente; se lee con el hook useAuth().
export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(() => localStorage.getItem('token') !== null);
  const [sessionError, setSessionError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);

  // Mounting (y cada vez que se pide recargar): si hay token, traemos el usuario actual.
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setIsLoading(false);
      return;
    }
    let ignore = false;
    setIsLoading(true);

    getCurrentUser()
      .then((me) => {
        if (ignore) return;
        setUser(me);
        setSessionError('');
      })
      .catch((err) => {
        if (!ignore) setSessionError(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    // Cleanup: si el componente se desmonta, ignoramos la respuesta.
    return () => {
      ignore = true;
    };
  }, [reloadCount]);

  // Escuchamos el evento que dispara el interceptor de axios ante un 403,
  // y los cambios del token hechos en otra pestaña.
  useEffect(() => {
    function handleExpired() {
      setUser(null);
      setSessionError('Tu sesión expiró. Inicia sesión de nuevo.');
      navigate('/login', { replace: true });
    }
    function handleStorage(e: StorageEvent) {
      if (e.key !== 'token') return;
      setUser(null);
      setReloadCount((n) => n + 1);
    }
    window.addEventListener('session-expired', handleExpired);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('session-expired', handleExpired);
      window.removeEventListener('storage', handleStorage);
    };
  }, [navigate]);

  async function login(email: string, password: string) {
    const token = await loginUser(email, password);
    localStorage.setItem('token', token);
    try {
      setUser(await getCurrentUser());
      setSessionError('');
    } catch (err) {
      localStorage.removeItem('token');
      throw err;
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    setSessionError('');
    navigate('/login');
  }

  const value: AuthContextType = {
    user,
    isLoading,
    sessionError,
    login,
    logout,
    reloadUser: () => setReloadCount((n) => n + 1),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
