// src/pages/Home.jsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listBooks, listCategories } from '../api/books';
import BookCard from '../components/BookCard';
import './Home.css';

// Spine colors drawn from the brand palette plus a couple of muted
// neighbors, so the shelf reads as "book spines," not a chart.
const SPINE_COLORS = ['#2b5449', '#be8a3d', '#8c3b32', '#3f6b5e', '#d9c48b', '#5b655e', '#1d3a32', '#c79a58'];

function generateSpines(count) {
  return Array.from({ length: count }, (_, i) => ({
    width: 14 + ((i * 7) % 18),
    height: 60 + ((i * 37) % 40) + '%',
    color: SPINE_COLORS[i % SPINE_COLORS.length],
  }));
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const spines = generateSpines(16);
  const pulledIndex = 7;

  useEffect(() => {
    Promise.all([listBooks({ sort: 'newest', pageSize: 8 }), listCategories()])
      .then(([booksRes, cats]) => {
        setFeatured(booksRes.books);
        setCategories(cats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero container">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">A simple online reading library</span>
            <h1>Read. Learn. Grow.</h1>
            <p>Build your knowledge with Wisdom — browse a growing shelf of books and read them right in your browser, no downloads required.</p>
            <div className="hero-actions">
              <Link to="/books" className="btn btn-primary">Explore Books</Link>
              <Link to="/subscription" className="btn btn-secondary">See Subscription</Link>
            </div>
          </div>
          <div className="shelf" aria-hidden="true">
            {spines.map((s, i) => (
              <div
                key={i}
                className={`spine ${i === pulledIndex ? 'spine-pulled' : ''}`}
                style={{ width: s.width, height: s.height, background: s.color }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Freshly added</span>
            <h2>Featured books</h2>
          </div>
          <Link to="/books" className="btn btn-ghost btn-sm">Browse all</Link>
        </div>

        {loading ? (
          <div className="book-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 320, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="state-block">
            <h3>No books yet</h3>
            <p>Check back soon — the library is just getting started.</p>
          </div>
        ) : (
          <div className="book-grid">
            {featured.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {categories.length > 0 && (
        <section className="section container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Browse by subject</span>
              <h2>Categories</h2>
            </div>
          </div>
          <div className="category-row">
            {categories.map((c) => (
              <Link key={c.id} to={`/books?categoryId=${c.id}`} className="category-pill">
                {c.name} <span style={{ opacity: 0.6 }}>· {c.book_count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section container">
        <div className="cta-band">
          <div>
            <h2>Read without limits</h2>
            <p>Every book offers a free 3-page preview. Subscribe once for unlimited reading access to the entire library.</p>
          </div>
          <Link to="/subscription" className="btn btn-brass">View Plans</Link>
        </div>
      </section>
    </>
  );
}
