import { useCallback, useEffect, useRef, useState } from 'react';
import { searchFlights } from '../services/flightService';
import { getErrorMessage } from '../services/errors';
import type { Flight, SearchFilters } from '../types';

export const EMPTY_FILTERS: SearchFilters = { flightNumber: '', airlineName: '', from: '', to: '' };

function byDepartureTime(a: Flight, b: Flight) {
  return new Date(a.estDepartureTime).getTime() - new Date(b.estDepartureTime).getTime();
}

// Custom hook: estado de la búsqueda de vuelos (resultados, carga y error).
export function useFlightSearch() {
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const controllerRef = useRef<AbortController | null>(null);

  const search = useCallback(async (newFilters: SearchFilters) => {
    // Si había una búsqueda en curso la cancelamos para no pisar los resultados.
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setFilters(newFilters);
    setError('');
    setIsLoading(true);
    try {
      const items = await searchFlights(newFilters, controller.signal);
      setFlights(items.sort(byDepartureTime));
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(getErrorMessage(err));
      setFlights([]);
    }
    if (!controller.signal.aborted) setIsLoading(false);
  }, []);

  // Al montar la página mostramos todos los vuelos; al desmontar cancelamos.
  useEffect(() => {
    void search(EMPTY_FILTERS);
    return () => controllerRef.current?.abort();
  }, [search]);

  return { filters, flights, isLoading, error, search, refresh: () => search(filters) };
}
