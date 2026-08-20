// src/pages/admin/AdminBookAccess.jsx
import { useEffect, useState } from 'react';
import { listBookAccess, grantBookAccess, revokeBookAccess, renewBookAccess, adminListBooks, listUsers } from '../../api/admin';
import './Admin.css';

export default function AdminBookAccess() {
  const [grants, setGrants] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    listBookAccess(statusFilter ? { status: statusFilter } : {})
      .then(setGrants)
      .catch(() => setError('Could not load access grants.'))
      .finally(() => setLoading(false));
  }
  useEffect(load, [statusFilter]);

  async function handleRevoke(grant) {
    if (!confirm(`Revoke access to "${grant.book_title}" for ${grant.user_name}?`)) return;
    await revokeBookAccess(grant.id);
    load();
  }

  async function handleRenew(grant) {
    await renewBookAccess(grant.id, 20);
    load();
  }

  return (
    <>
      <h1>Book Assignment</h1>
      <p className="admin-subtitle">Grant a user 20-day access to a specific book.</p>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-toolbar">
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Grant Access</button>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="revoked">Revoked</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>User</th><th>Book</th><th>Start</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}>Loading…</td></tr>
            ) : grants.length === 0 ? (
              <tr><td colSpan={6}>No access grants yet.</td></tr>
            ) : (
              grants.map((g) => (
                <tr key={g.id}>
                  <td>{g.user_name}<br /><span className="field-hint">{g.user_email}</span></td>
                  <td>{g.book_title}</td>
                  <td>{new Date(g.start_date).toLocaleDateString()}</td>
                  <td>{new Date(g.end_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${g.status === 'active' && new Date(g.end_date) >= new Date() ? 'badge-green' : 'badge-neutral'}`}>
                      {g.status === 'active' && new Date(g.end_date) < new Date() ? 'expired' : g.status}
                    </span>
                  </td>
                  <td className="actions">
                    {g.status === 'active' && (
                      <button className="btn btn-ghost btn-sm" onClick={() => handleRevoke(g)}>Revoke</button>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => handleRenew(g)}>Renew 20d</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <GrantForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />
      )}
    </>
  );
}

function GrantForm({ onClose, onSaved }) {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [userId, setUserId] = useState('');
  const [bookId, setBookId] = useState('');
  const [durationDays, setDurationDays] = useState(20);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listUsers({ pageSize: 100 }).then((res) => setUsers(res.users));
    adminListBooks().then((res) => setBooks(res.books));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!userId || !bookId) {
      setError('Select a user and a book.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await grantBookAccess({ userId: Number(userId), bookId: Number(bookId), durationDays: Number(durationDays) });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not grant access.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>Grant book access</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="user">User</label>
            <select id="user" required value={userId} onChange={(e) => setUserId(e.target.value)}>
              <option value="">— Select a user —</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="book">Book</label>
            <select id="book" required value={bookId} onChange={(e) => setBookId(e.target.value)}>
              <option value="">— Select a book —</option>
              {books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="duration">Duration (days)</label>
            <input id="duration" type="number" min={1} max={365} value={durationDays} onChange={(e) => setDurationDays(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Granting…' : 'Grant access'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
