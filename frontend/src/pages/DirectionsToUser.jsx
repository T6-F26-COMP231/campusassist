import AppHeader from '../components/AppHeader';
import { directionSteps } from '../lib/directions.js';
import './RequestHelp.css';

export default function DirectionsToUser({ request, onBack }) {
  const result = directionSteps(request?.location);

  return (
    <div className="screen">
      <AppHeader subtitle="Directions to user" onBack={onBack} />
      <main className="content">
        <h2 className="page-title">Directions to the user</h2>

        {result.ok ? (
          <>
            <p className="directions-note">
              These directions end at {result.location}.
            </p>
            <ol className="directions-steps">
              {result.steps.map((step) => (
                <li key={step}>{step}</li>
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
