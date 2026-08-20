// src/pages/ResetPassword.jsx
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import * as authApi from '../api/auth';
import './Auth.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1400);
    } catch (err) {
      setError(err.response?.data?.error || 'This reset link is invalid or has expired.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <h1>Invalid link</h1>
          <p className="auth-subtitle">This password reset link is missing its token.</p>
          <Link to="/forgot-password" className="btn btn-primary btn-block">Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Set a new password</h1>
        <p className="auth-subtitle">Choose a new password for your account.</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-info">Password updated — redirecting you to log in…</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="password">New password</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="field-hint">At least 8 characters, including a number.</p>
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting || success}>
            {submitting ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
