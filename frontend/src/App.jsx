
import { useCallback, useState } from 'react';
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
import AdminHome from './pages/AdminHome';
import ReviewReports from './pages/ReviewReports';
import {
  approveReport,
  rejectReport,
  resolveBarrierReport
} from './lib/barrierReports';
import { mergePendingReports } from './lib/pendingReports';
import { approveBarrierReport, rejectBarrierReport } from './lib/reviewDecisions';
import './pages/RequestHelp.css';

function Home({
  onRequestHelp,
  onOpenRequests,
  onRequestStatus,
  onFacilities,
  onSearch,
  onGetDirections,
  onFeatures,
  onReportBarrier,
  onAdmin
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

        <button
          className="btn btn--secondary"
          onClick={onAdmin}
        >
          Administrator
        </button>
      </main>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState('home');
  const [selected, setSelected] = useState(null);

  // Story 12 and 24: Store reports displayed during this visit.
  const [barrierReports, setBarrierReports] = useState([]);

  // Story 24: Merge pending reports retrieved from the backend.
  const addLoadedReports = useCallback(
    (loaded) =>
      setBarrierReports((list) =>
        mergePendingReports(list, loaded)
      ),
    []
  );

  // Story 11: Messages the Campus User wrote to their helper, kept per request for this visit.
  const [messagesByRequest, setMessagesByRequest] = useState({});

  // Story 10: Remember the submitted help request.
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

  // Story 19: Directions to the selected user.
  if (page === 'directions' && selected) {
    return (
      <DirectionsToUser
        request={selected}
        onBack={() => setPage('accept')}
      />
    );
  }

  // Story 18: Accept a help request.
  if (page === 'accept' && selected) {
    return (
      <AcceptRequest
        request={selected}
        onBack={() => setPage('open')}
        onDirections={() => setPage('directions')}
      />
    );
  }

  // Story 3: Accessible facilities.
  if (page === 'facilities') {
    return <AccessibleFacilities onBack={goHome} />;
  }

  // Story 24: Administrator home.
  if (page === 'admin') {
    return (
      <AdminHome
        onBack={goHome}
        reports={barrierReports}
        onReviewReports={() => setPage('reports')}
      />
    );
  }

  // Story 24, 25, 26 and 27: Review barrier reports.
  if (page === 'reports') {
    return (
      <ReviewReports
        onBack={() => setPage('admin')}
        reports={barrierReports}
        onLoaded={addLoadedReports}
        onApprove={async (reportId) => {
          const result = approveReport(barrierReports, reportId);
          if (!result.ok) return result;

          // Issue #82: change the list only after the backend has saved the approval.
          const saved = await approveBarrierReport(reportId);
          if (!saved.ok) return saved;

          setBarrierReports((list) => approveReport(list, reportId).reports ?? list);
          return result;
        }}
        onReject={async (reportId) => {
          const result = rejectReport(barrierReports, reportId);
          if (!result.ok) return result;

          // Issue #82: change the list only after the backend has saved the rejection.
          const saved = await rejectBarrierReport(reportId);
          if (!saved.ok) return saved;

          setBarrierReports((list) => rejectReport(list, reportId).reports ?? list);
          return result;
        }}
        onResolve={async (reportId) => {
          // Story 27: Save resolution through the backend.
          const result = await resolveBarrierReport(reportId);

          if (result.ok) {
            setBarrierReports((list) =>
              list.map((report) =>
                report.id === reportId
                  ? {
                    ...report,
                    status: result.report?.status || 'Resolved'
                  }
                  : report
              )
            );
          }

          return result;
        }}
      />
    );
  }

  // Story 12 and 38: Submit barrier reports.
  if (page === 'barrier') {
    return (
      <ReportBarrier
        onBack={goHome}
        reportCount={barrierReports.length}
        onReported={(report) =>
          setBarrierReports((list) => [...list, report])
        }
      />
    );
  }

  // Story 6 and 7: Campus directions.
  if (page === 'route') {
    return <StepByStepDirections onBack={goHome} />;
  }

  // Story 2: Search for campus locations.
  if (page === 'search') {
    return <SearchLocation onBack={goHome} />;
  }

  // Story 4: Destination accessibility information.
  if (page === 'features') {
    return <AccessibilityFeatures onBack={goHome} />;
  }

  // Story 17: Open help requests.
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

  // Story 10: Help request status.
  if (page === 'status') {
    return (
      <RequestStatus
        onBack={goHome}
        requestId={submittedRequestId}
        messages={messagesByRequest[submittedRequestId] ?? []}
        onSendMessages={(thread) =>
          setMessagesByRequest((all) => ({ ...all, [submittedRequestId]: thread }))
        }
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
      onAdmin={() => setPage('admin')}
      onFeatures={() => setPage('features')}
    />
  );
}
