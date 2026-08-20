// src/api/subscriptions.js
import client from './client';

export async function listPlans() {
  const { data } = await client.get('/subscription-plans');
  return data.plans;
}

export async function submitPayment(formData) {
  const { data } = await client.post('/payments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
