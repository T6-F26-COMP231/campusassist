
import { useEffect, useRef, useState } from 'react';
import AppHeader from '../components/AppHeader';
import MessageHelper from '../components/MessageHelper';
import { fetchRequestStatus, isFinalStatus } from '../lib/helpRequests';
import { addChange, describeChange, detectStatusChange, newestFirst } from '../lib/statusChanges';
import './RequestStatus.css';

const POLL_MS = 10000;

const timeOf = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

const steps = [
  'Request Submitted',
  'Accepted',
  'On the Way',
  'Arrived',
  'Completed'
];

const statusMessages = {
  Pending: 'Your request has been received.',
  Accepted: 'A helper has accepted your request.',
  'On the Way': 'Your helper is on the way.',
  Arrived: 'Your helper has arrived.',
  Completed: 'Your assistance has been completed.',
  Cancelled: 'Your request was cancelled.'
};

export default function RequestStatus({ onBack, requestId, messages, onSendMessages }) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkedAt, setCheckedAt] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [changes, setChanges] = useState([]);
  const [notice, setNotice] = useState(null);
  const lastStatus = useRef(null);
  const refreshNow = useRef(() => {});

  // Retrieve request details from MongoDB through Express, and check again every few
  // seconds so the user sees when a helper accepts without reloading the page.
  useEffect(() => {
    let active = true;
    let timer = null;

    // A new request starts with no changes.
    lastStatus.current = null;
    setChanges([]);
    setNotice(null);

    async function loadStatus(silent) {
      if (!silent) {
        setLoading(true);
        setError('');
        setRequest(null);
      }

      const result = await fetchRequestStatus(requestId);
      if (!active) return;

      if (result.ok) {
        // The first status seen is the starting point. Later checks that find a different status
        // tell the user what changed and when.
        const change = detectStatusChange(lastStatus.current, result.request.status);
        lastStatus.current = result.request.status ?? lastStatus.current;
        if (change) {
          setChanges((history) => addChange(history, change));
          setNotice(change);
        }
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
  }, [requestId, attempt]);

  // A missing or unrecognized status is shown as unavailable, not as Pending.
  const currentStatus = request?.status;
  const statusKnown = Object.hasOwn(statusMessages, currentStatus);

  const statusIndex = {
    Pending: 0,
    Accepted: 1,
    'On the Way': 2,
    Arrived: 3,
    Completed: 4
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
          <div className="notice notice--error" role="alert">
            {error}
          </div>
        )}

        {!loading && error && requestId && (
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => setAttempt((count) => count + 1)}
          >
            Try again
          </button>
        )}

        {!loading && !error && !request && (
          <div className="notice notice--error" role="alert">
            Request not found.
          </div>
        )}

        {!loading && !error && request && (
          <>
            {notice && (
              <div className="notice notice--success status-change" role="status">
                <span className="notice__icon" aria-hidden="true">&#10003;</span>
                <div>
                  <strong>{describeChange(notice)}</strong>
                  <small>
                    {statusMessages[notice.to] ?? 'Status information unavailable.'} &middot; {timeOf(notice.at)}
                  </small>
                </div>
                <button type="button" className="status-change__close" onClick={() => setNotice(null)}>
                  Dismiss
                </button>
              </div>
            )}

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
              ) : statusKnown && (
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

                      {step === 'Arrived' && (
                        <small>Your helper has arrived</small>
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
              Current Status: {statusKnown ? currentStatus : 'Unavailable'}
              </strong>

              <p>
                {statusKnown
                  ? statusMessages[currentStatus]
                  : 'Status information unavailable. Please check again shortly.'}
              </p>
            </section>

            {changes.length > 0 && (
              <section className="status-history" aria-labelledby="status-history-title">
                <h3 id="status-history-title">Status changes</h3>
                <ol>
                  {newestFirst(changes).map((change) => (
                    <li key={change.at + change.to}>
                      <span>{change.from} &rarr; {change.to}</span>
                      <small>{timeOf(change.at)}</small>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <MessageHelper
              request={request}
              messages={messages}
              onSend={onSendMessages}
            />

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
