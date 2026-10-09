// src/pages/ReadingHistory.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { myReadingProgress, myBookAccess } from '../api/me';
import { coverUrl } from '../api/books';
import './Simple.css';

export default function ReadingHistory() {
  const [progress, setProgress] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([myReadingProgress(), myBookAccess()])
      .then(([p, a]) => {
        setProgress(p);
        setAssigned(a);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Your books</span>
          <h1>My Books &amp; Reading History</h1>
        </div>
      </div>

      <div className="container simple-content">
        <h2>Reading progress</h2>
        {loading ? (
          <div className="skeleton" style={{ height: 200 }} />
        ) : progress.length === 0 ? (
          <p className="field-hint">You haven't started reading anything yet.</p>
        ) : (
          progress.map((p) => (
            <Link key={p.book_id} to={`/read/${p.book_id}`} className="progress-row" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img className="progress-row-cover" src={coverUrl(p.cover_path)} alt="" />
              <div className="progress-row-info">
                <div className="progress-row-title">{p.title}</div>
                <span className="field-hint">Page {p.last_page} of {p.page_count} · {p.percent}% · Last read {new Date(p.updated_at).toLocaleDateString()}</span>
                <div className="mini-progress-track">
                  <div className="mini-progress-fill" style={{ width: `${p.percent}%` }} />
                </div>
              </div>
            </Link>
          ))
        )}

        <h2>Assigned book access</h2>
        {loading ? (
          <div className="skeleton" style={{ height: 120 }} />
        ) : assigned.length === 0 ? (
          <p className="field-hint">No books have been assigned to you.</p>
        ) : (
          assigned.map((a) => (
            <div key={a.id} className="progress-row">
              <img className="progress-row-cover" src={coverUrl(a.cover_path)} alt="" />
              <div className="progress-row-info">
                <div className="progress-row-title">{a.title}</div>
                <span className="field-hint">
                  {new Date(a.start_date).toLocaleDateString()} – {new Date(a.end_date).toLocaleDateString()}
                </span>
              </div>
              <span className={`badge ${a.status === 'active' && a.remaining_days > 0 ? 'badge-green' : 'badge-neutral'}`}>
                {a.status === 'active' && a.remaining_days > 0 ? `${a.remaining_days}d left` : a.status}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
