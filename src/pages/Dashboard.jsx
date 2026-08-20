// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { myReadingProgress, myBookAccess, mySubscription } from '../api/me';
import { listBooks, coverUrl } from '../api/books';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import './Simple.css';
import './Home.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      myReadingProgress(),
      myBookAccess(),
      mySubscription(),
      listBooks({ sort: 'newest', pageSize: 4 }),
    ])
      .then(([p, a, s, books]) => {
        setProgress(p);
        setAssigned(a);
        setSubscription(s);
        setRecentBooks(books.books);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeAssigned = assigned.filter((a) => a.status === 'active' && a.remaining_days > 0);

  return (
    <>
      <div className="dash-welcome">
        <div className="container">
          <span className="eyebrow">Your library</span>
          <h1>Welcome back, {user?.name?.split(' ')[0]}</h1>
        </div>
      </div>

      <div className="container dash-section">
        <div className="dash-grid">
          <div className="dash-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4>Continue Reading</h4>
              <Link to="/reading-history" className="field-hint">View all →</Link>
            </div>
            {loading ? (
              <div className="skeleton" style={{ height: 120 }} />
            ) : progress.length === 0 ? (
              <p className="field-hint">You haven't started reading anything yet.</p>
            ) : (
              progress.slice(0, 5).map((p) => (
                <Link key={p.book_id} to={`/read/${p.book_id}`} className="progress-row" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <img className="progress-row-cover" src={coverUrl(p.cover_path)} alt="" />
                  <div className="progress-row-info">
                    <div className="progress-row-title">{p.title}</div>
                    <span className="field-hint">Page {p.last_page} of {p.page_count} · {p.percent}%</span>
                    <div className="mini-progress-track">
                      <div className="mini-progress-fill" style={{ width: `${p.percent}%` }} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="dash-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4>Subscription Status</h4>
              <Link to="/my-subscription" className="field-hint">Details →</Link>
            </div>
            {loading ? (
              <div className="skeleton" style={{ height: 60 }} />
            ) : subscription ? (
              <>
                <span className="badge badge-green">Active — {subscription.plan_name}</span>
                <p className="field-hint" style={{ marginTop: 'var(--space-3)' }}>
                  Renews/expires {new Date(subscription.end_date).toLocaleDateString()}
                </p>
              </>
            ) : (
              <>
                <span className="badge badge-neutral">No active subscription</span>
                <Link to="/subscription" className="btn btn-brass btn-sm" style={{ marginTop: 'var(--space-3)' }}>
                  View plans
                </Link>
              </>
            )}
          </div>

          <div className="dash-card">
            <h4>Active Assigned Books</h4>
            {loading ? (
              <div className="skeleton" style={{ height: 100 }} />
            ) : activeAssigned.length === 0 ? (
              <p className="field-hint">No books currently assigned to you.</p>
            ) : (
              activeAssigned.map((a) => (
                <div key={a.id} className="progress-row">
                  <img className="progress-row-cover" src={coverUrl(a.cover_path)} alt="" />
                  <div className="progress-row-info">
                    <div className="progress-row-title">{a.title}</div>
                    <span className="field-hint">{a.remaining_days} day{a.remaining_days !== 1 ? 's' : ''} remaining</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {recentBooks.length > 0 && (
        <div className="container dash-section">
          <div className="section-head">
            <h2>Recently added to the library</h2>
            <Link to="/books" className="btn btn-ghost btn-sm">Browse all</Link>
          </div>
          <div className="book-grid">
            {recentBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
