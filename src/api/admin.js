// src/api/admin.js
import client from './client';

// --- Dashboard ---
export async function getDashboard() {
  const { data } = await client.get('/admin/dashboard');
  return data;
}

// --- Users ---
export async function listUsers(params = {}) {
  const { data } = await client.get('/admin/users', { params });
  return data; // { users, total, page, pageSize }
}
export async function getUser(id) {
  const { data } = await client.get(`/admin/users/${id}`);
  return data; // { user, assignedBooks, subscription, readingProgress }
}
export async function setUserActive(id, isActive) {
  const { data } = await client.put(`/admin/users/${id}/active`, { isActive });
  return data.user;
}

// --- Book access (20-day grants) ---
export async function listBookAccess(params = {}) {
  const { data } = await client.get('/admin/book-access', { params });
  return data.grants;
}
export async function grantBookAccess({ userId, bookId, durationDays }) {
  const { data } = await client.post('/admin/book-access', { userId, bookId, durationDays });
  return data.grant;
}
export async function revokeBookAccess(id) {
  const { data } = await client.put(`/admin/book-access/${id}/revoke`);
  return data.grant;
}
export async function renewBookAccess(id, durationDays) {
  const { data } = await client.put(`/admin/book-access/${id}/renew`, { durationDays });
  return data.grant;
}

// --- Books ---
export async function adminListBooks(params = {}) {
  const { data } = await client.get('/books', { params: { ...params, pageSize: 100 } });
  return data;
}
export async function createBook(formData) {
  const { data } = await client.post('/books', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.book;
}
export async function updateBook(id, formData) {
  const { data } = await client.put(`/books/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.book;
}
export async function deleteBook(id) {
  await client.delete(`/books/${id}`);
}

// --- Categories ---
export async function createCategory(name) {
  const { data } = await client.post('/categories', { name });
  return data.category;
}
export async function updateCategory(id, name) {
  const { data } = await client.put(`/categories/${id}`, { name });
  return data.category;
}
export async function deleteCategory(id) {
  await client.delete(`/categories/${id}`);
}

// --- Payments ---
export async function adminListPayments(params = {}) {
  const { data } = await client.get('/payments', { params });
  return data.payments;
}
export async function approvePayment(id) {
  const { data } = await client.put(`/payments/${id}/approve`);
  return data;
}
export async function rejectPayment(id, reason) {
  const { data } = await client.put(`/payments/${id}/reject`, { reason });
  return data;
}
export async function fetchPaymentProof(id) {
  const res = await client.get(`/payments/${id}/proof`, { responseType: 'blob' });
  return URL.createObjectURL(res.data);
}

// --- Subscription plans ---
export async function adminListPlans() {
  const { data } = await client.get('/subscription-plans/admin');
  return data.plans;
}
export async function createPlan(plan) {
  const { data } = await client.post('/subscription-plans', plan);
  return data.plan;
}
export async function updatePlan(id, plan) {
  const { data } = await client.put(`/subscription-plans/${id}`, plan);
  return data.plan;
}
