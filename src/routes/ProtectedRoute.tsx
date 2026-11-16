import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Alert, Spinner } from '../components/Feedback';

// Envuelve las páginas que necesitan sesión: sin token → /login.
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading, sessionError, reloadUser } = useAuth();
  const location = useLocation();

  if (isLoading) return <Spinner text="Verificando tu sesión…" />;

  // Hay token pero el servidor no respondió: dejamos reintentar en vez de botar al usuario.
  if (!user && sessionError && localStorage.getItem('token')) {
    return (
      <div className="container page narrow">
        <Alert title="No pudimos verificar tu sesión">
          <p>{sessionError}</p>
          <button type="button" className="link-button" onClick={reloadUser}>
            Reintentar
          </button>
        </Alert>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return children;
}
