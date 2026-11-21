import { useEffect, useState } from 'react';
import AppHeader from '../components/AppHeader';
import FloorPlan from '../components/FloorPlan';
import { locateRoom } from '../lib/floorPlan.js';
import { directionSteps } from '../lib/directions.js';
import { PLACES } from '../lib/routeData.js';
import './RequestHelp.css';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export default function DirectionsToUser({ request, onBack }) {
  const [stepFree, setStepFree] = useState(false);
  const [campusRoute, setCampusRoute] = useState(null);
  const [savedRequest, setSavedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const requestId = request?.id || request?._id;

  // Story 19 - Task #37: Load the user's saved location from the backend.
  useEffect(() => {
    const controller = new AbortController();

    async function loadRequest() {
      setLoading(true);
      setError('');
      setSavedRequest(null);
      setCampusRoute(null);

      if (!requestId) {
        setError('No request selected.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE}/api/help-requests/${encodeURIComponent(requestId)}/status`,
          { signal: controller.signal }
        );

       const data = await response.json().catch(() => {
  throw new Error('Unable to load the user’s location. Please try again later.');
});

        if (!response.ok || !data.success || !data.request) {
          throw new Error(
            data.message || 'Unable to load the user’s location.'
          );
        }

        if (!controller.signal.aborted) {
          setSavedRequest(data.request);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err.message || 'Unable to load the user’s location.'
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadRequest();

    return () => controller.abort();
  }, [requestId]);

  // Recognize recorded campus places by name or ID.
  const findRecordedPlace = (value) => {
    const search = String(value ?? '').trim().toLowerCase();

    return PLACES.find(
      (place) =>
        place.id.toLowerCase() === search ||
        place.name.toLowerCase() === search
    ) || null;
  };

  // Use the current location retrieved from the saved request.
  const userLocation =
    savedRequest?.currentLocation?.trim() || '';

  const locationRoom = locateRoom(userLocation);
  const locationPlace = findRecordedPlace(userLocation);
  const room = locationRoom;

  // Keep the requested destination separate from the current location.
  const requestedDestination =
    savedRequest?.description?.trim() || '';

  const destinationRoom = locateRoom(requestedDestination);
  const destinationPlace = findRecordedPlace(requestedDestination);

  // Task #35: Generate directions to the user's current location.
  const handleFindDirections = () => {
    if (!userLocation) {
      setCampusRoute({
        ok: false,
        error: 'This request has no location to walk to.'
      });
      return;
    }

    const result = directionSteps(userLocation, { stepFree });
    setCampusRoute(result);
  };

  const displayRoom = room || locationRoom;

  return (
    <div className="screen">
      <AppHeader
        subtitle="Directions to user"
        onBack={onBack}
      />

      <main className="content">
        <h2 className="page-title">
          Directions to the user
        </h2>

        {loading && (
          <p role="status">
            Loading the user's location...
          </p>
        )}

        {!loading && error && (
          <p role="alert">{error}</p>
        )}

        {!loading && !error && savedRequest && !userLocation && (
          <p role="alert">
            This request has no location to walk to.
          </p>
        )}

        {!loading && !error && savedRequest && (
          <>
            <div className="field">
              <p className="directions-note">
                User's Current Location:{' '}
                {userLocation || 'Location not provided'}
              </p>

              {requestedDestination && (
                <p className="directions-note">
                  Requested Destination:{' '}
                  {destinationRoom?.code ||
                    destinationPlace?.name ||
                    requestedDestination}
                </p>
              )}

              <button
                type="button"
                className="btn btn--primary"
                onClick={handleFindDirections}
                disabled={!userLocation}
              >
                Find Walking Directions
              </button>
            </div>

            <label className="directions-option">
              <input
                type="checkbox"
                checked={stepFree}
                onChange={(event) => {
                  setStepFree(event.target.checked);
                  setCampusRoute(null);
                }}
              />
              Avoid stairs
            </label>

            {stepFree && (
              <p className="directions-note">
                Routes containing recorded stair connections
                will be excluded. Other accessibility conditions
                have not yet been verified.
              </p>
            )}

            {displayRoom && (
              <>
                <h3>Destination on Floor Plan</h3>

                <p className="directions-note">
                  Located on the Progress Campus floor plan:{' '}
                  {displayRoom.code}
                </p>

                <FloorPlan location={displayRoom.code} />
              </>
            )}

            <section className="field">
              <h3>Campus Walking Directions</h3>

              {!campusRoute ? (
                <p className="directions-note">
                  Select Find Walking Directions.
                </p>
              ) : campusRoute.ok ? (
                <>
                  <p className="directions-note" role="status">
                    Directions to{' '}
                    {room?.code ||
                      locationPlace?.name ||
                      userLocation}
                  </p>

                  <ol className="directions-steps">
                    {campusRoute.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>

                  <p className="directions-note">
                    These are general directions based on the request.
                    A physical walking route has not been automatically
                    verified.
                  </p>
                </>
              ) : (
                <p className="directions-note" role="status">
                  {campusRoute.error}
                </p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}