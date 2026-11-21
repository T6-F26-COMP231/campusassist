import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import RouteMap from '../components/RouteMap';
import { approvedBarrierLocations, BARRIERS_UNAVAILABLE_MESSAGE } from '../lib/approvedBarriers';
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

  const show = async (avoidStairs) => {
    try {
      const locations = await approvedBarrierLocations();
      setResult(routeDirections(from, to, { avoidStairs, blocked: blockedPlaceIds(locations) }));
    } catch {
      setResult({
        ok: false,
        error: BARRIERS_UNAVAILABLE_MESSAGE,
      });
    }
  };

  const choose = (value) => {
    setStepFree(value);
    saveChoice(value);
    if (result) show(value); // keep the screen up to date with the choice
  };

  const submit = (event) => {
    event.preventDefault();
    show(stepFree);
  };

  const picker = (label, value, setValue) => (
    <label className="route__field">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setResult(null);
        }}
      >
        <option value="">Choose a place</option>
        {GROUPS.map((group) => (
          <optgroup key={group.id} label={group.label}>
            {group.places.map(({ id, name, floor }) => (
              <option key={id} value={id}>{`${name} (Floor ${floor})`}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );

  return (
    <div className="screen">
      <AppHeader subtitle="Directions" onBack={onBack} />

      <main className="content">
        <h2 className="page-title">Get Directions</h2>
        <p className="route__intro">Choose where you are and where you are going.</p>

        <form className="route__form" onSubmit={submit}>
          {picker('I am at', from, setFrom)}
          {picker('I am going to', to, setTo)}

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
            <div>
              <strong id="stepfree-label">Step-free route</strong>
              <span className="stepfree__state">{stepFree ? 'On' : 'Off'}</span>
              <p id="stepfree-help">Avoids stairs. Uses level corridors and elevators only.</p>
            </div>
          </div>

          <button className="btn btn--primary" type="submit" disabled={!from || !to}>
            {stepFree ? 'Show step-free route' : 'Show directions'}
          </button>
        </form>

        <div role="status" aria-live="polite">
          {result?.ok && (
            <section aria-labelledby="route-title">
              {result.stepFree && (
                <p className="route__badge">
                  <span aria-hidden="true">✓</span> Step-free route: no stairs
                </p>
              )}
              <h3 id="route-title" className="route__title">
                {result.from} to {result.to}
              </h3>
              <p className="route__note">
                About {result.totalMetres} m, about {result.minutes} {result.minutes === 1 ? 'minute' : 'minutes'} on
                foot.
                {result.stepFree && result.extraMetres > 0 &&
                  ` About ${result.extraMetres} m longer than the shortest route, which uses stairs.`}
              </p>
              {result.usesStairs && (
                <div className="route__notice">
                  <p>This route uses stairs.</p>
                  <button type="button" className="route__link" onClick={() => choose(true)}>
                    Show step-free route
                  </button>
                </div>
              )}
              <ol className="route__steps">
                {result.steps.map((step, index) => (
                  <li key={index} className={/stairs/i.test(step) ? 'route__step--stairs' : ''}>{step}</li>
                ))}
              </ol>
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
          <RouteMap
            key={`${from}-${to}-${stepFree}`}
            legs={result.legs}
            building={result.fromBuilding}
            fromName={result.from}
            toName={result.to}
          />
        )}
      </main>
    </div>
  );
}
