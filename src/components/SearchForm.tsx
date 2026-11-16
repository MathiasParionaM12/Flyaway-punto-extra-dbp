import { useState } from 'react';
import type { FormEvent } from 'react';
import { EMPTY_FILTERS } from '../hooks/useFlightSearch';
import type { SearchFilters } from '../types';

export function hasFilters(filters: SearchFilters) {
  return Object.values(filters).some((value) => value.trim() !== '');
}

interface Props {
  initialFilters: SearchFilters;
  isLoading: boolean;
  onSearch: (filters: SearchFilters) => void;
}

export default function SearchForm({ initialFilters, isLoading, onSearch }: Props) {
  const [form, setForm] = useState<SearchFilters>(initialFilters);
  const [dateError, setDateError] = useState('');

  function handleChange(field: keyof SearchFilters, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'from' || field === 'to') setDateError('');
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (form.from && form.to && new Date(form.from) > new Date(form.to)) {
      setDateError('La fecha "Desde" debe ser anterior a la fecha "Hasta".');
      return;
    }
    onSearch(form);
  }

  function handleClear() {
    setForm(EMPTY_FILTERS);
    setDateError('');
    onSearch(EMPTY_FILTERS);
  }

  const dateFieldClass = dateError ? 'field has-error' : 'field';

  return (
    <form className="search-form" onSubmit={handleSubmit} noValidate aria-label="Buscar vuelos">
      <div className="search-grid">
        <div className="field">
          <label htmlFor="flightNumber">Número de vuelo</label>
          <input
            id="flightNumber"
            placeholder="LA101"
            autoComplete="off"
            value={form.flightNumber}
            onChange={(e) => handleChange('flightNumber', e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="airlineName">Aerolínea</label>
          <input
            id="airlineName"
            placeholder="LATAM, Avianca…"
            autoComplete="off"
            value={form.airlineName}
            onChange={(e) => handleChange('airlineName', e.target.value)}
          />
        </div>

        <div className={dateFieldClass}>
          <label htmlFor="from">Salida desde</label>
          <input
            id="from"
            type="datetime-local"
            aria-invalid={!!dateError}
            value={form.from}
            onChange={(e) => handleChange('from', e.target.value)}
          />
        </div>

        <div className={dateFieldClass}>
          <label htmlFor="to">Salida hasta</label>
          <input
            id="to"
            type="datetime-local"
            min={form.from || undefined}
            aria-invalid={!!dateError}
            aria-describedby={dateError ? 'date-error' : undefined}
            value={form.to}
            onChange={(e) => handleChange('to', e.target.value)}
          />
        </div>

        <div className="search-actions">
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Buscando…' : 'Buscar vuelos'}
          </button>
          {hasFilters(form) && (
            <button type="button" className="btn btn-ghost" onClick={handleClear}>
              Limpiar
            </button>
          )}
        </div>
      </div>

      {dateError && (
        <p id="date-error" className="field-error" role="alert">
          {dateError}
        </p>
      )}
    </form>
  );
}
