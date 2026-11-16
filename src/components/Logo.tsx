import { useId } from 'react';
import { Link } from 'react-router-dom';

// Ave del logo de Fly Away (azules + borde naranja).
export function LogoMark({ size = 34 }: { size?: number }) {
  const gradientId = useId(); // id único: el logo aparece varias veces en la página
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7cc8ee" />
          <stop offset="0.55" stopColor="#1f7fd0" />
          <stop offset="1" stopColor="#23308f" />
        </linearGradient>
      </defs>
      <path
        d="M3 7c11 .6 19.5 5.6 23.6 14.2C23 29.5 16.6 34.4 8.6 36.6c7.5-5.6 10.6-11.4 9.4-17.2C16.4 13.6 10.6 9.6 3 7Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M9.5 13.4c5.6 1.2 9.8 4.2 11.3 9.4-1.6 4.4-4.6 7.6-8.4 9.8 3-3.8 4.2-7.6 3.4-11.4-.9-3.6-3-5.9-6.3-7.8Z"
        fill="#1b2a85"
        opacity=".55"
      />
      <path
        d="M3 6.2c11.5.5 20 5.5 24.2 14"
        fill="none"
        stroke="#f3a43b"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M26.6 21.2c1.8-4.6 5.4-6.6 10.4-5.6-3.6 1-5.8 3-6.8 6.2l-3.6-.6Z" fill="#1f7fd0" />
      <path
        d="M28.2 16.4c2.4-1.6 5-2 8.8-.8"
        fill="none"
        stroke="#f3a43b"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <Link to="/" className="brand" aria-label="Fly Away Travel, ir al inicio">
      <LogoMark />
      <span className="brand-text">
        <span className="brand-name">FLY AWAY</span>
        <span className="brand-sub">TRAVEL</span>
      </span>
    </Link>
  );
}
