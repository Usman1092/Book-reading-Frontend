// src/pages/admin/AdminPayments.jsx
import { useEffect, useState } from 'react';
import { adminListPayments, approvePayment, rejectPayment, fetchPaymentProof } from '../../api/admin';
import './Admin.css';

const STATUS_BADGE = { pending: 'badge-brass', approved: 'badge-green', rejected: 'badge-neutral' };

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  function load() {
    setLoading(true);
    adminListPayments(statusFilter ? { status: statusFilter } : {})
      .then(setPayments)
      .catch(() => setError('Could not load payments.'))
      .finally(() => setLoading(false));
  }
  useEffect(load, [statusFilter]);

  async function handleViewProof(payment) {
    try {
      const blobUrl = await fetchPaymentProof(payment.id);
      window.open(blobUrl, '_blank', 'noopener');
      // Object URLs are only needed for the duration of that tab load —
      // release it shortly after so we don't leak memory across many views.
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (err) {
      setError('Could not load the payment proof.');
    }
  }

  async function handleApprove(payment) {
    if (!confirm(`Approve this payment and activate the subscription for ${payment.user_email}?`)) return;
    try {
      await approvePayment(payment.id);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not approve payment.');
    }
  }

  async function handleReject() {
    try {
      await rejectPayment(rejectingId, rejectReason);
      setRejectingId(null);
      setRejectReason('');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reject payment.');
    }
  }

  return (
    <>
      <h1>Payments</h1>
      <p className="admin-subtitle">Review manual Easypaisa / bank transfer submissions.</p>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-toolbar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>User</th><th>Plan</th><th>Method</th><th>Reference</th><th>Amount</th><th>Proof</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8}>Loading…</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={8}>No payments found.</td></tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id}>
                  <td>{p.user_name}<br /><span className="field-hint">{p.user_email}</span></td>
                  <td>{p.plan_name}</td>
                  <td>{p.method === 'easypaisa' ? 'Easypaisa' : 'Bank Transfer'}</td>
                  <td>{p.reference_number}</td>
                  <td>Rs {Number(p.amount).toLocaleString()}</td>
                  <td>
                    {p.proof_path ? (
                      <button className="btn btn-ghost btn-sm" onClick={() => handleViewProof(p)}>View</button>
                    ) : '—'}
                  </td>
                  <td><span className={`badge ${STATUS_BADGE[p.status]}`}>{p.status}</span></td>
                  <td className="actions">
                    {p.status === 'pending' && (
                      <>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleApprove(p)}>Approve</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setRejectingId(p.id)}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rejectingId && (
        <div className="modal-overlay" onClick={() => setRejectingId(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Reject payment</h3>
            <div className="field">
              <label htmlFor="reason">Reason (optional, shown to the user)</label>
              <textarea id="reason" rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn btn-ghost" onClick={() => setRejectingId(null)}>Cancel</button>
              <button className="btn btn-primary btn-block" onClick={handleReject}>Reject payment</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
