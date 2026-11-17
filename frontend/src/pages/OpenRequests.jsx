import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import './OpenRequests.css';

// Placeholder data until the backend API is available
const INITIAL_REQUESTS = [
  { id: 18, user: 'User_03', location: 'Block B, Floor 1', problem: 'Needs help with classroom door', distance: '250 m' },
  { id: 19, user: 'User_07', location: 'Block A, Floor 2', distance: '400 m' },
];

export default function OpenRequests({ onBack }) {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [accepted, setAccepted] = useState(null);
  const [messaged, setMessaged] = useState(null);

  const handleAccept = (req) => {
    // TODO: send to backend when the API is available
    setRequests((list) => list.filter((r) => r.id !== req.id));
    setAccepted(req);
    setMessaged(null);
  };

  return (
    <div className="screen">
      <AppHeader subtitle="Help Requests" onBack={onBack} />

      <main className="content">
        <h2 className="page-title">Open Requests Nearby</h2>

        {accepted && (
          <div className="notice notice--success" role="status">
            <span className="notice__icon" aria-hidden="true">✓</span>
            You accepted Request #{accepted.id}. Head to {accepted.location}.
          </div>
        )}

        {requests.length === 0 ? (
          <div className="empty">
            <p>No open requests nearby right now.</p>
          </div>
        ) : (
          <ul className="request-list">
            {requests.map((req) => (
              <li key={req.id} className="request">
                <article className="request__card">
                  <h3>Request #{req.id} (from {req.user})</h3>
                  <p><span>Location:</span> {req.location}</p>
                  {req.problem && <p><span>Problem:</span> {req.problem}</p>}
                  <p><span>Distance:</span> {req.distance} away</p>
                </article>
                <div className="request__actions">
                  <button type="button" className="btn btn--outline" onClick={() => setMessaged(req.id)}>
                    Message User
                  </button>
                  <button type="button" className="btn btn--primary" onClick={() => handleAccept(req)}>
                    Accept Request
                  </button>
                </div>
                {messaged === req.id && (
                  <p className="request__hint" role="status">Messaging is coming soon.</p>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="footnote">Accepted or cancelled requests no longer appear in the open list.</p>
      </main>
    </div>
  );
}
