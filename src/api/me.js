// src/api/me.js
import client from './client';

export async function myReadingProgress() {
  const { data } = await client.get('/me/reading-progress');
  return data.items;
}

export async function myBookAccess() {
  const { data } = await client.get('/me/book-access');
  return data.items;
}

export async function mySubscription() {
  const { data } = await client.get('/me/subscription');
  return data.subscription;
}

export async function myPayments() {
  const { data } = await client.get('/me/payments');
  return data.items;
}
