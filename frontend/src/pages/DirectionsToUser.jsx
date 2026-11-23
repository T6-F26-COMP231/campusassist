import { useEffect, useState } from 'react';
import AppHeader from '../components/AppHeader';
import FloorPlan from '../components/FloorPlan';
import RouteMap from '../components/RouteMap';
import UserMessages from '../components/UserMessages';
import { locateRoom } from '../lib/floorPlan.js';
import { directionSteps, locationNotOnMapMessage } from '../lib/directions.js';
import { approvedBarrierLocations, BARRIERS_UNAVAILABLE_MESSAGE } from '../lib/approvedBarriers';
import { distanceAndTime, extraDistance, placeOption, stairsChip } from '../lib/routeSummary';
import { blockedPlaceIds, placeIdForLocation, routeGroups } from '../lib/routes';
import { PLACES } from '../lib/routeData.js';
import './RequestHelp.css';
import './StepByStepDirections.css';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const GROUPS = routeGroups();

export default function DirectionsToUser({ request, onBack }) {
  const [stepFree, setStepFree] = useState(false);
  const [campusRoute, setCampusRoute] = useState(null);
  const [from, setFrom] = useState('');
  const [showMap, setShowMap] = useState(false);
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

  // Issue #38: the walk is made by the same route generator as Get Directions, so it needs the
  // helper's start place and the approved barriers. A location or start that is not on the map,
  // or no start at all, is answered by directionSteps without loading barriers.
  const findDirections = async (avoidStairs = stepFree) => {
    if (!userLocation) {
      setCampusRoute({
        ok: false,
        error: 'This request has no location to walk to.'
      });
      return;
    }

    setShowMap(false);

    const canRoute =
      placeIdForLocation(userLocation) && from && placeIdForLocation(from);

    if (!canRoute) {
      setCampusRoute(directionSteps(userLocation, { from, stepFree: avoidStairs }));
      return;
    }

    try {
      const blocked = blockedPlaceIds(await approvedBarrierLocations());
      setCampusRoute(directionSteps(userLocation, { from, stepFree: avoidStairs, blocked }));
    } catch {
      setCampusRoute({ ok: false, error: BARRIERS_UNAVAILABLE_MESSAGE });
    }
  };

  const handleFindDirections = () => findDirections();

  const choose = (value) => {
    setStepFree(value);
    findDirections(value);
  };

  const displayRoom = room || locationRoom;

  // The walk and its summary, shown the way Get Directions shows them.
  const chip = campusRoute?.ok ? stairsChip(campusRoute) : '';
  const extra = campusRoute?.ok ? extraDistance(campusRoute) : '';
  const locationNotOnMap = Boolean(userLocation) && !placeIdForLocation(userLocation);

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

              <div className="route__pick">
                <label htmlFor="helper-start">Where are you?</label>
                <select
                  id="helper-start"
                  value={from}
                  onChange={(event) => {
                    setFrom(event.target.value);
                    setCampusRoute(null);
                    setShowMap(false);
                  }}
                >
                  <option value="">Choose a place</option>
                  {GROUPS.map((group) => (
                    <optgroup key={group.id} label={group.label}>
                      {group.places.map((place) => (
                        <option key={place.id} value={place.id}>{placeOption(place)}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

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
                locationNotOnMap ? (
                  <div className="route__error" role="status">
                    <p>{locationNotOnMapMessage(userLocation)}</p>
                  </div>
                ) : (
                  <p className="directions-note">
                    Select Find Walking Directions.
                  </p>
                )
              ) : campusRoute.ok ? (
                <>
                  <div role="status" aria-live="polite">
                    <section aria-labelledby="route-title">
                      <h3 id="route-title" className="route__title route__title--hidden">
                        {campusRoute.from} to {campusRoute.to}
                      </h3>
                      <div className="route__summary">
                        {chip && (
                          <span className={`route__chip ${campusRoute.stepFree ? '' : 'route__chip--stairs'}`}>
                            {campusRoute.stepFree && <span aria-hidden="true">&#10003; </span>}
                            {chip}
                          </span>
                        )}
                        <strong>{distanceAndTime(campusRoute)}</strong>
                      </div>
                      {extra && <p className="route__note">{extra}</p>}
                      {campusRoute.usesStairs && (
                        <div className="route__notice">
                          <p>This route uses stairs.</p>
                          <button type="button" className="route__link" onClick={() => choose(true)}>
                            Show step-free route
                          </button>
                        </div>
                      )}
                    </section>
                  </div>

                  <button
                    type="button"
                    className="btn btn--secondary route__mapbtn"
                    aria-expanded={showMap}
                    aria-controls="route-map"
                    onClick={() => setShowMap((open) => !open)}
                  >
                    <span aria-hidden="true">{showMap ? '▲' : '▼'} </span>
                    {showMap ? 'Hide map' : 'Show map'}
                  </button>

                  {showMap && (
                    <div id="route-map">
                      <RouteMap
                        key={`${from}-${userLocation}-${stepFree}`}
                        legs={campusRoute.legs}
                        building={campusRoute.fromBuilding}
                        fromName={campusRoute.from}
                        toName={campusRoute.to}
                      />
                    </div>
                  )}

                  <ol className="route__steps" aria-label="Directions">
                    {campusRoute.steps.map((step, index) => (
                      <li key={index} className={/stairs/i.test(step) ? 'route__step--stairs' : ''}>{step}</li>
                    ))}
                  </ol>
                </>
              ) : (
                <div className="route__error" role="status">
                  <p>{campusRoute.error}</p>
                  {campusRoute.stairsRouteExists && (
                    <>
                      <p>A route with stairs does exist.</p>
                      <button type="button" className="route__link" onClick={() => choose(false)}>
                        Show route with stairs
                      </button>
                    </>
                  )}
                </div>
              )}
            </section>

            <UserMessages requestId={requestId} />
          </>
        )}
      </main>
    </div>
  );
}