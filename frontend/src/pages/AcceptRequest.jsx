import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import FloorPlan from '../components/FloorPlan';
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