// src/api/auth.js
import client, { setAccessToken } from './client';

export async function register({ name, email, password }) {
  const { data } = await client.post('/auth/register', { name, email, password });
  return data;
}

export async function login({ email, password }) {
  const { data } = await client.post('/auth/login', { email, password });
  setAccessToken(data.accessToken);
  return data.user;
}

export async function logout() {
  await client.post('/auth/logout');
  setAccessToken(null);
}

export async function fetchMe() {
  const { data } = await client.get('/auth/me');
  return data.user;
}

export async function tryRefresh() {
  const { data } = await client.post('/auth/refresh');
  setAccessToken(data.accessToken);
  return data.user;
}

export async function forgotPassword(email) {
  const { data } = await client.post('/auth/forgot-password', { email });
  return data;
}

export async function resetPassword(token, password) {
  const { data } = await client.post('/auth/reset-password', { token, password });
  return data;
}
