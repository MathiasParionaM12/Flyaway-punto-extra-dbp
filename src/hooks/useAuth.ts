import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Custom hook para leer el AuthContext desde cualquier componente.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth se debe usar dentro de <AuthProvider>');
  return context;
}
