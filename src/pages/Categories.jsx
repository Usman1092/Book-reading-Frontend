// src/pages/Categories.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listCategories } from '../api/books';
import './Simple.css';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCategories().then(setCategories).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Browse by subject</span>
          <h1>Categories</h1>
          <p>Every category is curated by our administrators — explore the shelves that interest you.</p>
        </div>
      </div>
      <div className="container">
        {loading ? (
          <div className="category-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 90 }} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="state-block">
            <h3>No categories yet</h3>
          </div>
        ) : (
          <div className="category-grid">
            {categories.map((c) => (
              <Link key={c.id} to={`/books?categoryId=${c.id}`} className="category-card">
                <h3>{c.name}</h3>
                <span>{c.book_count} book{c.book_count !== 1 ? 's' : ''}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
