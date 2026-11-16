import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Logo } from './Logo';

export default function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const initials = user ? (user.firstName[0] + user.lastName[0]).toUpperCase() : '';

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />

        <nav className="main-nav" aria-label="Navegación principal">
          <NavLink to="/" end>
            Buscar vuelos
          </NavLink>
          {user && <NavLink to="/reservas">Mis reservas</NavLink>}
        </nav>

        <div className="account">
          {isLoading && <span className="muted">Cargando sesión…</span>}

          {!isLoading && user && (
            <>
              {/* Nombre del usuario autenticado (GET /users/current) */}
              <span className="user-chip" title={user.email}>
                <span className="avatar" aria-hidden="true">
                  {initials}
                </span>
                <span className="user-name">
                  {user.firstName} {user.lastName}
                </span>
              </span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
                Cerrar sesión
              </button>
            </>
          )}

          {!isLoading && !user && (
            <>
              <NavLink className="btn btn-ghost btn-sm" to="/login">
                Iniciar sesión
              </NavLink>
              <Link className="btn btn-primary btn-sm" to="/registro">
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
