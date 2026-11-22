import { useEffect, useState } from 'react';
import AppHeader from '../components/AppHeader';
import RouteMap from '../components/RouteMap';
import { approvedBarrierLocations, BARRIERS_UNAVAILABLE_MESSAGE } from '../lib/approvedBarriers';
import { distanceAndTime, extraDistance, placeOption, stairsChip } from '../lib/routeSummary';
import { blockedPlaceIds, routeDirections, routeGroups } from '../lib/routes';
import './RequestHelp.css';
import './StepByStepDirections.css';

const GROUPS = routeGroups();
const STORAGE_KEY = 'campusassist.stepFree';

// The step-free choice is remembered on this device. Storage can be blocked, so it is optional.
function savedChoice() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function saveChoice(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // Not remembered; the screen still works.
  }
}

export default function StepByStepDirections({ onBack }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [stepFree, setStepFree] = useState(savedChoice);
  const [result, setResult] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const refreshRoute = () => {
    setRefreshCount((count) => count + 1);
  };

  // The directions appear as soon as both places are chosen, and follow every change.
  useEffect(() => {
    if (!from || !to) {
      setResult(null);
      return undefined;
    }
    setResult(null);
    let current = true;
    approvedBarrierLocations()
      .then((locations) => routeDirections(from, to, { avoidStairs: stepFree, blocked: blockedPlaceIds(locations) }))
      .catch(() => ({ ok: false, error: BARRIERS_UNAVAILABLE_MESSAGE }))
      .then((next) => {
        if (current) setResult(next);
      });
    return () => {
      current = false;
    };
  }, [from, to, stepFree, refreshCount]);

  const choose = (value) => {
    setStepFree(value);
    saveChoice(value);
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const picker = (id, label, value, setValue) => (
    <div className="route__pick">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(event) => setValue(event.target.value)}>
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
  );

  const chip = result?.ok ? stairsChip(result) : '';
  const extra = result?.ok ? extraDistance(result) : '';

  return (
    <div className="screen">
      <AppHeader subtitle="Directions" onBack={onBack} />

      <main className="content route">
        <h2 className="page-title">Get Directions</h2>

        <div className="route__places">
          {picker('route-from', 'From', from, setFrom)}
          <button
            type="button"
            className="route__swap"
            onClick={swap}
            disabled={!from && !to}
            aria-label="Swap From and To"
          >
            <span aria-hidden="true">&#8644;</span>
          </button>
          {picker('route-to', 'To', to, setTo)}
        </div>

        <div className={`stepfree ${stepFree ? 'stepfree--on' : ''}`}>
          <button
            type="button"
            role="switch"
            aria-checked={stepFree}
            aria-labelledby="stepfree-label"
            aria-describedby="stepfree-help"
            className="stepfree__switch"
            onClick={() => choose(!stepFree)}
          >
            <span className="stepfree__knob" aria-hidden="true" />
          </button>
          <strong id="stepfree-label" className="stepfree__name">Step-free</strong>
          <span id="stepfree-help" className="stepfree__help">
            {stepFree ? 'Avoids stairs' : 'Stairs allowed'}
          </span>
        </div>

        {!from || !to ? (
          <p className="route__intro">Choose where you are and where you are going.</p>
        ) : null}

        {from && to && (
          <button
            type="button"
            className="btn btn--secondary"
            onClick={refreshRoute}
          >
            Refresh route
          </button>
        )}

        <div role="status" aria-live="polite">
          {result?.ok && (
            <section aria-labelledby="route-title">
              <h3 id="route-title" className="route__title route__title--hidden">
                {result.from} to {result.to}
              </h3>
              <div className="route__summary">
                {chip && (
                  <span className={`route__chip ${result.stepFree ? '' : 'route__chip--stairs'}`}>
                    {result.stepFree && <span aria-hidden="true">&#10003; </span>}
                    {chip}
                  </span>
                )}
                <strong>{distanceAndTime(result)}</strong>
              </div>
              {extra && <p className="route__note">{extra}</p>}
              {result.usesStairs && (
                <div className="route__notice">
                  <p>This route uses stairs.</p>
                  <button type="button" className="route__link" onClick={() => choose(true)}>
                    Show step-free route
                  </button>
                </div>
              )}
            </section>
          )}

          {result && !result.ok && (
            <div className="route__error">
              <p>{result.error}</p>
              {result.stairsRouteExists && (
                <>
                  <p>A route with stairs does exist.</p>
                  <button type="button" className="route__link" onClick={() => choose(false)}>
                    Show route with stairs
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {result?.ok && (
          <>
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
                  key={`${from}-${to}-${stepFree}`}
                  legs={result.legs}
                  building={result.fromBuilding}
                  fromName={result.from}
                  toName={result.to}
                />
              </div>
            )}

            <ol className="route__steps" aria-label="Directions">
              {result.steps.map((step, index) => (
                <li key={index} className={/stairs/i.test(step) ? 'route__step--stairs' : ''}>{step}</li>
              ))}
            </ol>
          </>
        )}
      </main>
    </div>
  );
}
