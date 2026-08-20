// src/components/BookCard.jsx
import { Link } from 'react-router-dom';
import { coverUrl } from '../api/books';
import './BookCard.css';

export default function BookCard({ book }) {
  const cover = coverUrl(book.cover_path);

  return (
    <Link to={`/books/${book.id}`} className="book-card">
      <div className="book-card-cover">
        {book.category_name && <span className="catalog-tab">{book.category_name}</span>}
        {cover ? (
          <img src={cover} alt={`Cover of ${book.title}`} loading="lazy" />
        ) : (
          <div className="book-card-cover-fallback">{book.title}</div>
        )}
      </div>
      <div className="book-card-body">
        <h3 className="book-card-title">{book.title}</h3>
        <p className="book-card-author">{book.author}</p>
        {book.description && <p className="book-card-desc">{book.description}</p>}
        <div className="book-card-footer">
          <span className="badge badge-neutral">{book.page_count} pages</span>
          <span className="btn btn-secondary btn-sm">Read</span>
        </div>
      </div>
    </Link>
  );
}
