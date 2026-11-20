import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import RouteMap from '../components/RouteMap';
import { routeDirections, routeGroups } from '../lib/routes';
import './RequestHelp.css';
import './StepByStepDirections.css';

const GROUPS = routeGroups();

export default function StepByStepDirections({ onBack }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [avoidStairs, setAvoidStairs] = useState(false);
  const [result, setResult] = useState(null);

  const submit = (event) => {
    event.preventDefault();
    setResult(routeDirections(from, to, { avoidStairs }));
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
          <label className="route__check">
            <input
              type="checkbox"
              checked={avoidStairs}
              onChange={(event) => {
                setAvoidStairs(event.target.checked);
                setResult(null);
              }}
            />
            Avoid stairs (use elevators)
          </label>
          <button className="btn btn--primary" type="submit">Show directions</button>
        </form>

        <div role="status" aria-live="polite">
          {result?.ok && (
            <section aria-labelledby="route-title">
              <h3 id="route-title" className="route__title">
                {result.from} to {result.to}
              </h3>
              <p className="route__note">
                About {result.totalMetres} m, about {result.minutes} {result.minutes === 1 ? 'minute' : 'minutes'} on
                foot. This is the shortest route over the campus map.
              </p>
              <ol className="route__steps">
                {result.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </section>
          )}
          {result && !result.ok && <p className="route__error">{result.error}</p>}
        </div>

        {result?.ok && (
          <RouteMap
            key={`${from}-${to}-${avoidStairs}`}
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
