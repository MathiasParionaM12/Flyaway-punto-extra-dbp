// El backend no tiene un endpoint para listar "mis reservas", así que guardamos
// los IDs en localStorage, una lista por usuario: bookings:<email> → [1, 4, 9]

function storageKey(email: string) {
  return `bookings:${email}`;
}

export function getSavedBookingIds(email: string): number[] {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(email)) ?? '[]');
    return Array.isArray(saved) ? saved.filter((id) => Number.isInteger(id)) : [];
  } catch {
    return []; // si el JSON está corrupto empezamos de cero
  }
}

export function saveBookingId(email: string, id: number) {
  const ids = getSavedBookingIds(email);
  if (!ids.includes(id)) {
    localStorage.setItem(storageKey(email), JSON.stringify([...ids, id]));
  }
}

export function forgetBookingIds(email: string, idsToRemove: number[]) {
  if (idsToRemove.length === 0) return;
  const ids = getSavedBookingIds(email).filter((id) => !idsToRemove.includes(id));
  localStorage.setItem(storageKey(email), JSON.stringify(ids));
}
