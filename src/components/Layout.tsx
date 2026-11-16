import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="app">
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido" className="main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <span>Fly Away Travel</span>
          <span className="muted">CS2031 · Desarrollo Basado en Plataformas · UTEC</span>
        </div>
      </footer>
    </div>
  );
}
