import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { bookFlight } from '../services/flightService';
import { saveBookingId } from '../utils/bookingStorage';
import { formatDateTime, formatDuration } from '../utils/format';
import type { Flight } from '../types';
import { ErrorAlert } from './Feedback';

interface Props {
  flight: Flight;
  onClose: () => void;
  onBooked: (bookingId: number, flight: Flight) => void;
}

// Modal para confirmar la reserva → POST /flights/book
export default function BookingDialog({ flight, onClose, onBooked }: Props) {
  const { user } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // Al montar abrimos el <dialog> nativo (bloquea el fondo y se cierra con Esc).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  async function handleConfirm() {
    if (!user || isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      const bookingId = await bookFlight(flight.id);
      saveBookingId(user.email, bookingId); // para "Mis reservas"
      onBooked(bookingId, flight);
    } catch (err) {
      setError(err); // vuelo pasado, horario superpuesto, etc.
      setIsSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby="booking-title"
      onCancel={(e) => isSaving && e.preventDefault()}
      onClose={onClose}
    >
      <h2 id="booking-title">Confirmar reserva</h2>

      <dl className="summary">
        <div>
          <dt>Vuelo</dt>
          <dd>
            <span className="flight-code">{flight.flightNumber}</span> · {flight.airlineName}
          </dd>
        </div>
        <div>
          <dt>Salida</dt>
          <dd>{formatDateTime(flight.estDepartureTime)}</dd>
        </div>
        <div>
          <dt>Llegada</dt>
          <dd>{formatDateTime(flight.estArrivalTime)}</dd>
        </div>
        <div>
          <dt>Duración</dt>
          <dd>{formatDuration(flight.estDepartureTime, flight.estArrivalTime)}</dd>
        </div>
        <div>
          <dt>Pasajero</dt>
          <dd>
            {user?.firstName} {user?.lastName}
          </dd>
        </div>
      </dl>

      {error !== null && <ErrorAlert error={error} title="No se pudo reservar" />}

      <div className="dialog-actions">
        <button type="button" className="btn btn-ghost" disabled={isSaving} onClick={onClose}>
          {error ? 'Cerrar' : 'Cancelar'}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={isSaving}
          onClick={() => void handleConfirm()}
          autoFocus
        >
          {isSaving ? 'Reservando…' : error ? 'Reintentar' : 'Confirmar reserva'}
        </button>
      </div>
    </dialog>
  );
}
