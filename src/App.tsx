import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchFlightsPage from './pages/SearchFlightsPage';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingDetailPage from './pages/BookingDetailPage';
import NotFoundPage from './pages/NotFoundPage';

// Flujo: Registro → Login → Búsqueda → Reserva → Mis reservas
export default function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider va dentro del router porque usa useNavigate */}
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            {/* Públicas */}
            <Route path="/" element={<SearchFlightsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />

            {/* Protegidas: sin token redirigen a /login */}
            <Route
              path="/reservas"
              element={
                <ProtectedRoute>
                  <MyBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reservas/:id"
              element={
                <ProtectedRoute>
                  <BookingDetailPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
