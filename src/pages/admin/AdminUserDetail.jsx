// src/pages/admin/AdminUserDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUser, setUserActive } from '../../api/admin';
import './Admin.css';

export default function AdminUserDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser(id).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  async function toggleActive() {
    const updated = await setUserActive(id, !data.user.is_active);
    setData((prev) => ({ ...prev, user: { ...prev.user, is_active: updated.is_active } }));
  }

  if (loading) return <p>Loading…</p>;
  if (!data) return <p>User not found.</p>;

  const { user, assignedBooks, subscription, readingProgress } = data;

  return (
    <>
      <Link to="/admin/users" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-4)' }}>← Back to users</Link>
      <h1>{user.name}</h1>
      <p className="admin-subtitle">{user.email} · joined {new Date(user.created_at).toLocaleDateString()}</p>

      <div className="stat-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <span className={`badge ${user.is_active ? 'badge-green' : 'badge-neutral'}`}>
            {user.is_active ? 'Active' : 'Deactivated'}
          </span>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <button className="btn btn-ghost btn-sm" onClick={toggleActive}>
              {user.is_active ? 'Deactivate account' : 'Activate account'}
            </button>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Subscription</div>
          {subscription ? (
            <p>{subscription.plan_name} — expires {new Date(subscription.end_date).toLocaleDateString()}</p>
          ) : (
            <p className="field-hint">No active subscription</p>
          )}
        </div>
      </div>

      <h2>Assigned books</h2>
      <div className="admin-table-wrap" style={{ marginBottom: 'var(--space-6)' }}>
        <table className="admin-table">
          <thead><tr><th>Book</th><th>Granted</th><th>Expires</th><th>Status</th></tr></thead>
          <tbody>
            {assignedBooks.length === 0 ? (
              <tr><td colSpan={4}>No book assignments.</td></tr>
            ) : (
              assignedBooks.map((a) => (
                <tr key={a.id}>
                  <td>{a.title}</td>
                  <td>{new Date(a.start_date).toLocaleDateString()}</td>
                  <td>{new Date(a.end_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${a.status === 'active' && a.remaining_days > 0 ? 'badge-green' : 'badge-neutral'}`}>
                      {a.status === 'active' && a.remaining_days > 0 ? `${a.remaining_days}d left` : a.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h2>Reading progress</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Book</th><th>Page</th><th>Progress</th><th>Last read</th></tr></thead>
          <tbody>
            {readingProgress.length === 0 ? (
              <tr><td colSpan={4}>No reading activity yet.</td></tr>
            ) : (
              readingProgress.map((p) => (
                <tr key={p.book_id}>
                  <td>{p.title}</td>
                  <td>{p.last_page} / {p.page_count}</td>
                  <td>{p.percent}%</td>
                  <td>{new Date(p.updated_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
