// src/pages/About.jsx
import './Simple.css';

export default function About() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Our story</span>
          <h1>About Wisdom</h1>
        </div>
      </div>
      <div className="container simple-content">
        <p>
          Wisdom is a simple online reading library. We believe everyone should be able to sample a
          book before committing to it — that's why every title on Wisdom offers a free 3-page preview,
          no account required.
        </p>
        <p>
          Once you're ready for more, a single subscription unlocks unlimited reading across our whole
          library, or an administrator can grant you 20-day access to an individual title.
        </p>
        <h2>What we value</h2>
        <p>
          <strong>Simplicity</strong> — a clean, distraction-free reading experience.<br />
          <strong>Trust</strong> — transparent access rules, enforced consistently for every reader.<br />
          <strong>Learning</strong> — a growing shelf across fiction, science, history, and philosophy.
        </p>
      </div>
    </>
  );
}
