import axios from 'axios';
import { API_URL } from './api';

// Mensajes que manda el backend en `detail` y cómo los mostramos en español.
const MESSAGES: Record<string, string> = {
  'Cannot book a past flight': 'Este vuelo ya despegó, no se puede reservar.',
  'Overlapping flight found':
    'Ya tienes una reserva en otro vuelo con un horario que se cruza con este.',
  'Username already exists': 'Ya existe una cuenta con ese correo.',
  'Username does not exist': 'Correo o contraseña incorrectos.',
  'password: must be at least 8 characters': 'La contraseña debe tener al menos 8 caracteres.',
  'password: must contain at least one uppercase letter and one digit':
    'La contraseña debe tener al menos una mayúscula y un número.',
  'firstName: must start with an uppercase letter': 'El nombre debe empezar con mayúscula.',
  'lastName: must start with an uppercase letter': 'El apellido debe empezar con mayúscula.',
  'email: must be a valid email': 'El correo no es válido.',
};

/** Texto original que devolvió el backend (ProblemDetail.detail). */
export function getBackendDetail(err: unknown): string {
  if (axios.isAxiosError(err) && typeof err.response?.data?.detail === 'string') {
    return err.response.data.detail;
  }
  return '';
}

export function getStatus(err: unknown): number | undefined {
  return axios.isAxiosError(err) ? err.response?.status : undefined;
}

/** Mensaje para mostrar al usuario a partir de cualquier error. */
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return `No se pudo conectar con el servidor (${API_URL}). Verifica que el backend esté encendido.`;
    }
    if (err.response.status === 403) return 'Tu sesión expiró. Inicia sesión de nuevo.';
    const detail = getBackendDetail(err);
    if (detail) {
      // Las validaciones vienen juntas: "password: ...; firstName: ..."
      return detail
        .split('; ')
        .map((part) => MESSAGES[part] ?? part)
        .join(' ');
    }
    return `El servidor respondió con un error (${err.response.status}).`;
  }
  if (err instanceof Error) return err.message;
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}
