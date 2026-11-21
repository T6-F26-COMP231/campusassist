
import { useEffect, useRef, useState } from 'react';
import AppHeader from '../components/AppHeader';
import { fetchRequestStatus, isFinalStatus } from '../lib/helpRequests';
import './RequestStatus.css';

const POLL_MS = 10000;

const steps = [
  'Request Submitted',
  'Accepted',
  'On the Way',
  'Completed'
];

const statusMessages = {
  Pending: 'Your request has been received.',
  Accepted: 'A helper has accepted your request.',
  'On the Way': 'Your helper is on the way.',
  Completed: 'Your assistance has been completed.',
  Cancelled: 'Your request was cancelled.'
};

export default function RequestStatus({ onBack, requestId }) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkedAt, setCheckedAt] = useState(null);
  const refreshNow = useRef(() => {});

  // Retrieve request details from MongoDB through Express, and check again every few
  // seconds so the user sees when a helper accepts without reloading the page.
  useEffect(() => {
    let active = true;
    let timer = null;

    async function loadStatus(silent) {
      if (!silent) {
        setLoading(true);
        setError('');
        setRequest(null);
      }

      const result = await fetchRequestStatus(requestId);
      if (!active) return;

      if (result.ok) {
        setRequest(result.request);
        setError('');
        setCheckedAt(new Date());
        if (isFinalStatus(result.request.status) && timer) {
          clearInterval(timer);
          timer = null;
        }
      } else if (!silent) {
        setError(result.error);
      }
      // A failed check in the background keeps showing the last known status.
      setLoading(false);
    }

    loadStatus(false);
    if (requestId) {
      timer = setInterval(() => loadStatus(true), POLL_MS);
    }
    refreshNow.current = () => loadStatus(true);

    return () => {
      active = false;
      if (timer) clearInterval(timer);
    };
  }, [requestId]);

  const currentStatus = request?.status || 'Pending';

  const statusIndex = {
    Pending: 0,
    Accepted: 1,
    'On the Way': 2,
    Completed: 3
  }[currentStatus] ?? 0;

  return (
    <div className="screen">
      <AppHeader
        subtitle="In-Person Assistance"
        onBack={onBack}
      />

      <main className="content">
        <h2 className="page-title">
          My Help Request Status
        </h2>

        {loading && (
          <p role="status">Loading request status...</p>
        )}

        {!loading && error && (
          <p role="alert">{error}</p>
        )}

        {!loading && !error && !request && (
          <p role="alert">Request not found.</p>
        )}

        {!loading && !error && request && (
          <>
            <section className="status-details">
              <p>
                <strong>Assistance Type:</strong>{' '}
                {request.assistanceType}
              </p>

              <p>
                <strong>Current Location:</strong>{' '}
                {request.currentLocation}
              </p>

              <p>
                <strong>Destination / Description:</strong>{' '}
                {request.description || 'Not specified'}
              </p>

              <p>
                <strong>Assigned Helper:</strong>{' '}
                {request.helperId
                  ? typeof request.helperId === 'object'
                    ? request.helperId.name ||
                      request.helperId._id ||
                      'Helper information unavailable'
                    : request.helperId
                  : 'Not assigned yet'}
              </p>
            </section>

            {currentStatus === 'Cancelled' ? (
              <p className="status-message" role="status">
                This request has been cancelled.
              </p>
            ) : (
              <ol className="status-timeline">
                {steps.map((step, index) => (
                  <li
                    key={step}
                    className={`status-step ${
                      index < statusIndex
                        ? 'status-step--done'
                        : index === statusIndex
                        ? 'status-step--current'
                        : 'status-step--upcoming'
                    }`}
                  >
                    <span className="status-step__marker">
                      {index < statusIndex ? '✓' : ''}
                    </span>

                    <div>
                      <strong>{step}</strong>

                      {step === 'Request Submitted' && (
                        <small>Your request was received</small>
                      )}

                      {step === 'Accepted' && (
                        <small>A helper has accepted your request</small>
                      )}

                      {step === 'On the Way' && (
                        <small>Your helper is coming</small>
                      )}

                      {step === 'Completed' && (
                        <small>Assistance finished</small>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}

            <section className="status-message" role="status">
              <strong>
                Current Status: {currentStatus}
              </strong>

              <p>
                {statusMessages[currentStatus] ||
                  'Status information unavailable.'}
              </p>
            </section>

            {!isFinalStatus(currentStatus) && (
              <div className="status-refresh">
                <small>
                  Checks for updates every few seconds
                  {checkedAt && ` \u00b7 last checked ${checkedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}`}
                </small>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => refreshNow.current()}
                >
                  Check now
                </button>
              </div>
            )}
          </>
        )}

        <button
          type="button"
          className="btn btn--secondary"
          onClick={onBack}
        >
          Back to Dashboard
        </button>
      </main>
    </div>
  );
}
