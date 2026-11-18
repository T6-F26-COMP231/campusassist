
import { useEffect, useState } from 'react';
import AppHeader from '../components/AppHeader';
import './OpenRequests.css';

export default function OpenRequests({ onBack }) {
  const [requests, setRequests] = useState([]);
  const [block, setBlock] = useState('B');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messaged, setMessaged] = useState(null);
  const [notice, setNotice] = useState('');

  // Story 17 - Retrieve pending requests from MongoDB
  useEffect(() => {
    let active = true;

    async function loadRequests() {
      setLoading(true);
      setError('');
      setNotice('');

      try {
        const response = await fetch(
          `/api/help-requests/pending?block=${block}`
        );

        if (!response.ok) {
          throw new Error('Unable to load help requests');
        }

        const data = await response.json();

        if (active) {
          setRequests(data.requests || []);
        }
      } catch (err) {
        if (active) {
          setRequests([]);
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRequests();

    return () => {
      active = false;
    };
  }, [block]);

  // Story 18 UI integration will be handled separately.
  // Do not remove a request until MongoDB confirms acceptance.
  const handleAccept = () => {
    setNotice(
      'Request acceptance is not connected on this screen yet.'
    );
  };

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
          <option value="A">A Block</option>
          <option value="B">B Block</option>
          <option value="C">C Block</option>
        </select>

        {notice && (
          <div className="notice" role="status">
            {notice}
          </div>
        )}

        {loading && (
          <p role="status">Loading help requests...</p>
        )}

        {error && (
          <div className="notice" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="empty">
            <p>No open requests nearby right now.</p>
          </div>
        )}

        {!loading && !error && requests.length > 0 && (
          <ul className="request-list">
            {requests.map((req) => (
              <li key={req._id} className="request">
                <article className="request__card">
                  <h3>
                    Request #{req._id.slice(-6)}
                  </h3>

                  <p>
                    <span>Location:</span>{' '}
                    {req.currentLocation}
                  </p>

                  {req.description && (
                    <p>
                      <span>Problem:</span>{' '}
                      {req.description}
                    </p>
                  )}

                  <p>
                    <span>Assistance Type:</span>{' '}
                    {req.assistanceType}
                  </p>

                  <p>
                    <span>Status:</span>{' '}
                    {req.status}
                  </p>
                </article>

                <div className="request__actions">
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => setMessaged(req._id)}
                  >
                    Message User
                  </button>

                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={handleAccept}
                  >
                    Accept Request
                  </button>
                </div>

                {messaged === req._id && (
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
