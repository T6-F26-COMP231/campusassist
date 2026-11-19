import { useEffect, useMemo, useRef, useState } from 'react';
import { PLAN_IMAGES } from '../assets/floorplans';
import { FLOOR_PLAN_TITLES } from '../lib/floorPlan';
import './FloorPlan.css';
import './FacilityMap.css';

const PAGES = [1, 2, 3, 4, 5];
const TAB_LABELS = { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5+' };
const MARKER_LETTER = { elevator: 'E', 'accessible-washroom': 'W' };

// Floor plan with a marker for every facility in `facilities` (the filtered list).
// The plan is one floor at a time, so floor tabs show how many facilities each has.
export default function FacilityMap({ facilities }) {
  const [chosen, setChosen] = useState(null);
  const scroller = useRef(null);

  const counts = useMemo(() => {
    const byPage = Object.fromEntries(PAGES.map((p) => [p, 0]));
    facilities.forEach((f) => { byPage[f.plan.page] += 1; });
    return byPage;
  }, [facilities]);

  // Keep the chosen floor while it still has results, otherwise show the first one that does.
  const page = chosen && counts[chosen] > 0 ? chosen : PAGES.find((p) => counts[p] > 0);
  const onPage = page ? facilities.filter((f) => f.plan.page === page) : [];

  // The plan is wider than the phone screen: bring the markers into view.
  const midX = onPage.length ? onPage.reduce((sum, f) => sum + f.plan.x, 0) / onPage.length : 0;
  const midY = onPage.length ? onPage.reduce((sum, f) => sum + f.plan.y, 0) / onPage.length : 0;
  useEffect(() => {
    const box = scroller.current;
    if (!box || onPage.length === 0) return;
    box.scrollLeft = (box.scrollWidth * midX) / 100 - box.clientWidth / 2;
    box.scrollTop = (box.scrollHeight * midY) / 100 - box.clientHeight / 2;
  }, [page, midX, midY, onPage.length]);

  if (!page) {
    return (
      <section className="facmap" aria-labelledby="facmap-title">
        <h3 id="facmap-title" className="facmap__title">Map</h3>
        <p className="facmap__empty">No facilities to show on the map.</p>
      </section>
    );
  }

  const title = FLOOR_PLAN_TITLES[page];
  return (
    <section className="facmap" aria-labelledby="facmap-title">
      <h3 id="facmap-title" className="facmap__title">Map</h3>

      <div className="facmap__tabs" role="group" aria-label="Choose a floor">
        {PAGES.map((p) => (
          <button
            key={p}
            type="button"
            className={`facmap__tab ${p === page ? 'facmap__tab--on' : ''}`}
            aria-pressed={p === page}
            aria-label={`${FLOOR_PLAN_TITLES[p]}, ${counts[p]} ${counts[p] === 1 ? 'facility' : 'facilities'}`}
            disabled={counts[p] === 0}
            onClick={() => setChosen(p)}
          >
            {TAB_LABELS[p]} <span>({counts[p]})</span>
          </button>
        ))}
      </div>

      <p className="facmap__summary" role="status" aria-live="polite">
        {title}: {onPage.length} {onPage.length === 1 ? 'facility' : 'facilities'} marked
      </p>

      <ul className="facmap__legend" aria-label="Map key">
        <li><span className="facmap__key facmap__key--elevator" aria-hidden="true">E</span> Elevator</li>
        <li><span className="facmap__key facmap__key--washroom" aria-hidden="true">W</span> Accessible washroom</li>
      </ul>

      <div className="floorplan__scroller" ref={scroller} tabIndex={0}>
        <div className="floorplan__canvas">
          <img
            className="floorplan__image"
            src={PLAN_IMAGES[page]}
            alt={`Progress Campus floor plan, ${title}. North is marked on the plan.`}
          />
          {onPage.map((f) => (
            <span
              key={f.id}
              className={`facmap__marker facmap__marker--${f.type === 'elevator' ? 'elevator' : 'washroom'}`}
              style={{ left: `${f.plan.x}%`, top: `${f.plan.y}%` }}
              role="img"
              aria-label={`${f.name}, ${f.location}`}
              title={`${f.name}, ${f.location}`}
            >
              {MARKER_LETTER[f.type]}
            </span>
          ))}
        </div>
      </div>
      <p className="facmap__hint">Scroll the plan to look around.</p>
    </section>
  );
}
