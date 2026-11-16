import type { ReactNode } from 'react';
import { getBackendDetail, getErrorMessage } from '../services/errors';

type AlertType = 'error' | 'success' | 'info';

const ICONS: Record<AlertType, string> = { error: '!', success: '✓', info: 'i' };

interface AlertProps {
  type?: AlertType;
  title?: string;
  /** Texto original del backend: se muestra en pequeño debajo del mensaje. */
  detail?: string;
  children?: ReactNode;
}

export function Alert({ type = 'error', title, detail, children }: AlertProps) {
  return (
    <div className={`notice notice-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span className="notice-icon" aria-hidden="true">
        {ICONS[type]}
      </span>
      <div className="notice-body">
        {title && <strong>{title}</strong>}
        {children}
        {detail && <small className="notice-detail">Respuesta del servidor: {detail}</small>}
      </div>
    </div>
  );
}

/** Alerta de error armada directamente desde el error de axios. */
export function ErrorAlert({ error, title }: { error: unknown; title?: string }) {
  const message = getErrorMessage(error);
  const detail = getBackendDetail(error);
  return (
    <Alert title={title} detail={detail !== message ? detail : undefined}>
      {message}
    </Alert>
  );
}

export function Spinner({ text = 'Cargando…' }: { text?: string }) {
  return (
    <div className="loading" role="status">
      <span className="spinner" aria-hidden="true" />
      {text}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <svg width="44" height="44" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M2.5 19h19M3.5 13.5l3 .5 2.6-2.4-4.2-5 1.8-.6 6.4 3.9 4.4-2.7c1.2-.7 2.6-.4 3 .4.3.8-.3 1.8-1.4 2.4L7.9 15.6 3.5 13.5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
      <h3>{title}</h3>
      {children && <div className="empty-body">{children}</div>}
    </div>
  );
}
