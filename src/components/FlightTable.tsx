import { Link } from 'react-router-dom';
import { formatDuration, isPast } from '../utils/format';
import type { Flight } from '../types';
import DateCell from './DateCell';

interface Props {
  flights: Flight[];
  isLoggedIn: boolean;
  onReserve: (flight: Flight) => void;
}

export default function FlightTable({ flights, isLoggedIn, onReserve }: Props) {
  return (
    <div className="table-card">
      <table className="flights">
        <caption className="sr-only">Vuelos encontrados. Horas en tu zona horaria.</caption>
        <thead>
          <tr>
            <th scope="col">Vuelo</th>
            <th scope="col">Aerolínea</th>
            <th scope="col">Salida</th>
            <th scope="col">Llegada</th>
            <th scope="col">Duración</th>
            <th scope="col" className="num">
              Asientos
            </th>
            <th scope="col">
              <span className="sr-only">Acción</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {flights.map((flight) => (
            <FlightRow
              key={flight.id}
              flight={flight}
              isLoggedIn={isLoggedIn}
              onReserve={onReserve}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FlightRow({
  flight,
  isLoggedIn,
  onReserve,
}: {
  flight: Flight;
  isLoggedIn: boolean;
  onReserve: (flight: Flight) => void;
}) {
  const departed = isPast(flight.estDepartureTime);
  const soldOut = flight.availableSeats < 1;

  return (
    <tr className={departed ? 'is-past' : undefined}>
      <td data-label="Vuelo">
        <span className="flight-code">{flight.flightNumber}</span>
        {departed && <span className="tag">Ya despegó</span>}
      </td>
      <td data-label="Aerolínea">{flight.airlineName}</td>
      <td data-label="Salida">
        <DateCell value={flight.estDepartureTime} />
      </td>
      <td data-label="Llegada">
        <DateCell value={flight.estArrivalTime} />
      </td>
      <td data-label="Duración" className="muted">
        {formatDuration(flight.estDepartureTime, flight.estArrivalTime)}
      </td>
      <td data-label="Asientos" className="num">
        {soldOut ? (
          <span className="tag tag-danger">Agotado</span>
        ) : (
          <span className={flight.availableSeats <= 10 ? 'seats-low' : undefined}>
            {flight.availableSeats}
          </span>
        )}
      </td>
      <td className="action">
        {/* El botón Reservar solo existe si hay sesión iniciada */}
        {isLoggedIn ? (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={soldOut}
            aria-label={`Reservar vuelo ${flight.flightNumber}`}
            onClick={() => onReserve(flight)}
          >
            Reservar
          </button>
        ) : (
          <Link className="btn btn-ghost btn-sm" to="/login" state={{ from: '/' }}>
            Inicia sesión
          </Link>
        )}
      </td>
    </tr>
  );
}
