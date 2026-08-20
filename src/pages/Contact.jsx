// src/pages/Contact.jsx
import { useState } from 'react';
import './Simple.css';

export default function Contact() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // No backend contact endpoint exists yet — this simply confirms
    // receipt in the UI. Wire this up to a real endpoint if needed.
    setSent(true);
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Get in touch</span>
          <h1>Contact</h1>
          <p>Questions about your account, a book, or access? Send us a message.</p>
        </div>
      </div>
      <div className="container simple-content">
        {sent ? (
          <div className="alert alert-info">Thanks — we'll get back to you soon.</div>
        ) : (
          <form className="form-card" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" type="text" required />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required />
            </div>
            <div className="field">
              <label htmlFor="message">Message</label>
              <textarea id="message" rows={5} required />
            </div>
            <button className="btn btn-primary btn-block" type="submit">Send message</button>
          </form>
        )}
      </div>
    </>
  );
}
