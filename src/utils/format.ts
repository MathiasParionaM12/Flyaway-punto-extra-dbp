// Formatos de fecha/hora en español (Perú). El backend manda ISO-8601 con zona horaria.
const LOCALE = 'es-PE';

// 19:05
export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
}

// mar, 17 nov.
export function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(LOCALE, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

// martes, 17 de noviembre de 2026
export function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// 17 de noviembre de 2026, 19:05
export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
}

// 5 h / 2 h 30 min
export function formatDuration(departure: string, arrival: string) {
  const minutes = Math.round((new Date(arrival).getTime() - new Date(departure).getTime()) / 60000);
  if (!Number.isFinite(minutes) || minutes <= 0) return '—';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function isPast(iso: string) {
  return new Date(iso).getTime() < Date.now();
}
