import type { RegisterRequest } from '../types';

export type RegisterErrors = Partial<Record<keyof RegisterRequest, string>>;

export const REQUIRED = 'Este campo es obligatorio.';

// Reglas de contraseña del backend (UserRegisterDTO + UserService).
export const PASSWORD_RULES = [
  { label: 'Al menos 8 caracteres', check: (pwd: string) => pwd.length >= 8 },
  { label: 'Una letra mayúscula', check: (pwd: string) => /[A-Z]/.test(pwd) },
  { label: 'Un número', check: (pwd: string) => /\d/.test(pwd) },
];

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validateName(value: string, field: string) {
  if (!value.trim()) return REQUIRED;
  // El backend usa el regex ^[A-Z].+  (mayúscula sin tilde + al menos 2 letras)
  if (!/^[A-Z].+/.test(value.trim())) {
    return `El ${field} debe empezar con mayúscula (A–Z, sin tilde) y tener al menos 2 letras.`;
  }
  return undefined;
}

// Valida todo antes de enviar el formulario de registro.
export function validateRegister(form: RegisterRequest): RegisterErrors {
  const errors: RegisterErrors = {};

  const firstName = validateName(form.firstName, 'nombre');
  if (firstName) errors.firstName = firstName;

  const lastName = validateName(form.lastName, 'apellido');
  if (lastName) errors.lastName = lastName;

  if (!form.email.trim()) errors.email = REQUIRED;
  else if (!isValidEmail(form.email)) {
    errors.email = 'Ingresa un correo válido, por ejemplo nombre@correo.com.';
  }

  if (!form.password) errors.password = REQUIRED;
  else if (!PASSWORD_RULES.every((rule) => rule.check(form.password))) {
    errors.password = 'La contraseña no cumple los requisitos.';
  }

  return errors;
}
