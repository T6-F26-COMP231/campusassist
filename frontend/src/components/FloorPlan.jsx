import { useEffect, useRef } from 'react';
import { FLOOR_PLAN_TITLES, NOT_ON_PLAN_MESSAGE, locateRoom } from '../lib/floorPlan';
import floor1 from '../assets/floorplans/floor-1.png';
import floor2 from '../assets/floorplans/floor-2.png';
import floor3 from '../assets/floorplans/floor-3.png';
import floor4 from '../assets/floorplans/floor-4.png';
import floor5 from '../assets/floorplans/floor-5.png';
import './FloorPlan.css';

const PLAN_IMAGES = { 1: floor1, 2: floor2, 3: floor3, 4: floor4, 5: floor5 };

// Shows the Progress Campus floor plan for the floor in `location`, with a marker on
// the room. The marker follows `location`; nothing is pinned to a fixed room.
export default function FloorPlan({ location }) {
  const room = locateRoom(location);
  const scroller = useRef(null);

  // The plan is wider than the phone screen: bring the marker into view.
  const [firstX, firstY] = room?.spots[0] ?? [];
  useEffect(() => {
    const box = scroller.current;
    if (!box || firstX === undefined) return;
    box.scrollLeft = (box.scrollWidth * firstX) / 100 - box.clientWidth / 2;
    box.scrollTop = (box.scrollHeight * firstY) / 100 - box.clientHeight / 2;
  }, [room?.page, room?.code, firstX, firstY]);

  if (!room) {
    return (
      <p className="notice floorplan__missing" role="status">
        {NOT_ON_PLAN_MESSAGE}
      </p>
    );
  }

  const title = FLOOR_PLAN_TITLES[room.page];
  return (
    <section className="floorplan" aria-label={`Floor plan: ${title}`}>
      <h3 className="floorplan__title">
        {title} <span>· Room {room.code}</span>
      </h3>
      <div className="floorplan__scroller" ref={scroller} tabIndex={0}>
        <div className="floorplan__canvas">
          <img
            className="floorplan__image"
            src={PLAN_IMAGES[room.page]}
            alt={`Progress Campus floor plan, ${title}. North is marked on the plan.`}
          />
          {room.spots.map(([x, y]) => (
            <span
              key={`${x}-${y}`}
              className="floorplan__marker"
              style={{ left: `${x}%`, top: `${y}%` }}
              role="img"
              aria-label={`Marker: room ${room.code}`}
            />
          ))}
        </div>
      </div>
      <p className="floorplan__hint">Scroll the plan to look around.</p>
    </section>
  );
}
