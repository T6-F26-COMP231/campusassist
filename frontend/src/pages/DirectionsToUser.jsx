
import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import FloorPlan from '../components/FloorPlan';
import { locateRoom } from '../lib/floorPlan.js';
import { findWalkingRoute } from '../lib/routeFinder.js';
import { PLACES } from '../lib/routeData.js';
import './RequestHelp.css';

export default function DirectionsToUser({ request, onBack }) {
  // Story 19 - Task #35: Helper starting location
  const [helperLocation, setHelperLocation] = useState('');
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

  // Validate the helper's location
  const helperRoom = locateRoom(helperLocation);
  const helperPlace = findRecordedPlace(helperLocation);

  const helperLocationEntered = helperLocation.trim() !== '';
  const helperLocationValid = Boolean(helperRoom || helperPlace);

  // Story 19 - Task #34: Retrieve the user's saved location
  const userLocation = String(
    request?.currentLocation ?? request?.location ?? ''
  ).trim();

  const locationRoom = locateRoom(userLocation);
  const locationPlace = findRecordedPlace(userLocation);

  // Story 19 - Task #34:
  // The helper must find the user's CURRENT location.
  // The request description is not the user's location.
  const room = locationRoom;

  // Keep the requested destination separate from the user's current location.
  const requestedDestination =
    request?.description?.trim() || '';
  const destinationRoom = locateRoom(requestedDestination);
  const destinationPlace = findRecordedPlace(requestedDestination);

  // Use recorded location names when available
  const startLocation =
    helperRoom?.code || helperPlace?.id || '';

  const destinationLocation =
    room?.code || locationPlace?.id || '';

  const destinationValid = Boolean(
    room || locationPlace
  );

  // Task #35: Calculate walking directions inside CampusAssist
  const handleFindDirections = () => {
    if (!helperLocationValid || !destinationValid) {
      setCampusRoute({
        ok: false,
        error: 'Please provide valid starting and destination locations.'
      });
      return;
    }

    const result = findWalkingRoute(
      startLocation,
      destinationLocation,
      { avoidStairs: stepFree }
    );

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
          <label htmlFor="helperLocation">
            Your Current Location (Helper)
          </label>

          <input
            id="helperLocation"
            type="text"
            value={helperLocation}
            placeholder="e.g. B1-04 or Bookstore"
            onChange={(event) => {
              setHelperLocation(event.target.value);
              setCampusRoute(null);
            }}
          />

          {helperLocationEntered && !helperLocationValid && (
            <p
              className="notice notice--error"
              role="alert"
            >
              This location is not recognized in the campus data.
            </p>
          )}

          {helperRoom && (
            <p role="status">
              Starting room confirmed: {helperRoom.code}
            </p>
          )}

          {helperPlace && (
            <p role="status">
              Starting location: {helperPlace.name}
            </p>
          )}

          <p className="directions-note">
            User's Current Location: {room?.code || locationPlace?.name ||
              'Location not recognized'}
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
            disabled={!helperLocationValid || !destinationValid}
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
              Enter your current location and select
              Find Walking Directions.
            </p>
          ) : campusRoute.ok ? (
            <>
              <p className="directions-note" role="status">
                Recorded route from {helperRoom?.code ||
                  helperPlace?.name} to {room?.code ||
                  locationPlace?.name}
              </p>

              <ol className="directions-steps">
                {campusRoute.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>

              <p className="directions-note">
                Route based on recorded campus connections.
                Physical access and current conditions
                still require verification.
              </p>
            </>
          ) : (
            <p className="directions-note" role="status">
              {helperRoom && room
                ? 'Both rooms are shown on the Progress Campus floor plan, but a verified walking route between them is not available yet.'
                : campusRoute.error}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
