import { useId, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  error?: string;
  hint?: ReactNode;
  isPassword?: boolean; // agrega el botón Mostrar/Ocultar
}

export default function FormField({ label, error, hint, isPassword, type, ...inputProps }: Props) {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);

  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : '', hint ? hintId : ''].join(' ').trim();

  let inputType = type;
  if (isPassword) inputType = showPassword ? 'text' : 'password';

  return (
    <div className={error ? 'field has-error' : 'field'}>
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <input
          id={id}
          type={inputType}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            className="reveal"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
      {hint && (
        <div id={hintId} className="field-hint">
          {hint}
        </div>
      )}
    </div>
  );
}
