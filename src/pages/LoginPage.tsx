import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthCard from '../components/AuthCard';
import FormField from '../components/FormField';
import { Alert, ErrorAlert, Spinner } from '../components/Feedback';

const DEMO_ACCOUNT = { email: 'ana.garcia@utec.edu.pe', password: 'Password1' };

// Lo que pueden mandarnos otras páginas al redirigir aquí.
interface LocationState {
  from?: string; // ruta protegida a la que se quería entrar
  registered?: boolean; // viene del registro
  email?: string;
}

export default function LoginPage() {
  const { user, isLoading, sessionError, login } = useAuth();
  const navigate = useNavigate();
  const state: LocationState = useLocation().state ?? {};
  // Solo aceptamos rutas internas para el redirect.
  const redirectTo = state.from?.startsWith('/') && !state.from.startsWith('//') ? state.from : '/';

  const [email, setEmail] = useState(state.email ?? '');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) return <Spinner text="Recuperando tu sesión…" />;
  if (user) return <Navigate to={redirectTo} replace />;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const errors: typeof fieldErrors = {};
    if (!email.trim()) errors.email = 'Ingresa tu correo.';
    if (!password) errors.password = 'Ingresa tu contraseña.';
    setFieldErrors(errors);
    if (errors.email || errors.password) return;

    setIsSubmitting(true);
    try {
      await login(email.trim(), password); // guarda el token en localStorage
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err);
      setIsSubmitting(false);
    }
  }

  function fillDemoAccount() {
    setEmail(DEMO_ACCOUNT.email);
    setPassword(DEMO_ACCOUNT.password);
    setFieldErrors({});
  }

  return (
    <AuthCard
      title="Iniciar sesión"
      subtitle="Ingresa con tu cuenta para reservar vuelos."
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" state={{ from: redirectTo }}>
            Regístrate
          </Link>
        </>
      }
    >
      {state.registered && error === null && (
        <Alert type="success" title="Cuenta creada">
          Ya puedes iniciar sesión con tu correo y contraseña.
        </Alert>
      )}
      {error !== null && <ErrorAlert error={error} />}
      {error === null && sessionError && <Alert>{sessionError}</Alert>}

      <form className="form" noValidate onSubmit={handleSubmit}>
        <FormField
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nombre@correo.com"
          autoFocus={!state.email}
          value={email}
          error={fieldErrors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFieldErrors((prev) => ({ ...prev, email: undefined }));
          }}
        />
        <FormField
          label="Contraseña"
          name="password"
          isPassword
          autoComplete="current-password"
          autoFocus={!!state.email}
          value={password}
          error={fieldErrors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            setFieldErrors((prev) => ({ ...prev, password: undefined }));
          }}
        />
        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
          {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
        </button>
      </form>

      <div className="demo-box">
        <div>
          <strong>Cuenta de prueba</strong>
          <span>
            {DEMO_ACCOUNT.email} · {DEMO_ACCOUNT.password}
          </span>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={fillDemoAccount}>
          Usar
        </button>
      </div>
    </AuthCard>
  );
}
