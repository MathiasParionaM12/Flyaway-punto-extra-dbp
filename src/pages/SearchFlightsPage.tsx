import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { EMPTY_FILTERS, useFlightSearch } from '../hooks/useFlightSearch';
import SearchForm, { hasFilters } from '../components/SearchForm';
import FlightTable from '../components/FlightTable';
import BookingDialog from '../components/BookingDialog';
import { Alert, EmptyState, Spinner } from '../components/Feedback';
import { formatShortDate, formatTime } from '../utils/format';
import type { Flight } from '../types';

interface LastBooking {
  id: number;
  flight: Flight;
}

export default function SearchFlightsPage() {
  const { user } = useAuth();
  const { filters, flights, isLoading, error, search, refresh } = useFlightSearch();
  const [flightToBook, setFlightToBook] = useState<Flight | null>(null);
  const [lastBooking, setLastBooking] = useState<LastBooking | null>(null);
  const [formKey, setFormKey] = useState(0); // cambiarlo reinicia los inputs del form
  const successRef = useRef<HTMLDivElement>(null);

  // Cuando se confirma una reserva llevamos la vista al mensaje de éxito.
  useEffect(() => {
    if (lastBooking) successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [lastBooking]);

  function handleBooked(id: number, flight: Flight) {
    setFlightToBook(null);
    setLastBooking({ id, flight });
    void refresh(); // para que se actualicen los asientos disponibles
  }

  function showAllFlights() {
    setFormKey((k) => k + 1);
    void search(EMPTY_FILTERS);
  }

  const total = flights.length;

  return (
    <>
      <section className="search-hero">
        <div className="container">
          <h1>Buscar vuelos</h1>
          <p>
            Filtra por número de vuelo, aerolínea o fecha de salida. Todos los campos son
            opcionales.
          </p>
          <SearchForm
            key={formKey}
            initialFilters={filters}
            isLoading={isLoading}
            onSearch={search}
          />
        </div>
      </section>

      <section className="container results" aria-live="polite">
        {lastBooking && (
          <div ref={successRef}>
            <Alert type="success" title={`Reserva #${lastBooking.id} confirmada`}>
              <p>
                {lastBooking.flight.flightNumber} · {lastBooking.flight.airlineName} · sale el{' '}
                {formatShortDate(lastBooking.flight.estDepartureTime)} a las{' '}
                {formatTime(lastBooking.flight.estDepartureTime)}.
              </p>
              <p className="notice-links">
                <Link to={`/reservas/${lastBooking.id}`}>
                  Ver detalle de la reserva #{lastBooking.id}
                </Link>
                <Link to="/reservas">Ir a Mis reservas</Link>
              </p>
            </Alert>
          </div>
        )}

        {!user && (
          <Alert type="info">
            Para reservar necesitas una cuenta. <Link to="/login">Inicia sesión</Link> o{' '}
            <Link to="/registro">regístrate</Link>.
          </Alert>
        )}

        <div className="results-head">
          <h2>{isLoading ? 'Buscando…' : `${total} ${total === 1 ? 'vuelo' : 'vuelos'}`}</h2>
          <span className="muted">Ordenados por hora de salida · horas en tu zona horaria</span>
        </div>

        {error && (
          <Alert title="No se pudo cargar la búsqueda">
            <p>{error}</p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => void refresh()}>
              Volver a intentar
            </button>
          </Alert>
        )}

        {!error && isLoading && total === 0 && <Spinner text="Buscando vuelos…" />}

        {!error && !isLoading && total === 0 && (
          <EmptyState title="No encontramos vuelos con esos filtros">
            <p>Revisa el número de vuelo o prueba con otra aerolínea o rango de fechas.</p>
            {hasFilters(filters) && (
              <button type="button" className="btn btn-outline btn-sm" onClick={showAllFlights}>
                Ver todos los vuelos
              </button>
            )}
          </EmptyState>
        )}

        {!error && total > 0 && (
          <div className={isLoading ? 'is-refreshing' : undefined}>
            <FlightTable flights={flights} isLoggedIn={!!user} onReserve={setFlightToBook} />
          </div>
        )}
      </section>

      {flightToBook && (
        <BookingDialog
          flight={flightToBook}
          onClose={() => setFlightToBook(null)}
          onBooked={handleBooked}
        />
      )}
    </>
  );
}
