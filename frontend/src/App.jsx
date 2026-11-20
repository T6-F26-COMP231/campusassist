
import { useState } from 'react';
import AppHeader from './components/AppHeader';
import RequestHelp from './pages/RequestHelp';
import AcceptRequest from './pages/AcceptRequest';
import DirectionsToUser from './pages/DirectionsToUser';
import OpenRequests from './pages/OpenRequests';
import AccessibleFacilities from './pages/AccessibleFacilities';
import SearchLocation from './pages/SearchLocation';
import StepByStepDirections from './pages/StepByStepDirections';
import RequestStatus from './pages/RequestStatus';
import AccessibilityFeatures from './pages/AccessibilityFeatures';
import ReportBarrier from './pages/ReportBarrier';
import './pages/RequestHelp.css';

function Home({
  onRequestHelp,
  onOpenRequests,
  onRequestStatus,
  onFacilities,
  onSearch,
  onGetDirections,
  onFeatures,
  onReportBarrier
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

        <button
          className="btn btn--secondary"
          onClick={onFacilities}
        >
          Find Accessible Facilities
        </button>

        <button
          className="btn btn--secondary"
onClick={onSearch}
>
  Search Location
</button>

<button
  className="btn btn--secondary"
  onClick={onFeatures}
>
  Check Destination Accessibility

        </button>

        <button
          className="btn btn--secondary"
          onClick={onGetDirections}
        >
          Get Step-by-Step Directions
        </button>

        <button
          className="btn btn--secondary"
          onClick={onReportBarrier}
        >
          Report Barrier
        </button>
      </main>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState('home');
  const [selected, setSelected] = useState(null);

  // Story 12: Barrier reports sent during this visit. They set the next report number.
  const [barrierReports, setBarrierReports] = useState([]);

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

  // Story 3: Filter and map accessible facilities.
  if (page === 'facilities') {
    return <AccessibleFacilities onBack={goHome} />;
  }


  // Story 12: Report a barrier with its location.
  if (page === 'barrier') {
    return (
      <ReportBarrier
        onBack={goHome}
        reportCount={barrierReports.length}
        onReported={(report) => setBarrierReports((list) => [...list, report])}
      />
    );
  }

  // Story 6: Step-by-step directions to a destination.
  if (page === 'route') {
    return <StepByStepDirections onBack={goHome} />;
  }

  // Story 2: Search for a location by name.
  if (page === 'search') {
    return <SearchLocation onBack={goHome} />;
  }

  // Story 4: See the accessibility features of a destination.
  if (page === 'features') {
    return <AccessibilityFeatures onBack={goHome} />;
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
      onFacilities={() => setPage('facilities')}

onSearch={() => setPage('search')}
      onGetDirections={() => setPage('route')}
      onReportBarrier={() => setPage('barrier')}
onFeatures={() => setPage('features')}

    />
  );
}
