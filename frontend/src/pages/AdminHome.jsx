import AppHeader from '../components/AppHeader';
import { pendingCount } from '../lib/barrierReports';
import './RequestHelp.css';
import './ReviewReports.css';

export default function AdminHome({ onBack, onReviewReports, reports }) {
  const pending = pendingCount(reports);

  return (
    <div className="screen">
      <AppHeader subtitle="Administrator" onBack={onBack} />

      <main className="content">
        <h2 className="page-title">Admin Home</h2>
        <p className="reports__intro">Check the reports that need your review.</p>

        <button type="button" className="adminrow" onClick={onReviewReports}>
          <span className="adminrow__text">
            <strong>Review Barrier Reports</strong>
            <small>
              {pending === 0
                ? 'No reports are waiting'
                : `${pending} ${pending === 1 ? 'report is' : 'reports are'} pending`}
            </small>
          </span>
          {pending > 0 && (
            <span className="badge" aria-label={`${pending} pending`}>{pending}</span>
          )}
          <span className="adminrow__arrow" aria-hidden="true">&rsaquo;</span>
        </button>
      </main>
    </div>
  );
}
