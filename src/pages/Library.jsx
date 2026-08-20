// src/pages/Library.jsx

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listBooks, listCategories } from '../api/books';
import BookCard from '../components/BookCard';
import './Library.css';
import './Home.css'; // reuses .book-grid

const PAGE_SIZE = 12;

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    listCategories().then(setCategories).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    listBooks({ search: search || undefined, categoryId: categoryId || undefined, sort, page, pageSize: PAGE_SIZE })
      .then((res) => {
        setBooks(res.books);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, categoryId, sort, page]);

  useEffect(() => {
    load();
  }, [load]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <div className="library-header container">
        <span className="eyebrow">The full collection</span>
        <h1>Books</h1>
        <div className="library-controls">
          <input
            className="library-search"
            type="search"
            placeholder="Search by title or author…"
            defaultValue={search}
            onChange={(e) => {
              const val = e.target.value;
              clearTimeout(window.__wisdomSearchDebounce);
              window.__wisdomSearchDebounce = setTimeout(() => updateParam('search', val), 350);
            }}
            aria-label="Search books"
          />
          <select
            className="library-select"
            value={categoryId}
            onChange={(e) => updateParam('categoryId', e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            className="library-select"
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            aria-label="Sort books"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title_asc">Title A–Z</option>
            <option value="title_desc">Title Z–A</option>
          </select>
        </div>
      </div>

      <div className="library-body container">
        {loading ? (
          <div className="book-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 320, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="state-block">
            <h3>No books found</h3>
            <p>Try a different search term or clear your filters.</p>
          </div>
        ) : (
          <>
            <p className="library-meta">{total} book{total !== 1 ? 's' : ''} found</p>
            <div className="book-grid">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page <= 1}
                  onClick={() => updateParam('page', String(page - 1))}
                >
                  Previous
                </button>
                <span style={{ alignSelf: 'center', fontSize: '0.88rem', color: 'var(--color-ink-muted)' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page >= totalPages}
                  onClick={() => updateParam('page', String(page + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
