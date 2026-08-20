// src/pages/admin/AdminUsers.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listUsers, setUserActive } from '../../api/admin';
import './Admin.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    listUsers({ search })
      .then((res) => setUsers(res.users))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function toggleActive(user) {
    const updated = await setUserActive(user.id, !user.is_active);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, is_active: updated.is_active } : u)));
  }

  return (
    <>
      <h1>Users</h1>
      <p className="admin-subtitle">Search, review, and activate or deactivate accounts.</p>

      <div className="admin-toolbar">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}>Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6}>No users found.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td><Link to={`/admin/users/${u.id}`}>{u.name}</Link></td>
                  <td>{u.email}</td>
                  <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-green' : 'badge-neutral'}`}>
                      {u.is_active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(u)}>
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
