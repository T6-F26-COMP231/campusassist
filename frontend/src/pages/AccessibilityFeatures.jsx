import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import { getAccessibilityReport, listPlaces } from '../lib/accessibility';
import './RequestHelp.css';
import './AccessibilityFeatures.css';

const PLACES = listPlaces();

export default function AccessibilityFeatures({ onBack }) {
  const [placeId, setPlaceId] = useState('');
  const report = placeId ? getAccessibilityReport(placeId) : null;

  return (
    <div className="screen">
      <AppHeader subtitle="Accessibility Features" onBack={onBack} />

      <main className="content">
        <h2 className="page-title">Check a Destination</h2>
        <p className="a11y__intro">
          Choose where you are going to see its accessibility features before you set off.
        </p>

        <label className="a11y__field">
          <span>Destination</span>
          <select value={placeId} onChange={(e) => setPlaceId(e.target.value)}>
            <option value="">Choose a destination</option>
            {PLACES.map(({ id, name }) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </label>

        <div role="status" aria-live="polite">
          {!report && (
            <p className="a11y__empty">Pick a destination to see what it offers.</p>
          )}

          {report && (
            <section className="a11y__report" aria-labelledby="a11y-name">
              <h3 id="a11y-name">{report.name}</h3>
              <p className="a11y__summary">
                {report.availableCount} of {report.total} accessibility features available
              </p>

              <ul className="a11y__list">
                {report.items.map((item) => (
                  <li
                    key={item.id}
                    className={`a11y__item ${item.available ? 'a11y__item--yes' : 'a11y__item--no'}`}
                  >
                    <span className="a11y__mark" aria-hidden="true">{item.available ? '✓' : '✕'}</span>
                    <div>
                      <strong>{item.label}</strong>
                      <span className="a11y__state">{item.available ? 'Available' : 'Not available'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
