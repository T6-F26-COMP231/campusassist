import { useEffect, useMemo, useRef, useState } from 'react';
import { PLAN_IMAGES } from '../assets/floorplans';
import { FLOOR_PLAN_TITLES } from '../lib/floorPlan';
import { planLeg } from '../lib/routeMap';
import { floorLabels } from '../lib/routeSummary';
import './FloorPlan.css';
import './RouteMap.css';

// Floor plan with the walking path drawn on it. A route that changes floor has one tab per floor.
export default function RouteMap({ legs, building, fromName, toName }) {
  const [chosen, setChosen] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const scroller = useRef(null);

  const drawn = useMemo(() => legs.map((leg) => planLeg(leg, building)), [legs, building]);
  const index = chosen < legs.length ? chosen : 0;
  const leg = legs[index];
  const plan = drawn[index];

  useEffect(() => {
    const box = scroller.current;
    if (!box || !plan) return;
    const xs = plan.points.map((p) => p.x);
    const ys = plan.points.map((p) => p.y);
    const midX = (Math.min(...xs) + Math.max(...xs)) / 2 / plan.size.width;
    const midY = (Math.min(...ys) + Math.max(...ys)) / 2 / plan.size.height;
    box.scrollLeft = box.scrollWidth * midX - box.clientWidth / 2;
    box.scrollTop = box.scrollHeight * midY - box.clientHeight / 2;
  }, [plan, loaded]);

  const labels = floorLabels(legs);
  const first = index === 0;
  const last = index === legs.length - 1;
  const line = plan ? plan.points.map((p) => `${p.x},${p.y}`).join(' ') : '';

  return (
    <section className="routemap" aria-labelledby="routemap-title">
      <h3 id="routemap-title" className="routemap__title">Route on the map</h3>

      {plan ? (
        <>
          <p className="routemap__legend">
            <span className="routemap__swatch" aria-hidden="true" /> Walking path
            {first && (
              <>
                <span className="routemap__dot routemap__dot--from" aria-hidden="true">A</span> {fromName}
              </>
            )}
            {last && (
              <>
                <span className="routemap__dot routemap__dot--to" aria-hidden="true">B</span> {toName}
              </>
            )}
          </p>
          <div className="floorplan__scroller" ref={scroller} tabIndex={0}>
            <div className="floorplan__canvas">
              <img
                className="floorplan__image"
                onLoad={() => setLoaded((n) => n + 1)}
                src={PLAN_IMAGES[plan.page]}
                alt={`Progress Campus floor plan, ${FLOOR_PLAN_TITLES[plan.page]}, with the walking path drawn on it.`}
              />
              <svg
                className="routemap__svg"
                viewBox={`0 0 ${plan.size.width} ${plan.size.height}`}
                role="img"
                aria-label={`Walking path on Floor ${leg.floor}`}
              >
                <polyline className="routemap__halo" points={line} />
                <polyline className="routemap__line" points={line} />
                {first && (
                  <circle className="routemap__end routemap__end--from" cx={plan.points[0].x} cy={plan.points[0].y} r="24" />
                )}
                {last && (
                  <circle className="routemap__end routemap__end--to" cx={plan.points.at(-1).x} cy={plan.points.at(-1).y} r="24" />
                )}
              </svg>
            </div>
          </div>
          <p className="routemap__hint">Scroll the plan to look around.</p>
        </>
      ) : (
        <p className="routemap__empty">The floor plan does not cover Floor {leg.floor}, so the path is not drawn.</p>
      )}

      {legs.length > 1 && (
        <div className="routemap__tabs" role="group" aria-label="Choose a floor of the route">
          {legs.map((l, i) => (
            <button
              key={`${l.floor}-${i}`}
              type="button"
              className={`routemap__tab ${i === index ? 'routemap__tab--on' : ''}`}
              aria-pressed={i === index}
              onClick={() => setChosen(i)}
            >
              {labels[i]}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
