import { useEffect, useRef, useState } from 'react';
import AppHeader from '../components/AppHeader';
import {
  REPORT_TABS,
  RESOLVE_BLOCKED_MESSAGE,
  canApprove,
  canReject,
  canResolve,
  emptyMessage,
  reportTitle,
  reportsForTab,
  tabCounts,
} from '../lib/barrierReports';
import { fetchReviewReports } from '../lib/reviewReportsLoader';
import './RequestHelp.css';
import './ReviewReports.css';

export default function ReviewReports({ onBack, reports, onLoaded, onApprove, onReject, onResolve }) {
  const [tab, setTab] = useState('pending');
  const [openId, setOpenId] = useState(null);
  const [confirming, setConfirming] = useState(null); // 'approve', 'reject', 'resolve' or null
  const [resolving, setResolving] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const tabRefs = useRef({});

  // Story 24: load the pending reports from the backend each time this page opens.
  // `onLoaded` must stay the same function between renders, or the reports load again.
  const [load, setLoad] = useState({ loading: true, error: '', approvedError: '', attempt: 0 });

  useEffect(() => {
    let cancelled = false;

    fetchReviewReports().then((result) => {
      if (cancelled) return;

      if (result.ok) {
        onLoaded?.(result.reports);
        setLoad((current) => ({
          ...current,
          loading: false,
          error: '',
          approvedError: result.approvedError || '',
        }));
      } else {
        setLoad((current) => ({
          ...current,
          loading: false,
          error: result.error,
          approvedError: result.approvedError || '',
        }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [load.attempt, onLoaded]);

  const retry = () => setLoad((current) => ({
    loading: true,
    error: '',
    approvedError: '',
    attempt: current.attempt + 1,
  }));

  // Only the Pending tab depends on the backend, so Approved and Closed stay usable.
  const pendingUnavailable = tab === 'pending' && Boolean(load.loading || load.error);

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
    setConfirming(null);
    setResolving(false);
    setOutcome(null);
  };

  const approve = async () => {
    const id = open.id;
    setConfirming(null);
    const result = await onApprove?.(id);
    setOutcome({ kind: 'approved', ...(result ?? { ok: false, error: 'This report could not be approved.' }) });
  };

  const reject = async () => {
    const id = open.id;
    setConfirming(null);
    const result = await onReject?.(id);
    setOutcome({ kind: 'rejected', ...(result ?? { ok: false, error: 'This report could not be rejected.' }) });
  };

  const resolve = async () => {
    setResolving(true);
    const result = await onResolve?.(open.id);
    setResolving(false);
    setConfirming(null);
    setOutcome({
      kind: 'resolved',
      ...(result ?? { ok: false, error: 'This barrier could not be marked resolved.' }),
    });
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
                {{
                  approved: `${reportTitle(open)} was approved. It is now listed under Approved.`,
                  rejected: `${reportTitle(open)} was rejected. It is now listed under Closed.`,
                  resolved: `${reportTitle(open)} was marked resolved. It is now listed under Closed.`,
                }[outcome.kind]}
              </div>
            )}
          </div>
          {outcome && !outcome.ok && (
            <div className="notice notice--error" role="alert">
              <span className="notice__icon" aria-hidden="true">!</span>
              {outcome.error}
            </div>
          )}

          {canApprove(open) && !confirming && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                setOutcome(null);
                setConfirming('approve');
              }}
            >
              Approve
            </button>
          )}

          {canReject(open) && !confirming && (
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                setOutcome(null);
                setConfirming('reject');
              }}
            >
              Reject
            </button>
          )}

          {open.status !== 'Resolved' && open.status !== 'Rejected' && !confirming && (
            <>
              <button
                type="button"
                className={`btn ${canApprove(open) ? 'btn--secondary' : 'btn--primary'}`}
                disabled={!canResolve(open)}
                aria-describedby={canResolve(open) ? undefined : 'resolve-help'}
                onClick={() => {
                  setOutcome(null);
                  setConfirming('resolve');
                }}
              >
                Mark as Resolved
              </button>
              {!canResolve(open) && (
                <p id="resolve-help" className="resolve__help">{RESOLVE_BLOCKED_MESSAGE}</p>
              )}
            </>
          )}

          {confirming === 'approve' && (
            <section className="resolve__confirm" role="group" aria-labelledby="approve-title">
              <h3 id="approve-title">Approve {reportTitle(open)}?</h3>
              <p>
                The report moves to Approved and no longer counts as pending. Only an approved barrier can
                be marked resolved later.
              </p>
              <div className="resolve__actions">
                <button type="button" className="btn btn--primary" onClick={approve} autoFocus>
                  Yes, approve
                </button>
                <button type="button" className="btn btn--secondary" onClick={() => setConfirming(null)}>
                  Cancel
                </button>
              </div>
            </section>
          )}

          {confirming === 'reject' && (
            <section className="resolve__confirm" role="group" aria-labelledby="reject-title">
              <h3 id="reject-title">Reject {reportTitle(open)}?</h3>
              <p>
                Use this for a report that is false or a mistake. It moves to Closed and no longer counts as
                pending. You cannot undo this here.
              </p>
              <div className="resolve__actions">
                <button type="button" className="btn btn--primary" onClick={reject} autoFocus>
                  Yes, reject
                </button>
                <button type="button" className="btn btn--secondary" onClick={() => setConfirming(null)}>
                  Cancel
                </button>
              </div>
            </section>
          )}

          {confirming === 'resolve' && (
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
                <button type="button" className="btn btn--secondary" onClick={() => setConfirming(null)} disabled={resolving}>
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
          {tab === 'approved' && load.approvedError && (
            <>
              <div className="notice notice--error" role="alert">
                <span className="notice__icon" aria-hidden="true">!</span>
                {load.approvedError}
              </div>
              <button type="button" className="btn btn--secondary" onClick={retry}>
                Try again
              </button>
            </>
          )}

          <p className="reports__summary" role="status" aria-live="polite">
            {shown.length === 0 || pendingUnavailable
              ? ''
              : tab === 'pending'
                ? `${counts.pending} ${counts.pending === 1 ? 'report is' : 'reports are'} waiting for review, oldest first`
                : `${shown.length} ${shown.length === 1 ? 'report' : 'reports'}`}
          </p>

          {pendingUnavailable && load.loading ? (
            <div className="reports__empty" role="status">
              <p>Loading barrier reports...</p>
            </div>
          ) : pendingUnavailable ? (
            <>
              <div className="notice notice--error" role="alert">
                <span className="notice__icon" aria-hidden="true">!</span>
                {load.error}
              </div>
              <button type="button" className="btn btn--secondary" onClick={retry}>
                Try again
              </button>
            </>
          ) : shown.length === 0 ? (
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
