import { useEffect, useState } from 'react';
import { getBooking } from '../services/flightService';
import { getStatus } from '../services/errors';
import { forgetBookingIds, getSavedBookingIds } from '../utils/bookingStorage';
import { isPast } from '../utils/format';
import type { Booking, User } from '../types';

function sortBookings(bookings: Booking[]) {
  const time = (b: Booking) => new Date(b.estDepartureTime).getTime();
  const upcoming = bookings.filter((b) => !isPast(b.estDepartureTime));
  const past = bookings.filter((b) => isPast(b.estDepartureTime));
  upcoming.sort((a, b) => time(a) - time(b)); // próximas: la más cercana primero
  past.sort((a, b) => time(b) - time(a)); // realizadas: la más reciente primero
  return [...upcoming, ...past];
}

// Custom hook: carga las reservas cuyos IDs guardamos en localStorage.
export function useMyBookings(user: User | null) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serverDown, setServerDown] = useState(false);
  const [removedCount, setRemovedCount] = useState(0);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let ignore = false;
    const ids = getSavedBookingIds(user.email);
    setIsLoading(true);
    setServerDown(false);

    // allSettled: si una reserva falla, las demás igual se muestran.
    Promise.allSettled(ids.map((id) => getBooking(id))).then((results) => {
      if (ignore) return;
      const mine: Booking[] = [];
      const missing: number[] = [];
      let networkError = false;

      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          // El backend le devuelve cualquier reserva a cualquier usuario: filtramos por dueño.
          if (result.value.customerId === user.id) mine.push(result.value);
          else missing.push(ids[i]);
          return;
        }
        const status = getStatus(result.reason);
        if (status === undefined) {
          networkError = true; // no hubo respuesta del servidor
        } else if (status !== 403) {
          missing.push(ids[i]); // ya no existe (por ejemplo, se reinició H2)
        }
      });

      forgetBookingIds(user.email, missing);
      setRemovedCount(missing.length);
      setBookings(sortBookings(mine));
      setServerDown(networkError);
      setIsLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [user, reloadCount]);

  return {
    bookings,
    isLoading,
    serverDown,
    removedCount,
    reload: () => setReloadCount((n) => n + 1),
  };
}
