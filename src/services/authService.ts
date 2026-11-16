import api from './api';
import type { RegisterRequest, User } from '../types';

// POST /users/register (público) → 201 { id }
export async function registerUser(data: RegisterRequest) {
  const res = await api.post<{ id: number }>('/users/register', data);
  return res.data;
}

// POST /auth/login (público) → { token }
export async function loginUser(email: string, password: string) {
  const res = await api.post<{ token: string }>('/auth/login', { email, password });
  return res.data.token;
}

// GET /users/current (protegido) → datos del usuario logueado
export async function getCurrentUser() {
  const res = await api.get<User>('/users/current');
  return res.data;
}
