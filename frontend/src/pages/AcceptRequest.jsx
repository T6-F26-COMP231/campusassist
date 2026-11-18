import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import { acceptHelpRequest } from '../lib/helpRequests';
import './RequestHelp.css';

// No login yet: the helper's user id comes from config until auth exists.
const HELPER_ID = import.meta.env.VITE_HELPER_ID;

const SAMPLE_REQUEST = {
  id: 'REQ-001',
  _id: import.meta.env.VITE_SAMPLE_REQUEST_ID,
  name: 'Sam Student',
  location: 'Room B101',
  need: 'Standard Guiding',
};

export default function AcceptRequest({ request = SAMPLE_REQUEST, onBack }) {
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    setBusy(true);
    setError('');
    const result = await acceptHelpRequest(request._id ?? request.id, HELPER_ID);
    setBusy(false);
    if (result.ok) setAccepted(true);
    else setError(result.error);
  };

  return (
    <div className="screen">
      <AppHeader subtitle="Accept a request" onBack={onBack} />
      <main className="content">
        <h2 className="page-title">Request {request.id}</h2>
        <dl className="request-details">
          <div>
            <dt>From</dt>
            <dd>{request.name}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{request.location}</dd>
          </div>
          <div>
            <dt>Needs</dt>
            <dd>{request.need}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{accepted ? 'Accepted' : 'Pending'}</dd>
          </div>
        </dl>
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleAccept}
          disabled={accepted || busy}
        >
          {accepted ? 'Accepted' : busy ? 'Accepting…' : 'Accept Request'}
        </button>
        {error && <p role="alert">{error}</p>}
      </main>
    </div>
  );
}
