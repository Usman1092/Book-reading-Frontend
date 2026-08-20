// src/pages/Profile.jsx
import { useAuth } from '../context/AuthContext';
import './Simple.css';

export default function Profile() {
  const { user } = useAuth();

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Account</span>
          <h1>Profile</h1>
        </div>
      </div>

      <div className="container simple-content">
        <div className="dash-card" style={{ maxWidth: 480 }}>
          <div className="field">
            <label>Full name</label>
            <p style={{ margin: 0, color: 'var(--color-ink)' }}>{user?.name}</p>
          </div>
          <div className="field">
            <label>Email</label>
            <p style={{ margin: 0, color: 'var(--color-ink)' }}>{user?.email}</p>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Role</label>
            <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
             <label>Permission</label>
            <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{user?.permission}</span>
          </div>
        </div>
      </div>
    </>
  );
}
