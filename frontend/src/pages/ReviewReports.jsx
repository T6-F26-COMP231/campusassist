import { useRef, useState } from 'react';
import AppHeader from '../components/AppHeader';
import {
  REPORT_TABS,
  emptyMessage,
  reportTitle,
  reportsForTab,
  tabCounts,
} from '../lib/barrierReports';
import './RequestHelp.css';
import './ReviewReports.css';

export default function ReviewReports({ onBack, reports }) {
  const [tab, setTab] = useState('pending');
  const [openId, setOpenId] = useState(null);
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

  if (open) {
    return (
      <div className="screen">
        <AppHeader subtitle="Barrier Report" onBack={() => setOpenId(null)} />
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
          <button type="button" className="btn btn--secondary" onClick={() => setOpenId(null)}>
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
            {tab === 'pending' && counts.pending > 0
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
          Reports 001 and 002 are sample data. Reports sent from the app appear here until the app is
          reloaded.
        </p>
      </main>
    </div>
  );
}
