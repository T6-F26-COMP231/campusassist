import { useRef, useState } from 'react';
import AppHeader from '../components/AppHeader';
import {
  REPORT_TABS,
  RESOLVE_BLOCKED_MESSAGE,
  canResolve,
  emptyMessage,
  reportTitle,
  reportsForTab,
  tabCounts,
} from '../lib/barrierReports';
import './RequestHelp.css';
import './ReviewReports.css';

export default function ReviewReports({ onBack, reports, onResolve }) {
  const [tab, setTab] = useState('pending');
  const [openId, setOpenId] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const tabRefs = useRef({});

  const counts = tabCounts(reports);
  const shown = reportsForTab(reports, tab);
  const open = reports.find((report) => report.id === openId);

  // Left and right arrows move between tabs, as people expect from a tab list.
  const moveTab = (event, index) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = REPORT_TABS[(index + step + REPORT_TABS.length) % REPORT_TABS.length];
    setTab(next.id);
    tabRefs.current[next.id]?.focus();
  };

  const closeDetails = () => {
    setOpenId(null);
    setConfirming(false);
    setResolving(false);
    setOutcome(null);
  };

  const resolve = async () => {
    setResolving(true);
    const result = await onResolve?.(open.id);
    setResolving(false);
    setConfirming(false);
    setOutcome(result ?? { ok: false, error: 'This barrier could not be marked resolved.' });
  };

  if (open) {
    return (
      <div className="screen">
        <AppHeader subtitle="Barrier Report" onBack={closeDetails} />
        <main className="content">
          <h2 className="page-title">{reportTitle(open)}</h2>
          <dl className="request-details">
            <div><dt>Status</dt><dd>{open.status ?? 'Pending'}</dd></div>
            <div><dt>Type</dt><dd>{open.typeLabel}</dd></div>
            <div><dt>Location</dt><dd>{open.location}</dd></div>
            <div><dt>Details</dt><dd>{open.description || 'No description'}</dd></div>
            {open.roleLabel && <div><dt>Reported by</dt><dd>{open.roleLabel}</dd></div>}
            {open.photoName && <div><dt>Photo</dt><dd>{open.photoName}</dd></div>}
          </dl>

          <div role="status" aria-live="polite">
            {outcome?.ok && (
              <div className="notice notice--success">
                <span className="notice__icon" aria-hidden="true">&#10003;</span>
                {reportTitle(open)} was marked resolved. It is now listed under Closed.
              </div>
            )}
          </div>
          {outcome && !outcome.ok && (
            <div className="notice notice--error" role="alert">
              <span className="notice__icon" aria-hidden="true">!</span>
              {outcome.error}
            </div>
          )}

          {open.status !== 'Resolved' && open.status !== 'Rejected' && !confirming && (
            <>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!canResolve(open)}
                aria-describedby={canResolve(open) ? undefined : 'resolve-help'}
                onClick={() => {
                  setOutcome(null);
                  setConfirming(true);
                }}
              >
                Mark as Resolved
              </button>
              {!canResolve(open) && (
                <p id="resolve-help" className="resolve__help">{RESOLVE_BLOCKED_MESSAGE}</p>
              )}
            </>
          )}

          {confirming && (
            <section className="resolve__confirm" role="group" aria-labelledby="resolve-title">
              <h3 id="resolve-title">Mark {reportTitle(open)} as resolved?</h3>
              <p>
                The barrier is cleared. It moves to Closed and no longer counts as an open barrier. You
                cannot undo this here.
              </p>
              <div className="resolve__actions">
                <button type="button" className="btn btn--primary" onClick={resolve} disabled={resolving} autoFocus>
                  Yes, mark resolved
                </button>
                <button type="button" className="btn btn--secondary" onClick={() => setConfirming(false)} disabled={resolving}>
                  Cancel
                </button>
              </div>
            </section>
          )}

          <button type="button" className="btn btn--secondary" onClick={closeDetails}>
            Back to reports
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="screen">
      <AppHeader subtitle="Barrier Reports" onBack={onBack} />

      <main className="content">
        <h2 className="page-title">Barrier Reports</h2>

        <div className="reports__tabs" role="tablist" aria-label="Report status">
          {REPORT_TABS.map((entry, index) => (
            <button
              key={entry.id}
              id={`tab-${entry.id}`}
              ref={(node) => { tabRefs.current[entry.id] = node; }}
              type="button"
              role="tab"
              aria-selected={tab === entry.id}
              aria-controls="reports-panel"
              tabIndex={tab === entry.id ? 0 : -1}
              className={`reports__tab ${tab === entry.id ? 'reports__tab--on' : ''}`}
              onClick={() => setTab(entry.id)}
              onKeyDown={(event) => moveTab(event, index)}
            >
              {entry.label} <span className="reports__count">({counts[entry.id]})</span>
            </button>
          ))}
        </div>

        <div id="reports-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="reports__panel">
          <p className="reports__summary" role="status" aria-live="polite">
            {shown.length === 0
              ? ''
              : tab === 'pending'
                ? `${counts.pending} ${counts.pending === 1 ? 'report is' : 'reports are'} waiting for review, oldest first`
                : `${shown.length} ${shown.length === 1 ? 'report' : 'reports'}`}
          </p>

          {shown.length === 0 ? (
            <div className="reports__empty">
              <p>{emptyMessage(tab)}</p>
            </div>
          ) : (
            <ul className="report-list">
              {shown.map((report) => (
                <li key={report.id}>
                  <article className="report">
                    <h3>{reportTitle(report)}</h3>
                    <p><span>Location:</span> {report.location}</p>
                    <p><span>Description:</span> {report.description || 'No description'}</p>
                    <button type="button" className="btn btn--outline" onClick={() => setOpenId(report.id)}>
                      View Details
                      <span className="reports__sr"> for {reportTitle(report)}</span>
                    </button>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="reports__footnote">
          Reports sent from the app appear here until the app is reloaded.
        </p>
      </main>
    </div>
  );
}
