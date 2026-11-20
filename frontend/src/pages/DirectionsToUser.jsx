
import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import FloorPlan from '../components/FloorPlan';
import { directionSteps } from '../lib/directions.js';
import { locateRoom } from '../lib/floorPlan.js';
import { getMazeMapDirections } from '../lib/mazeMap.js';
import { findWalkingRoute } from '../lib/routeFinder.js';
import './RequestHelp.css';

export default function DirectionsToUser({ request, onBack }) {
  // Story 19 - Task #35: Helper starting location
  const [helperLocation, setHelperLocation] = useState('');
  const [mazeMapUrl, setMazeMapUrl] = useState('');
  const [findingRoute, setFindingRoute] = useState(false);
  const [routeError, setRouteError] = useState('');

  // Accessibility option from main
  const [stepFree, setStepFree] = useState(false);

  // Validate the helper's starting room
  const helperRoom = locateRoom(helperLocation);

  const helperLocationEntered = helperLocation.trim() !== '';
  const helperLocationInvalid =
    helperLocationEntered && !helperRoom;

  // Story 19 - Task #34: Retrieve the user's location
  const userLocation =
    request?.currentLocation || request?.location || '';

  // Look for a room code in the user's saved location
  const locationRoom = locateRoom(userLocation);

  // A description may also contain a room code
  const description = request?.description || '';
  const descriptionRoom = locateRoom(description);

  const room = locationRoom || descriptionRoom;

  // Keep the existing room lookup and accessibility option
  const result = directionSteps(
    room?.code || userLocation,
    { stepFree }
  );

  // Generate a walking route using MazeMap
  const handleFindDirections = async () => {
    setRouteError('');
    setMazeMapUrl('');

    if (!helperRoom || !room) {
      setRouteError(
        'Please provide valid starting and destination rooms.'
      );
      return;
    }

    setFindingRoute(true);

    try {
      const url = await getMazeMapDirections(
        helperRoom.code,
        room.code
      );

      setMazeMapUrl(url);
    } catch (error) {
      setRouteError(
        error.message || 'Unable to find walking directions.'
      );
    } finally {
      setFindingRoute(false);
    }
  };

  // Task #35: Generate directions using the actual locations
  const startLocation = helperRoom?.code || helperLocation.trim();
  const destinationLocation = room?.code || userLocation.trim();

  const campusRoute = findWalkingRoute(
    startLocation,
    destinationLocation,
    { avoidStairs: stepFree }
  );

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
            Your Current Room (Helper)
          </label>

          <input
            id="helperLocation"
            type="text"
            value={helperLocation}
            placeholder="e.g. B1-04"
            onChange={(e) => {
              setHelperLocation(e.target.value);
              setMazeMapUrl('');
              setRouteError('');
            }}
          />

          {helperLocationInvalid && (
            <p
              className="notice notice--error"
              role="alert"
            >
              This room is not on the Progress Campus floor plan.
            </p>
          )}

          {helperRoom && (
            <p role="status">
              Starting room confirmed: {helperRoom.code}
            </p>
          )}

          <button
            type="button"
            className="btn btn--primary"
            onClick={handleFindDirections}
            disabled={!helperRoom || !room || findingRoute}
          >
            {findingRoute
              ? 'Finding Directions...'
              : 'Find Walking Directions'}
          </button>

          {routeError && (
            <p
              className="notice notice--error"
              role="alert"
            >
              {routeError}
            </p>
          )}

          {mazeMapUrl && (
            <a
              className="btn btn--secondary"
              href={mazeMapUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Walking Route in MazeMap
            </a>
          )}
        </div>

        {/* Accessibility option added by the team */}
        <label className="directions-option">
          <input
            type="checkbox"
            checked={stepFree}
            onChange={(event) =>
              setStepFree(event.target.checked)
            }
          />
          Avoid stairs
        </label>

        {stepFree && (
          <p className="directions-note">
            Step-free directions are currently available
            only for recorded routes.
          </p>
        )}

        {result.ok ? (
          <>
            <p className="directions-note">
              These directions end at {result.location}.
            </p>

            <FloorPlan location={result.location} />

            <section className="field">
              <h3>Campus Walking Directions</h3>

              {campusRoute.ok ? (
                <>
                  <p className="directions-note">
                    Route from {startLocation} to {destinationLocation}
                  </p>

                  <ol className="directions-steps">
                    {campusRoute.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </>
              ) : (
                <p role="status">
                  {campusRoute.error}
                </p>
              )}
            </section>

            <ol className="directions-steps">
              {result.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </>
        ) : (
          <p role="alert">{result.error}</p>
        )}
      </main>
    </div>
  );
}
