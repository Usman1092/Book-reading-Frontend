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


// export function coverUrl(coverPath) {
//   if (!coverPath) return null;
//   return `/${coverPath}`; // e.g. /covers/<uuid>.jpg — see backend static mount
// }


// export function coverUrl(coverPath) {
//   if (!coverPath) return null;

//   const backendUrl = import.meta.env.VITE_API_URL;

//   return `${backendUrl}/${coverPath}`;
// }

// src/api/books.js

const CDN_BASE = "https://book-cdn.best4usmanali.workers.dev";
const BACKEND_BASE = "https://book-reading-backend-1.onrender.com";

// Cover ke liye CDN URL - B2 se aayega
export function coverUrl(coverPath) {
  if (!coverPath) return null;

  // NAYI BOOK (B2 par) - iska path hoga: covers/uuid.jpg
  // Isko Cloudflare CDN se dikhao (Tez)
  if (coverPath.startsWith("covers/")) {
    return `${CDN_BASE}/${coverPath}`;
  }

  // PURANI BOOK (agar pehle ki books Render par hain)
  // Unko backend se dikhao
  if (coverPath.startsWith("http")) {
    return coverPath;
  }

  // Fallback - agar sirf filename hai
  return `${BACKEND_BASE}/${coverPath}`;
}

