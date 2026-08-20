// src/pages/admin/AdminLayout.jsx
import { NavLink, Outlet } from 'react-router-dom';
import './Admin.css';

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/books', label: 'Books' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/book-access', label: 'Book Assignment' },
  { to: '/admin/payments', label: 'Payments' },
  { to: '/admin/subscription-plans', label: 'Subscription Plans' },
];

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">Wisdom Admin</div>
        <nav>
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
