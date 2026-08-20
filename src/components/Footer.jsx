// src/components/Footer.jsx
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <div className="footer-brand">✦ Wisdom</div>
          <p>A simple online reading library. Read the first three pages of any book for free — subscribe or request access to read the rest.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><Link to="/books">Books</Link></li>
            <li><Link to="/categories">Categories</Link></li>
            <li><Link to="/subscription">Subscription</Link></li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4>Legal</h4>
          <ul>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        © {new Date().getFullYear()} Wisdom. All rights reserved.
      </div>
    </footer>
  );
}
