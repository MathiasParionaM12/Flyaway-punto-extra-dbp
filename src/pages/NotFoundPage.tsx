import { Link } from 'react-router-dom';
import { EmptyState } from '../components/Feedback';

export default function NotFoundPage() {
  return (
    <div className="container page">
      <EmptyState title="Esta página no existe">
        <Link className="btn btn-primary btn-sm" to="/">
          Ir a buscar vuelos
        </Link>
      </EmptyState>
    </div>
  );
}
