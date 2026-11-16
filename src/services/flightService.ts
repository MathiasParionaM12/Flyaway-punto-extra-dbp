import api from './api';
import type { Booking, Flight, SearchFilters } from '../types';

// GET /flights/search (público). Todos los filtros son opcionales.
export async function searchFlights(filters: SearchFilters, signal?: AbortSignal) {
  const res = await api.get<{ items: Flight[] }>('/flights/search', {
    signal,
    params: {
      flightNumber: filters.flightNumber.trim() || undefined,
      airlineName: filters.airlineName.trim() || undefined,
      // El input datetime-local da "2026-11-10T05:00"; el backend necesita ISO-8601 (si no, 500).
      estDepartureTimeFrom: filters.from ? new Date(filters.from).toISOString() : undefined,
      estDepartureTimeTo: filters.to ? new Date(filters.to).toISOString() : undefined,
    },
  });
  return res.data.items; // la lista viene dentro de "items"
}

// POST /flights/book (protegido) → 200 { id } (id de la reserva)
export async function bookFlight(flightId: number) {
  const res = await api.post<{ id: number }>('/flights/book', { flightId });
  return res.data.id;
}

// GET /flights/book/{id} (protegido) → detalle de la reserva
export async function getBooking(id: number) {
  const res = await api.get<Booking>(`/flights/book/${id}`);
  return res.data;
}
