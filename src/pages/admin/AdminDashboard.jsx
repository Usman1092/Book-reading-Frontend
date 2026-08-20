// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { getDashboard } from '../../api/admin';
import './Admin.css';

const CARDS = [
  ['totalUsers', 'Total Users'],
  ['totalBooks', 'Total Books'],
  ['totalCategories', 'Categories'],
  ['activeSubscriptions', 'Active Subscriptions'],
  ['pendingPayments', 'Pending Payments'],
  ['activeAssignments', 'Active Assignments'],
  ['expiredAssignments', 'Expired Assignments'],
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard().then(setStats).catch(() => setError('Could not load dashboard stats.'));
  }, []);

  return (
    <>
      <h1>Dashboard</h1>
      <p className="admin-subtitle">An overview of the Wisdom platform.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stat-grid">
        {CARDS.map(([key, label]) => (
          <div key={key} className="stat-card">
            <div className="stat-value">{stats ? stats[key] : '—'}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>
    </>
  );
}
