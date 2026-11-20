
import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import FloorPlan from '../components/FloorPlan';
import { locateRoom } from '../lib/floorPlan.js';
import { directionSteps } from '../lib/directions.js';
import { PLACES } from '../lib/routeData.js';
import './RequestHelp.css';

export default function DirectionsToUser({ request, onBack }) {
  const [stepFree, setStepFree] = useState(false);
  const [campusRoute, setCampusRoute] = useState(null);

  // Recognize recorded campus places by name or ID
  const findRecordedPlace = (value) => {
    const search = String(value ?? '').trim().toLowerCase();

    return PLACES.find(
      (place) =>
        place.id.toLowerCase() === search ||
        place.name.toLowerCase() === search
    ) || null;
  };

  // Story 19 - Task #34: Retrieve the user's saved location
  const userLocation =
    request?.currentLocation || request?.location || '';

  const locationRoom = locateRoom(userLocation);
  const locationPlace = findRecordedPlace(userLocation);

  // The helper must find the user's CURRENT location.
  // The request description is only shown as the requested destination.
  const room = locationRoom;

  // Keep the requested destination separate from the user's current location.
  const requestedDestination =
    request?.description?.trim() || '';
  const destinationRoom = locateRoom(requestedDestination);
  const destinationPlace = findRecordedPlace(requestedDestination);

  // Task #35: Use the active request's current location.
  const handleFindDirections = () => {
    if (!userLocation) {
      setCampusRoute({
        ok: false,
        error: 'This request has no location to walk to.'
      });
      return;
    }

    const result = directionSteps(userLocation);

    setCampusRoute(result);
  };

  // Determine which room can be highlighted on the floor plan
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

        <div className="field">
          <p className="directions-note">
            User's Current Location: {userLocation.trim() || 'Location not provided'}
          </p>

          {requestedDestination && (
            <p className="directions-note">
              Requested Destination: {destinationRoom?.code ||
                destinationPlace?.name || requestedDestination}
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

        {/* Accessibility option from main */}
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

        {/* Display the user's room on the campus floor plan */}
        {displayRoom && (
          <>
            <h3>Destination on Floor Plan</h3>

            <p className="directions-note">
              Located on the Progress Campus floor plan:
              {' '}{displayRoom.code}
            </p>

            <FloorPlan location={displayRoom.code} />
          </>
        )}

        {/* Story 19 - Task #35: Internal campus directions */}
        <section className="field">
          <h3>Campus Walking Directions</h3>

          {!campusRoute ? (
            <p className="directions-note">
              Select Find Walking Directions.
            </p>
          ) : campusRoute.ok ? (
            <>
              <p className="directions-note" role="status">
                Directions to {room?.code || locationPlace?.name ||
                  userLocation}
              </p>

              <ol className="directions-steps">
                {campusRoute.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>

              <p className="directions-note">
                These are general directions based on the request.
                A physical walking route has not been automatically verified.
              </p>
            </>
          ) : (
            <p className="directions-note" role="status">
              {campusRoute.error}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
