
import { useState } from 'react';
import AppHeader from './components/AppHeader';
import RequestHelp from './pages/RequestHelp';
import AcceptRequest from './pages/AcceptRequest';
import DirectionsToUser from './pages/DirectionsToUser';
import OpenRequests from './pages/OpenRequests';
import RequestStatus from './pages/RequestStatus';
import './pages/RequestHelp.css';

function Home({
  onRequestHelp,
  onOpenRequests,
  onRequestStatus
}) {
  return (
    <div className="screen">
      <AppHeader subtitle="Centennial College Navigation & Support" />

      <main className="content home">
        <h2 className="page-title">Welcome</h2>

        <p>
          Find your way around campus and request
          in-person assistance when needed.
        </p>

        <button
          className="btn btn--primary"
          onClick={onRequestHelp}
        >
          Request In-Person Help
        </button>

        <button
          className="btn btn--secondary"
          onClick={onRequestStatus}
        >
          My Help Request Status
        </button>

        <button
          className="btn btn--secondary"
          onClick={onOpenRequests}
        >
          View Open Requests (Volunteer)
        </button>

        <button className="btn btn--secondary" disabled>
          Search Location (coming soon)
        </button>

        <button className="btn btn--secondary" disabled>
          Report Barrier (coming soon)
        </button>
      </main>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState('home');
  const [selected, setSelected] = useState(null);

  // Story 10: Remember the request submitted by the campus user.
  const [submittedRequestId, setSubmittedRequestId] = useState(null);

  const goHome = () => {
    setSelected(null);
    setPage('home');
  };

  // Story 8: Submit a help request.
  if (page === 'help') {
    return (
      <RequestHelp
        onBack={goHome}
        onRequestCreated={(requestId) => {
          setSubmittedRequestId(requestId);
        }}
        onSubmitted={(requestId) => {
          setSubmittedRequestId(requestId);
          setPage('status');
        }}
      />
    );
  }

  // Story 19: Show directions to the selected user.
  if (page === 'directions' && selected) {
    return (
      <DirectionsToUser
        request={selected}
        onBack={() => setPage('accept')}
      />
    );
  }

  // Story 18: Accept the selected help request.
  if (page === 'accept' && selected) {
    return (
      <AcceptRequest
        request={selected}
        onBack={() => setPage('open')}
        onDirections={() => setPage('directions')}
      />
    );
  }

  // Story 17: View pending help requests.
  if (page === 'open') {
    return (
      <OpenRequests
        onBack={goHome}
        onAccept={(request) => {
          setSelected(request);
          setPage('accept');
        }}
      />
    );
  }

  // Story 10: View the actual submitted request.
  if (page === 'status') {
    return (
      <RequestStatus
        onBack={goHome}
        requestId={submittedRequestId}
      />
    );
  }

  return (
    <Home
      onRequestHelp={() => setPage('help')}
      onOpenRequests={() => setPage('open')}
      onRequestStatus={() => setPage('status')}
    />
  );
}
