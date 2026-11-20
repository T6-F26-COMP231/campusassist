import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import { routeDirections, routePlaces } from '../lib/routes';
import './RequestHelp.css';
import './StepByStepDirections.css';

const PLACES = routePlaces();

export default function StepByStepDirections({ onBack }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [result, setResult] = useState(null);

  const submit = (event) => {
    event.preventDefault();
    setResult(routeDirections(from, to));
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
        {PLACES.map(({ id, name }) => (
          <option key={id} value={id}>{name}</option>
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
          <button className="btn btn--primary" type="submit">Show directions</button>
        </form>

        <div role="status" aria-live="polite">
          {result?.ok && (
            <section aria-labelledby="route-title">
              <h3 id="route-title" className="route__title">
                {result.from} to {result.to}
              </h3>
              <ol className="route__steps">
                {result.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </section>
          )}
          {result && !result.ok && <p className="route__error">{result.error}</p>}
        </div>
      </main>
    </div>
  );
}
