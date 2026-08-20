// src/pages/admin/AdminBooks.jsx
import { useEffect, useState } from 'react';
import { adminListBooks, createBook, updateBook, deleteBook } from '../../api/admin';
import { listCategories, coverUrl } from '../../api/books';
import './Admin.css';

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBook, setEditingBook] = useState(null); // null = closed, {} = new, {...} = editing
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    Promise.all([adminListBooks(), listCategories()])
      .then(([b, c]) => {
        setBooks(b.books);
        setCategories(c);
      })
      .catch(() => setError('Could not load books.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(book) {
    if (!confirm(`Delete "${book.title}"? This also removes its PDF and cover file.`)) return;
    await deleteBook(book.id);
    setBooks((prev) => prev.filter((b) => b.id !== book.id));
  }

  return (
    <>
      <h1>Books</h1>
      <p className="admin-subtitle">Upload and manage the Wisdom library.</p>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-toolbar">
        <button className="btn btn-primary" onClick={() => setEditingBook({})}>+ Upload Book</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th></th><th>Title</th><th>Author</th><th>Category</th><th>Pages</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}>Loading…</td></tr>
            ) : books.length === 0 ? (
              <tr><td colSpan={7}>No books yet.</td></tr>
            ) : (
              books.map((b) => (
                <tr key={b.id}>
                  <td>
                    <img src={coverUrl(b.cover_path)} alt="" style={{ width: 32, height: 42, objectFit: 'cover', borderRadius: 4 }} />
                  </td>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>{b.category_name || '—'}</td>
                  <td>{b.page_count}</td>
                  <td>
                    <span className={`badge ${b.is_active ? 'badge-green' : 'badge-neutral'}`}>
                      {b.is_active === false ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingBook(b)}>Edit</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(b)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingBook && (
        <BookModal
          book={editingBook}
          categories={categories}
          onClose={() => setEditingBook(null)}
          onSaved={() => { setEditingBook(null); load(); }}
        />
      )}
    </>
  );
}

function BookModal({ book, categories, onClose, onSaved }) {
  const isNew = !book.id;
  const [form, setForm] = useState({
    title: book.title || '',
    author: book.author || '',
    description: book.description || '',
    categoryId: book.category_id || '',
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [isActive, setIsActive] = useState(book.is_active !== false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (isNew && !pdfFile) {
      setError('A PDF file is required.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('author', form.author);
      formData.append('description', form.description);
      if (form.categoryId) formData.append('categoryId', form.categoryId);
      if (pdfFile) formData.append('pdf', pdfFile);
      if (coverFile) formData.append('cover', coverFile);
      if (!isNew) formData.append('isActive', isActive);

      if (isNew) {
        await createBook(formData);
      } else {
        await updateBook(book.id, formData);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save the book.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>{isNew ? 'Upload a book' : `Edit "${book.title}"`}</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="author">Author</label>
            <input id="author" required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea id="description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">— None —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="pdf">PDF file {isNew && '(required)'}</label>
            <input id="pdf" type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
            {!isNew && <p className="field-hint">Leave empty to keep the current file.</p>}
          </div>
          <div className="field">
            <label htmlFor="cover">Cover image</label>
            <input id="cover" type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
          </div>
          {!isNew && (
            <div className="field">
              <label>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ width: 'auto', marginRight: 8 }}
                />
                Active (visible in the public library)
              </label>
            </div>
          )}
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
