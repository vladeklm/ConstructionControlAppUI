import { apiFetch } from './http';

export function login({ login, password }) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: { login, password },
  });
}

export function register({ login, password, fullName, email, phone, role }) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: { login, password, fullName, email, phone, role },
  });
}

