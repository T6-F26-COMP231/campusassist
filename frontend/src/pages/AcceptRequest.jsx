import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import './RequestHelp.css';

const SAMPLE_REQUEST = {
  id: 'REQ-001',
  name: 'Sam Student',
  location: 'Room B101',
  need: 'Standard Guiding',
};

export default function AcceptRequest({ request = SAMPLE_REQUEST, onBack }) {
  const [accepted, setAccepted] = useState(false);

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
          onClick={() => setAccepted(true)}
          disabled={accepted}
        >
          {accepted ? 'Accepted' : 'Accept Request'}
        </button>
      </main>
    </div>
  );
}
