import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import { acceptHelpRequest } from '../lib/helpRequests';
import './RequestHelp.css';

// No login yet: the helper's user id comes from config until auth exists.
const HELPER_ID = import.meta.env.VITE_HELPER_ID;

export default function AcceptRequest({ request, onBack }) {
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    if (!request.id) return;
    setBusy(true);
    setError('');
    const result = await acceptHelpRequest(request.id, HELPER_ID);
    setBusy(false);
    if (result.ok) setAccepted(true);
    else setError(result.error);
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
            <dd>{accepted ? 'Accepted' : 'Pending'}</dd>
          </div>
        </dl>
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleAccept}
          disabled={accepted || busy || !request.id}
        >
          {accepted ? 'Accepted' : busy ? 'Accepting…' : 'Accept Request'}
        </button>
        {!request.id && <p role="alert">No request selected.</p>}
        {error && <p role="alert">{error}</p>}
      </main>
    </div>
  );
}
