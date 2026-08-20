// src/pages/admin/AdminSubscriptionPlans.jsx
import { useEffect, useState } from 'react';
import { adminListPlans, createPlan, updatePlan } from '../../api/admin';
import './Admin.css';

export default function AdminSubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null); // null closed, {} new, {...} editing
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    adminListPlans().then(setPlans).catch(() => setError('Could not load plans.')).finally(() => setLoading(false));
  }
  useEffect(load, []);

  return (
    <>
      <h1>Subscription Plans</h1>
      <p className="admin-subtitle">Manage the plans shown on the public Subscription page.</p>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-toolbar">
        <button className="btn btn-primary" onClick={() => setEditingPlan({})}>+ New Plan</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Price</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5}>Loading…</td></tr>
            ) : plans.length === 0 ? (
              <tr><td colSpan={5}>No plans yet.</td></tr>
            ) : (
              plans.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>Rs {Number(p.price).toLocaleString()}</td>
                  <td>{p.duration_days} days</td>
                  <td>
                    <span className={`badge ${p.is_active ? 'badge-green' : 'badge-neutral'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingPlan(p)}>Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingPlan && (
        <PlanModal
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSaved={() => { setEditingPlan(null); load(); }}
        />
      )}
    </>
  );
}

function PlanModal({ plan, onClose, onSaved }) {
  const isNew = !plan.id;
  const [form, setForm] = useState({
    name: plan.name || '',
    price: plan.price || '',
    durationDays: plan.duration_days || 30,
    benefits: plan.benefits || '',
    isActive: plan.is_active ?? true,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        durationDays: Number(form.durationDays),
        benefits: form.benefits,
        isActive: form.isActive,
      };
      if (isNew) {
        await createPlan(payload);
      } else {
        await updatePlan(plan.id, payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save the plan.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>{isNew ? 'New subscription plan' : `Edit "${plan.name}"`}</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Plan name</label>
            <input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="price">Price (Rs)</label>
            <input id="price" type="number" min={0} step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="duration">Duration (days)</label>
            <input id="duration" type="number" min={1} required value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="benefits">Benefits</label>
            <textarea id="benefits" rows={3} value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} />
          </div>
          {!isNew && (
            <div className="field">
              <label>
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} style={{ width: 'auto', marginRight: 8 }} />
                Active (shown on the public plans page)
              </label>
            </div>
          )}
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
