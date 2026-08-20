// src/pages/admin/AdminCategories.jsx
import { useEffect, useState } from 'react';
import { listCategories } from '../../api/books';
import { createCategory, updateCategory, deleteCategory } from '../../api/admin';
import './Admin.css';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    listCategories().then(setCategories).catch(() => setError('Could not load categories.')).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setError('');
    try {
      await createCategory(newName.trim());
      setNewName('');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create category.');
    }
  }

  async function handleUpdate(id) {
    if (!editingName.trim()) return;
    try {
      await updateCategory(id, editingName.trim());
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update category.');
    }
  }

  async function handleDelete(cat) {
    if (!confirm(`Delete category "${cat.name}"? Books in this category will become uncategorized.`)) return;
    await deleteCategory(cat.id);
    load();
  }

  return (
    <>
      <h1>Categories</h1>
      <p className="admin-subtitle">Categories shown to readers are fully managed here — nothing is hard-coded.</p>
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleCreate} className="admin-toolbar">
        <input
          type="text"
          placeholder="New category name…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <button className="btn btn-primary" type="submit">+ Add category</button>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Books</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3}>Loading…</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={3}>No categories yet.</td></tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id}>
                  <td>
                    {editingId === c.id ? (
                      <input value={editingName} onChange={(e) => setEditingName(e.target.value)} style={{ maxWidth: 200 }} />
                    ) : (
                      c.name
                    )}
                  </td>
                  <td>{c.book_count}</td>
                  <td className="actions">
                    {editingId === c.id ? (
                      <>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleUpdate(c.id)}>Save</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditingId(c.id); setEditingName(c.name); }}>Edit</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(c)}>Delete</button>
                      </>
                    )}
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
