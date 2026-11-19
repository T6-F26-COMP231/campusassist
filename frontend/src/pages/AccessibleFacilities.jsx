import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import FacilityMap from '../components/FacilityMap';
import { FACILITIES, FACILITY_TYPES, facilityBlocks, filterFacilities } from '../lib/facilities';
import './RequestHelp.css';
import './AccessibleFacilities.css';

const TYPE_LABELS = Object.fromEntries(FACILITY_TYPES.map((t) => [t.id, t.label]));
const BLOCKS = facilityBlocks();

export default function AccessibleFacilities({ onBack }) {
  const [selected, setSelected] = useState([]);
  const [block, setBlock] = useState('');

  const toggle = (id) =>
    setSelected((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  const clear = () => {
    setSelected([]);
    setBlock('');
  };

  const results = filterFacilities(FACILITIES, selected, block);
  const total = FACILITIES.length;
  const filtering = selected.length > 0 || block !== '';

  return (
    <div className="screen">
      <AppHeader subtitle="Accessible Facilities" onBack={onBack} />

      <main className="content">
        <h2 className="page-title">Find Accessible Facilities</h2>
        <p className="facilities__intro">
          Choose the facilities you need. Pick more than one to see all of them.
        </p>

        <fieldset className="filters">
          <legend>Filter by facility</legend>
          <div className="filters__chips">
            {FACILITY_TYPES.map(({ id, label }) => {
              const on = selected.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  className={`chip ${on ? 'chip--on' : ''}`}
                  aria-pressed={on}
                  onClick={() => toggle(id)}
                >
                  {on && <span aria-hidden="true">✓ </span>}
                  {label}
                </button>
              );
            })}
          </div>

          <label className="filters__block">
            <span>Where</span>
            <select value={block} onChange={(e) => setBlock(e.target.value)}>
              <option value="">All of campus</option>
              {BLOCKS.map(({ id, label }) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </label>

          {filtering && (
            <button type="button" className="filters__clear" onClick={clear}>
              Clear filters
            </button>
          )}
        </fieldset>

        <p className="facilities__count" role="status" aria-live="polite">
          {filtering
            ? `Showing ${results.length} of ${total} facilities`
            : `Showing all ${total} facilities`}
        </p>

        {results.length === 0 ? (
          <div className="facilities__empty">
            <p>No facilities match these filters.</p>
            <button type="button" className="filters__clear" onClick={clear}>
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="facility-list">
            {results.map((facility) => (
              <li key={facility.id}>
                <article className="facility">
                  <span className="facility__badge">{TYPE_LABELS[facility.type]}</span>
                  <h3>{facility.location}</h3>
                  <p>{facility.details}</p>
                </article>
              </li>
            ))}
          </ul>
        )}

        <FacilityMap facilities={results} />

        <p className="facilities__footnote">
          Locations come from the Progress Campus floor plan.
        </p>
      </main>
    </div>
  );
}
