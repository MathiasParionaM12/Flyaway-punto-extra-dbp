import { formatShortDate, formatTime } from '../utils/format';

// Hora grande + fecha corta debajo (se usa en las tablas).
export default function DateCell({ value }: { value: string }) {
  return (
    <time dateTime={value} className="when">
      <strong>{formatTime(value)}</strong>
      <span>{formatShortDate(value)}</span>
    </time>
  );
}
