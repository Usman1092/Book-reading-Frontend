// src/pages/SubscriptionPlans.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listPlans, submitPayment } from '../api/subscriptions';
import { useAuth } from '../context/AuthContext';
import './Simple.css';

export default function SubscriptionPlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    listPlans().then(setPlans).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Read without limits</span>
          <h1>Subscription Plans</h1>
          <p>One simple plan gives you unlimited reading access to every book in the Wisdom library.</p>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div className="plan-grid">
            <div className="skeleton" style={{ height: 280 }} />
          </div>
        ) : (
          <div className="plan-grid">
            {plans.map((plan) => (
              <div key={plan.id} className="plan-card">
                <h3>{plan.name}</h3>
                <div className="plan-price">
                  Rs {Number(plan.price).toLocaleString()} <span>/ {plan.duration_days} days</span>
                </div>
                {plan.benefits && <p>{plan.benefits}</p>}
                {user ? (
                  <button className="btn btn-primary btn-block" onClick={() => setSelectedPlan(plan)}>
                    Subscribe
                  </button>
                ) : (
                  <Link to="/login" className="btn btn-primary btn-block">Log in to subscribe</Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPlan && (
        <PaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      )}
    </>
  );
}

function PaymentModal({ plan, onClose }) {
  const [method, setMethod] = useState('easypaisa');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [proof, setProof] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('planId', plan.id);
      formData.append('method', method);
      formData.append('referenceNumber', referenceNumber);
      formData.append('amount', plan.price);
      if (proof) formData.append('proof', proof);
      await submitPayment(formData);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div className="form-card" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <>
            <h3>Payment submitted</h3>
            <div className="alert alert-info">Your payment is awaiting administrator verification.</div>
            <button className="btn btn-primary btn-block" onClick={onClose}>Close</button>
          </>
        ) : (
          <>
            <h3>Subscribe to {plan.name}</h3>
            <p className="field-hint" style={{ marginBottom: 'var(--space-4)' }}>
              Rs {Number(plan.price).toLocaleString()} for {plan.duration_days} days. Pay via Easypaisa or bank
              transfer, then submit your reference number and (optionally) a screenshot of the payment below.
              An administrator will review and activate your subscription.
            </p>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="method">Payment method</label>
                <select id="method" value={method} onChange={(e) => setMethod(e.target.value)}>
                  <option value="easypaisa">Easypaisa</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="ref">Transaction / reference number</label>
                <input
                  id="ref"
                  type="text"
                  required
                  minLength={3}
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="proof">Payment proof (screenshot or receipt)</label>
                <input
                  id="proof"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setProof(e.target.files?.[0] || null)}
                />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit payment'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(18, 24, 20, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-4)',
  zIndex: 50,
};
