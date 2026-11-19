
import { useEffect, useState } from 'react';
import AppHeader from '../components/AppHeader';
import { fetchPendingRequests } from '../lib/helpRequests';
import './OpenRequests.css';

const BLOCKS = ['A', 'B', 'C'];

export default function OpenRequests({ onBack, onAccept }) {
  const [block, setBlock] = useState('A');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messaged, setMessaged] = useState(null);

  // Story 17: Retrieve pending requests from MongoDB
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');
    setRequests([]);

    fetchPendingRequests(block).then((result) => {
      if (cancelled) return;

      setLoading(false);

      if (result.ok) {
        setRequests(result.requests);
      } else {
        setRequests([]);
        setError(result.error);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [block]);

  return (
    <div className="screen">
      <AppHeader subtitle="Help Requests" onBack={onBack} />

      <main className="content">
        <h2 className="page-title">Open Requests Nearby</h2>

        <label htmlFor="campus-block">
          Select Campus Block
        </label>

        <select
          id="campus-block"
          value={block}
          onChange={(e) => setBlock(e.target.value)}
        >
          {BLOCKS.map((b) => (
            <option key={b} value={b}>
              {b} Block
            </option>
          ))}
        </select>

        {loading && (
          <p role="status">Loading help requests...</p>
        )}

        {error && (
          <p role="alert">{error}</p>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="empty">
            <p>No open requests in Block {block} right now.</p>
          </div>
        )}

        {!loading && !error && requests.length > 0 && (
          <ul className="request-list">
            {requests.map((req) => (
              <li key={req.id} className="request">
                <article className="request__card">
                  <h3>Request #{String(req.id).slice(-6)}</h3>

                  <p>
                    <span>Location:</span> {req.location}
                  </p>

                  {req.description && (
                    <p>
                      <span>Problem:</span> {req.description}
                    </p>
                  )}

                  <p>
                    <span>Assistance Type:</span> {req.need}
                  </p>
                </article>

                <div className="request__actions">
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => setMessaged(req.id)}
                  >
                    Message User
                  </button>

                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => onAccept(req)}
                    disabled={!req.id || !onAccept}
                  >
                    Accept Request
                  </button>
                </div>

                {messaged === req.id && (
                  <p className="request__hint" role="status">
                    Messaging is coming soon.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="footnote">
          Accepted or cancelled requests no longer
          appear in the open list.
        </p>
      </main>
    </div>
  );
}
