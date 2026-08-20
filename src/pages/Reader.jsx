// src/pages/Reader.jsx
//
// The PDF is fetched through our authenticated axios client (so the
// Bearer token is attached) as raw bytes, then handed to pdf.js entirely
// client-side — the browser never makes a plain, credential-less request
// to a public PDF URL. Whether those bytes represent the full book or
// just the 3-page preview was already decided server-side (see
// pdfDelivery.service.js) — the reader just displays whatever it received.

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import client from '../api/client';
import { getBook, getAccess, getProgress, postProgress } from '../api/books';
import { useAuth } from '../context/AuthContext';
import './Reader.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const MIN_SCALE = 0.6;
const MAX_SCALE = 2.4;

export default function Reader() {
  const { id } = useParams();
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [access, setAccess] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [scale, setScale] = useState(1.1);
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const renderTaskRef = useRef(null);
  const progressSaveTimer = useRef(null);

  // --- Load book metadata, access info, and the (already access-scoped) PDF bytes ---
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    async function load() {
      try {
        const [bookData, accessData, progressData] = await Promise.all([
          getBook(id),
          getAccess(id),
          user ? getProgress(id).catch(() => null) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setBook(bookData);
        setAccess(accessData);

        const res = await client.get(`/books/${id}/pdf`, { responseType: 'arraybuffer' });
        if (cancelled) return;

        const doc = await pdfjsLib.getDocument({ data: res.data }).promise;
        if (cancelled) return;
        setPdfDoc(doc);

        const startPage = progressData?.lastPage
          ? Math.min(progressData.lastPage, doc.numPages)
          : 1;
        setPageNum(startPage);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.status === 403
              ? "You don't currently have permission to read this book."
              : 'This book could not be loaded right now. Please try again shortly.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  // --- Render the current page to canvas whenever page/scale/doc changes ---
  useEffect(() => {
    if (!pdfDoc) return;
    let cancelled = false;

    (async () => {
      const page = await pdfDoc.getPage(pageNum);
      if (cancelled) return;
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      if (renderTaskRef.current) renderTaskRef.current.cancel();
      const task = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      try {
        await task.promise;
      } catch (e) {
        // Cancelled render (page/scale changed mid-render) — not a real error.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfDoc, pageNum, scale]);

  // --- Persist reading progress (debounced), logged-in users only ---
  useEffect(() => {
    if (!user || !pdfDoc) return;
    clearTimeout(progressSaveTimer.current);
    progressSaveTimer.current = setTimeout(() => {
      postProgress(id, pageNum).catch(() => {
        // A 403 here means access changed (e.g. expired) mid-session —
        // the banner reflects the latest `access` state on next load.
      });
    }, 600);
    return () => clearTimeout(progressSaveTimer.current);
  }, [pageNum, user, pdfDoc, id]);

  const goToPage = useCallback(
    (next) => {
      if (!pdfDoc) return;
      setPageNum(Math.min(Math.max(next, 1), pdfDoc.numPages));
    },
    [pdfDoc]
  );

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      wrapRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  // Deterrent only — see SETUP.md "Known limitations": this does not and
  // cannot prevent screen capture, only ordinary right-click-save.
  function handleContextMenu(e) {
    e.preventDefault();
  }

  if (loading) {
    return (
      <div className="reader-page">
        <div className="reader-loading">Loading book…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container state-block">
        <h3>Can't open this book</h3>
        <p>{error}</p>
        <Link to={`/books/${id}`} className="btn btn-primary">Back to book details</Link>
      </div>
    );
  }

  const percent = pdfDoc ? Math.round((pageNum / pdfDoc.numPages) * 100) : 0;

  return (
    <div className={`reader-page ${dark ? 'dark' : ''}`}>
      <div className="reader-topbar">
        <div>
          <Link to={`/books/${id}`} className="reader-back">← Back to details</Link>
          <div className="reader-topbar-title">{book?.title}</div>
        </div>
        <div className="reader-toolbar">
          <button onClick={() => goToPage(pageNum - 1)} disabled={pageNum <= 1} aria-label="Previous page">‹ Prev</button>
          <span className="reader-page-indicator">Page {pageNum} of {pdfDoc?.numPages || '—'}</span>
          <button onClick={() => goToPage(pageNum + 1)} disabled={pdfDoc && pageNum >= pdfDoc.numPages} aria-label="Next page">Next ›</button>
          <button onClick={() => setScale((s) => Math.max(MIN_SCALE, s - 0.15))} aria-label="Zoom out">−</button>
          <button onClick={() => setScale((s) => Math.min(MAX_SCALE, s + 0.15))} aria-label="Zoom in">+</button>
          <button onClick={() => setDark((d) => !d)} aria-label="Toggle dark mode">{dark ? '☀' : '☾'}</button>
          <button onClick={toggleFullscreen} aria-label="Toggle fullscreen">⛶</button>
        </div>
      </div>

      <div className="reader-progress-track">
        <div className="reader-progress-fill" style={{ width: `${percent}%` }} />
      </div>

      {access?.accessLevel === 'preview' && (
        <div className="reader-banner">
          <span>You're reading the free preview. The first 3 pages of every book are available for free.</span>
          <Link to="/subscription" className="btn btn-brass btn-sm">Subscribe for full access</Link>
        </div>
      )}

      <div className="reader-canvas-wrap" ref={wrapRef} onContextMenu={handleContextMenu}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
