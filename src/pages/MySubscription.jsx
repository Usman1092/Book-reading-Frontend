// src/pages/MySubscription.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mySubscription, myPayments } from '../api/me';
import './Simple.css';

const STATUS_BADGE = {
  pending: 'badge-brass',
  approved: 'badge-green',
  rejected: 'badge-red',
};

export default function MySubscription() {
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([mySubscription(), myPayments()])
      .then(([s, p]) => {
        setSubscription(s);
        setPayments(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Billing</span>
          <h1>My Subscription</h1>
        </div>
      </div>

      <div className="container simple-content">
        {loading ? (
          <div className="skeleton" style={{ height: 100 }} />
        ) : subscription ? (
          <div className="dash-card">
            <span className="badge badge-green">Active — {subscription.plan_name}</span>
            <p style={{ marginTop: 'var(--space-3)' }}>
              Started {new Date(subscription.start_date).toLocaleDateString()} · Expires{' '}
              {new Date(subscription.end_date).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <div className="dash-card">
            <span className="badge badge-neutral">No active subscription</span>
            <p style={{ marginTop: 'var(--space-3)' }}>
              <Link to="/subscription" className="btn btn-primary btn-sm">View plans</Link>
            </p>
          </div>
        )}

        <h2>Payment history</h2>
        {payments.length === 0 ? (
          <p className="field-hint">No payments submitted yet.</p>
        ) : (
          payments.map((p) => (
            <div key={p.id} className="progress-row" style={{ alignItems: 'flex-start' }}>
              <div className="progress-row-info">
                <div className="progress-row-title">{p.plan_name} — Rs {Number(p.amount).toLocaleString()}</div>
                <span className="field-hint">
                  {p.method === 'easypaisa' ? 'Easypaisa' : 'Bank Transfer'} · Ref: {p.reference_number} ·{' '}
                  {new Date(p.created_at).toLocaleDateString()}
                </span>
                {p.status === 'rejected' && p.rejection_reason && (
                  <p className="field-error">Reason: {p.rejection_reason}</p>
                )}
              </div>
              <span className={`badge ${STATUS_BADGE[p.status]}`}>{p.status}</span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
