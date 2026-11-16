import { useEffect, useState } from 'react';
import { getBooking } from '../services/flightService';
import { getErrorMessage, getStatus } from '../services/errors';
import { saveBookingId } from '../utils/bookingStorage';
import type { Booking, User } from '../types';

// Custom hook: trae el detalle de una reserva (GET /flights/book/{id}).
export function useBookingDetail(id: string | undefined, user: User | null) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let ignore = false;
    setBooking(null);
    setError('');
    setIsLoading(true);

    async function load() {
      if (!id || !/^[1-9]\d*$/.test(id)) throw new Error('El número de reserva no es válido.');
      try {
        const data = await getBooking(Number(id));
        if (data.customerId !== user!.id) throw new Error('Esta reserva no pertenece a tu cuenta.');
        return data;
      } catch (err) {
        // Cuando la reserva no existe el backend responde 500.
        if ((getStatus(err) ?? 0) >= 500) {
          throw new Error(
            `No encontramos la reserva #${id}. Puede que el servidor se haya reiniciado.`,
          );
        }
        throw err;
      }
    }

    load()
      .then((data) => {
        if (ignore) return;
        saveBookingId(user.email, data.id); // por si se abrió el link directamente
        setBooking(data);
      })
      .catch((err) => {
        if (!ignore) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id, user, reloadCount]);

  return { booking, isLoading, error, reload: () => setReloadCount((n) => n + 1) };
}
