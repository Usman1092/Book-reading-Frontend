// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container state-block" style={{ padding: '5rem 0' }}>
      <h3>Page not found</h3>
      <p>The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/" className="btn btn-primary">Back to Home</Link>
    </div>
  );
}
