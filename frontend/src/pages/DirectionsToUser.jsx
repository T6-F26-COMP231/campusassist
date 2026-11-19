
import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import FloorPlan from '../components/FloorPlan';
import { directionSteps } from '../lib/directions.js';
import { locateRoom } from '../lib/floorPlan.js';
import { getMazeMapDirections } from '../lib/mazeMap.js';
import './RequestHelp.css';

export default function DirectionsToUser({ request, onBack }) {
  // Task #35: Helper enters their current room
  const [helperLocation, setHelperLocation] = useState('');
  const [mazeMapUrl, setMazeMapUrl] = useState('');
  const [findingRoute, setFindingRoute] = useState(false);
  const [routeError, setRouteError] = useState('');

  // Task #35: Validate the helper's starting room
  const helperRoom = locateRoom(helperLocation);

  const helperLocationEntered = helperLocation.trim() !== '';
  const helperLocationInvalid =
    helperLocationEntered && !helperRoom;

  // Task #34: Retrieve the user's saved location
  const userLocation = request?.currentLocation || request?.location || '';

  // Find a room code in the saved location
  const locationRoom = locateRoom(userLocation);

  // Use the description only if the location does not contain a room code
  const description = request?.description || '';
  const descriptionRoom = locateRoom(description);

  // Room codes in descriptions must be confirmed as the user's location
  const room = locationRoom || descriptionRoom;

  const handleFindDirections = async () => {
    setRouteError('');
    setMazeMapUrl('');

    if (!helperRoom || !room) {
      setRouteError('Please provide valid starting and destination rooms.');
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
      setRouteError(error.message);
    } finally {
      setFindingRoute(false);
    }
  };

  // Task #35: Use the existing campus navigation lookup
  const result = directionSteps(room?.code || userLocation);

  return (
    <div className="screen">
      <AppHeader subtitle="Directions to user" onBack={onBack} />

      <main className="content">
        <h2 className="page-title">Directions to the user</h2>
        <div className="field">
          <label htmlFor="helperLocation">
            Your Current Room (Helper)
          </label>

          <input
            id="helperLocation"
            type="text"
            value={helperLocation}
            placeholder="e.g. B1-04"
            onChange={(e) => setHelperLocation(e.target.value)}
          />

          {helperLocationInvalid && (
            <p className="notice notice--error" role="alert">
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
            {findingRoute ? 'Finding Directions...' : 'Find Walking Directions'}
          </button>

          {routeError && (
            <p className="notice notice--error" role="alert">
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

        {result.ok ? (
          <>
            <p className="directions-note">
              These directions end at {result.location}.
            </p>

            <FloorPlan location={result.location} />

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
