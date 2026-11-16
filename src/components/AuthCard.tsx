import type { ReactNode } from 'react';
import { LogoMark } from './Logo';

interface Props {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}

// Tarjeta centrada que comparten Login y Registro.
export default function AuthCard({ title, subtitle, footer, children }: Props) {
  return (
    <div className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-head">
          <LogoMark size={40} />
          <h1 id="auth-title">{title}</h1>
          <p className="muted">{subtitle}</p>
        </div>
        {children}
        <div className="auth-footer">{footer}</div>
      </section>
    </div>
  );
}
