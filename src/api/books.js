// src/api/books.js
import client from './client';

export async function listBooks(params = {}) {
  const { data } = await client.get('/books', { params });
  return data; // { books, total, page, pageSize }
}

export async function getBook(id) {
  const { data } = await client.get(`/books/${id}`);
  return data.book;
}

export async function listCategories() {
  const { data } = await client.get('/categories');
  return data.categories;
}

export async function getAccess(bookId) {
  const { data } = await client.get(`/books/${bookId}/access`);
  return data;
}

export async function getProgress(bookId) {
  const { data } = await client.get(`/books/${bookId}/progress`);
  return data;
}

export async function postProgress(bookId, page) {
  const { data } = await client.post(`/books/${bookId}/progress`, { page });
  return data;
}

// Note: there is deliberately no pdfUrl() helper here. GET /books/:id/pdf
// requires the Bearer access token, which a plain <iframe src> or <a href>
// can't carry — see Reader.jsx, which fetches the bytes through the
// authenticated axios client instead (same pattern used for payment
// proofs in api/admin.js, after that exact bug was caught and fixed).


export function coverUrl(coverPath) {
  if (!coverPath) return null;
  return `/${coverPath}`; // e.g. /covers/<uuid>.jpg — see backend static mount
}
