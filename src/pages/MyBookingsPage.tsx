import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMyBookings } from '../hooks/useMyBookings';
import DateCell from '../components/DateCell';
import { Alert, EmptyState, Spinner } from '../components/Feedback';
import { isPast } from '../utils/format';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const { bookings, isLoading, serverDown, removedCount, reload } = useMyBookings(user);

  return (
    <section className="container page">
      <div className="page-head">
        <div>
          <h1>Mis reservas</h1>
          <p className="muted">Las reservas que hiciste con esta cuenta desde este navegador.</p>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={isLoading}
          onClick={reload}
        >
          Actualizar
        </button>
      </div>

      {serverDown && (
        <Alert>
          No pudimos consultar algunas reservas porque el servidor no responde.{' '}
          <button type="button" className="link-button" onClick={reload}>
            Volver a intentar
          </button>
        </Alert>
      )}

      {removedCount > 0 && (
        <Alert type="info">
          Quitamos {removedCount}{' '}
          {removedCount === 1 ? 'reserva que ya no existe' : 'reservas que ya no existen'} en el
          servidor. Los datos del backend de prueba se borran al reiniciarlo.
        </Alert>
      )}

      {isLoading && <Spinner text="Cargando tus reservas…" />}

      {!isLoading && bookings.length === 0 && !serverDown && (
        <EmptyState title="Todavía no tienes reservas">
          <p>Cuando reserves un vuelo aparecerá aquí.</p>
          <Link className="btn btn-primary btn-sm" to="/">
            Buscar vuelos
          </Link>
        </EmptyState>
      )}

      {!isLoading && bookings.length > 0 && (
        <div className="table-card">
          <table className="flights bookings">
            <caption className="sr-only">Tus reservas</caption>
            <thead>
              <tr>
                <th scope="col">Reserva</th>
                <th scope="col">Vuelo</th>
                <th scope="col">Aerolínea</th>
                <th scope="col">Salida</th>
                <th scope="col">Estado</th>
                <th scope="col">
                  <span className="sr-only">Acción</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const done = isPast(booking.estDepartureTime);
                return (
                  <tr key={booking.id} className={done ? 'is-past' : undefined}>
                    <td data-label="Reserva" className="mono">
                      #{booking.id}
                    </td>
                    <td data-label="Vuelo">
                      <span className="flight-code">{booking.flightNumber}</span>
                    </td>
                    <td data-label="Aerolínea">{booking.airlineName}</td>
                    <td data-label="Salida">
                      <DateCell value={booking.estDepartureTime} />
                    </td>
                    <td data-label="Estado">
                      <span className={done ? 'tag' : 'tag tag-ok'}>
                        {done ? 'Realizado' : 'Próximo'}
                      </span>
                    </td>
                    <td className="action">
                      <Link className="btn btn-outline btn-sm" to={`/reservas/${booking.id}`}>
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
