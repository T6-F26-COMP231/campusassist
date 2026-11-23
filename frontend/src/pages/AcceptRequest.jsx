import { useEffect, useState } from 'react';
import { fetchRequestMessages } from '../lib/messages';
import AppHeader from '../components/AppHeader';
import FloorPlan from '../components/FloorPlan';
import UserMessages from '../components/UserMessages';
import { acceptHelpRequest } from '../lib/helpRequests';
import './RequestHelp.css';

// No login yet: the helper's user id comes from config until auth exists.
const HELPER_ID = import.meta.env.VITE_HELPER_ID;

export default function AcceptRequest({ request, onBack, onDirections }) {
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('Pending');
    const [userMessages, setUserMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState('');
  const [messagesAttempt, setMessagesAttempt] = useState(0);

  useEffect(() => {
    if (!accepted || !request.id) return;

    let active = true;

    async function loadMessages() {
      setMessagesLoading(true);
      setMessagesError('');

      const result = await fetchRequestMessages(request.id);
      if (!active) return;

      if (result.ok) {
        setUserMessages(result.messages);
      } else {
        setMessagesError(result.error);
      }

      setMessagesLoading(false);
    }

    loadMessages();

    return () => {
      active = false;
    };
  }, [accepted, request.id, messagesAttempt]);
  const handleAccept = async () => {
    if (!request.id) return;
    setBusy(true);
    setError('');
    setMessage('');
    const result = await acceptHelpRequest(request.id, HELPER_ID);
    setBusy(false);
    if (result.ok) {
      setAccepted(true);
      setMessage(result.message);
      setStatus(result.request?.status || 'Accepted');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="screen">
      <AppHeader subtitle="Accept a request" onBack={onBack} />
      <main className="content">
        <h2 className="page-title">Accept this request</h2>
        <dl className="request-details">
          <div>
            <dt>Location</dt>
            <dd>{request.location}</dd>
          </div>
          <div>
            <dt>Needs</dt>
            <dd>{request.need}</dd>
          </div>
          {request.description && (
            <div>
              <dt>Details</dt>
              <dd>{request.description}</dd>
            </div>
          )}
          <div>
            <dt>Status</dt>
            <dd>{status}</dd>
          </div>
        </dl>
               {accepted && (
          <section aria-labelledby="user-messages-title">
            <h3 id="user-messages-title">Messages from the user</h3>

            {messagesLoading && (
              <p role="status">Loading messages...</p>
            )}

            {messagesError && (
              <p className="notice notice--error" role="alert">
                {messagesError}
              </p>
            )}

            {!messagesLoading && !messagesError && userMessages.length === 0 && (
              <p>No messages from the user yet.</p>
            )}

            {!messagesLoading && !messagesError && userMessages.length > 0 && (
              <ol aria-label="Messages from the user">
                {userMessages.map((item) => (
                  <li key={item.id}>
                    <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                      {item.text}
                    </p>
                    <small>{new Date(item.sentAt).toLocaleString()}</small>
                  </li>
                ))}
              </ol>
            )}

            <button
              type="button"
              className="btn btn--secondary"
              disabled={messagesLoading}
              onClick={() => setMessagesAttempt((count) => count + 1)}
            >
              {messagesLoading ? 'Loading messages...' : 'Refresh messages'}
            </button>
          </section>
        )}
        <FloorPlan location={request.location} />
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleAccept}
          disabled={accepted || busy || !request.id}
        >
          {accepted ? 'Accepted' : busy ? 'Accepting…' : 'Accept Request'}
        </button>
        {message && (
          <div className="notice notice--success" role="status">
            {message}
          </div>
        )}
        <button
          type="button"
          className="btn btn--secondary"
          onClick={onDirections}
        >
          Directions to this user
        </button>
        {request.id && <UserMessages requestId={request.id} />}
        {!request.id && (
          <div className="notice notice--error" role="alert">
            No request selected.
          </div>
        )}
        {error && (
          <div className="notice notice--error" role="alert">
            {error}
          </div>
        )}
        {(accepted || error) && (
          <button type="button" className="btn btn--secondary" onClick={onBack}>
            Back to open requests
          </button>
        )}
      </main>
    </div>
  );
}