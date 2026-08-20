// src/pages/BookDetails.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBook, getAccess, getProgress, coverUrl } from '../api/books';
import { useAuth } from '../context/AuthContext';
import './BookDetails.css';

export default function BookDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [access, setAccess] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    Promise.all([
      getBook(id),
      getAccess(id),
      user ? getProgress(id).catch(() => null) : Promise.resolve(null),
    ])
      .then(([bookData, accessData, progressData]) => {
        setBook(bookData);
        setAccess(accessData);
        setProgress(progressData);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, user]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0' }}>
        <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  if (notFound || !book) {
    return (
      <div className="container state-block">
        <h3>Book not found</h3>
        <p>This book may have been removed or is no longer available.</p>
        <Link to="/books" className="btn btn-primary">Back to library</Link>
      </div>
    );
  }

  const cover = coverUrl(book.cover_path);
  const isFull = access?.accessLevel === 'full';
  const hasProgress = progress?.lastPage && progress.lastPage > 1;

  return (
    <section className="details-hero">
      <div className="container details-grid">
        <div className="details-cover">
          {cover ? (
            <img src={cover} alt={`Cover of ${book.title}`} />
          ) : (
            <div className="details-cover-fallback">{book.title}</div>
          )}
        </div>

        <div>
          {book.category_name && <span className="eyebrow">{book.category_name}</span>}
          <h1>{book.title}</h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-ink)' }}>by {book.author}</p>

          <div className="details-meta-row">
            <span className="badge badge-neutral">{book.page_count} pages</span>
            {isFull ? (
              <span className="badge badge-green">Full access</span>
            ) : (
              <span className="badge badge-brass">Free preview available</span>
            )}
          </div>

          {book.description && <p className="details-desc">{book.description}</p>}

          <div className="details-actions">
            {isFull ? (
              <Link to={`/read/${book.id}`} className="btn btn-primary">
                {hasProgress ? `Continue Reading — Page ${progress.lastPage}` : 'Start Reading'}
              </Link>
            ) : (
              <Link to={`/read/${book.id}`} className="btn btn-secondary">
                Read Free Preview
              </Link>
            )}
            {!isFull && !user && (
              <Link to="/subscription" className="btn btn-ghost">View Subscription Plans</Link>
            )}
          </div>

          {!isFull && (
            <p className="details-access-note" style={{ marginTop: 'var(--space-4)' }}>
              Read the first 3 pages for free. Subscribe or request access from an administrator to read the rest of this book.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
