import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { registerUser } from '../services/authService';
import AuthCard from '../components/AuthCard';
import FormField from '../components/FormField';
import { Alert, ErrorAlert, Spinner } from '../components/Feedback';
import { PASSWORD_RULES, REQUIRED, validateRegister } from '../utils/validation';
import type { RegisterErrors } from '../utils/validation';
import type { RegisterRequest } from '../types';

const INITIAL_FORM: RegisterRequest = { firstName: '', lastName: '', email: '', password: '' };

export default function RegisterPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const from: string | undefined = useLocation().state?.from;

  const [form, setForm] = useState<RegisterRequest>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<RegisterErrors>({});
  const [error, setError] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // Después de registrarse: mostramos el éxito un momento y mandamos al login.
  useEffect(() => {
    if (!isRegistered) return;
    const timer = setTimeout(() => {
      navigate('/login', {
        replace: true,
        state: { registered: true, email: form.email.trim(), from },
      });
    }, 1500);
    return () => clearTimeout(timer); // cleanup si el componente se desmonta antes
  }, [isRegistered, navigate, form.email, from]);

  if (isLoading) return <Spinner text="Recuperando tu sesión…" />;
  if (user && !isRegistered) return <Navigate to="/" replace />;

  function handleChange(field: keyof RegisterRequest, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // 1. Validamos en el frontend (campos vacíos, formato) antes de llamar a la API.
    const errors = validateRegister(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      const formEl = e.currentTarget;
      requestAnimationFrame(() =>
        formEl.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }

    // 2. POST /users/register
    setIsSubmitting(true);
    try {
      await registerUser({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setIsRegistered(true);
    } catch (err) {
      setError(err); // contraseña débil, email en uso…
      setIsSubmitting(false);
    }
  }

  const hasEmptyFields = Object.values(fieldErrors).includes(REQUIRED);

  return (
    <AuthCard
      title="Crear cuenta"
      subtitle="Regístrate para reservar vuelos y ver tus reservas."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" state={{ from }}>
            Inicia sesión
          </Link>
        </>
      }
    >
      {isRegistered && (
        <Alert type="success" title="Cuenta creada">
          Te llevamos al inicio de sesión…
        </Alert>
      )}
      {hasEmptyFields && <Alert>Completa todos los campos antes de continuar.</Alert>}
      {error !== null && <ErrorAlert error={error} />}

      <form className="form" noValidate onSubmit={handleSubmit}>
        <div className="form-row">
          <FormField
            label="Nombre"
            name="firstName"
            autoComplete="given-name"
            placeholder="Ana"
            disabled={isRegistered}
            value={form.firstName}
            error={fieldErrors.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
          />
          <FormField
            label="Apellido"
            name="lastName"
            autoComplete="family-name"
            placeholder="Garcia"
            disabled={isRegistered}
            value={form.lastName}
            error={fieldErrors.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
          />
        </div>
        <FormField
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nombre@correo.com"
          disabled={isRegistered}
          value={form.email}
          error={fieldErrors.email}
          onChange={(e) => handleChange('email', e.target.value)}
        />
        <FormField
          label="Contraseña"
          name="password"
          isPassword
          autoComplete="new-password"
          disabled={isRegistered}
          value={form.password}
          error={fieldErrors.password}
          onChange={(e) => handleChange('password', e.target.value)}
          hint={<PasswordChecklist password={form.password} />}
        />
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={isSubmitting || isRegistered}
        >
          {isSubmitting && !isRegistered ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
    </AuthCard>
  );
}

// Lista que se va marcando mientras el usuario escribe la contraseña.
function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="rules" aria-label="Requisitos de la contraseña">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.check(password);
        return (
          <li key={rule.label} className={ok ? 'ok' : ''}>
            <span aria-hidden="true">{ok ? '✓' : '·'}</span>
            {rule.label}
            <span className="sr-only">{ok ? ' (cumplido)' : ' (pendiente)'}</span>
          </li>
        );
      })}
    </ul>
  );
}
