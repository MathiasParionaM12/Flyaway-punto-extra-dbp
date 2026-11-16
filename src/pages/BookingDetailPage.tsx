import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBookingDetail } from '../hooks/useBookingDetail';
import { Alert, Spinner } from '../components/Feedback';
import {
  formatDateTime,
  formatDuration,
  formatLongDate,
  formatTime,
  isPast,
} from '../utils/format';

export default function BookingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { booking, isLoading, error, reload } = useBookingDetail(id, user);

  return (
    <section className="container page narrow">
      <Link className="back-link" to="/reservas">
        ← Mis reservas
      </Link>

      {isLoading && <Spinner text="Cargando la reserva…" />}

      {!isLoading && error && (
        <Alert title="No se pudo mostrar la reserva">
          <p>{error}</p>
          <button type="button" className="link-button" onClick={reload}>
            Volver a intentar
          </button>
        </Alert>
      )}

      {!isLoading && booking && (
        <article className="ticket">
          <header className="ticket-head">
            <div>
              <span className="ticket-label">Reserva</span>
              <h1 className="mono">#{booking.id}</h1>
            </div>
            {isPast(booking.estDepartureTime) ? (
              <span className="tag">Vuelo realizado</span>
            ) : (
              <span className="tag tag-ok">Confirmada</span>
            )}
          </header>

          <div className="ticket-route">
            <div>
              <span className="ticket-label">Salida</span>
              <time dateTime={booking.estDepartureTime} className="ticket-time">
                <strong>{formatTime(booking.estDepartureTime)}</strong>
                <span>{formatLongDate(booking.estDepartureTime)}</span>
              </time>
            </div>
            <div className="ticket-line">
              <span>
                <span className="sr-only">Duración: </span>
                {formatDuration(booking.estDepartureTime, booking.estArrivalTime)}
              </span>
            </div>
            <div>
              <span className="ticket-label">Llegada</span>
              <time dateTime={booking.estArrivalTime} className="ticket-time">
                <strong>{formatTime(booking.estArrivalTime)}</strong>
                <span>{formatLongDate(booking.estArrivalTime)}</span>
              </time>
            </div>
          </div>

          <dl className="summary ticket-grid">
            <div>
              <dt>Vuelo</dt>
              <dd>
                <span className="flight-code">{booking.flightNumber}</span>
              </dd>
            </div>
            <div>
              <dt>Aerolínea</dt>
              <dd>{booking.airlineName}</dd>
            </div>
            <div>
              <dt>Pasajero</dt>
              <dd>
                {booking.customerFirstName} {booking.customerLastName}
              </dd>
            </div>
            <div>
              <dt>Reservado el</dt>
              <dd>{formatDateTime(booking.bookingDate)}</dd>
            </div>
          </dl>

          <footer className="ticket-actions">
            <Link className="btn btn-primary" to="/">
              Buscar más vuelos
            </Link>
            <Link className="btn btn-ghost" to="/reservas">
              Ver todas mis reservas
            </Link>
          </footer>
        </article>
      )}
    </section>
  );
}
