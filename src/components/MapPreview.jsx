import { NODES, EDGES } from '../lib/data.js';
import { getNode } from '../lib/graph.js';

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
const COLS = [['A', 70], ['B', 180], ['C', 290]];
const FLOORS = [[3, 50], [2, 105], [1, 160]];

/**
 * Schematic campus map (blocks as columns, floors as rows). It is a route-map view,
 * not a floor plan: lime = your route, red dashed = verified barrier, dark pin = place.
 */
export default function MapPreview({ route, pins = [], blocked = [], you, label = 'Campus map preview' }) {
  const onPath = new Set();
  route?.legs.forEach((l) => onPath.add(l.edge.id));
  const shown = new Set([...(route?.nodes ?? []), ...pins, ...(you ? [you] : [])]);
  const pt = (id) => byId[id].pos;

  const edges = EDGES.filter((e) => {
    const a = byId[e.a], b = byId[e.b];
    const isHubLink = a.kind === 'hub' && b.kind === 'hub';
    const isEntrance = a.kind === 'entrance' || b.kind === 'entrance';
    return isHubLink || isEntrance || onPath.has(e.id);
  });
  const shift = (e) => {
    const a = pt(e.a), b = pt(e.b);
    if (a.x === b.x && byId[e.a].kind === 'hub' && byId[e.b].kind === 'hub') return e.type === 'elevator' ? 6 : -6;
    return 0;
  };

  return (
    <figure className="map">
      <svg viewBox="0 0 360 240" role="img" aria-label={label}>
        {COLS.map(([b, x]) => (
          <g key={b}>
            <rect x={x - 48} y={22} width={96} height={170} rx={10} className="map-block" />
            <text x={x} y={16} textAnchor="middle" className="map-label">Block {b}</text>
          </g>
        ))}
        {FLOORS.map(([f, y]) => <text key={f} x={4} y={y + 4} className="map-floor">F{f}</text>)}

        {edges.map((e) => {
          const a = pt(e.a), b = pt(e.b), s = shift(e);
          const bad = e.feature && blocked.includes(e.feature);
          const hot = onPath.has(e.id);
          const cls = bad ? 'edge bad' : hot ? 'edge hot' : e.type === 'stairs' ? 'edge dash' : 'edge';
          return (
            <g key={e.id}>
              {hot && <line x1={a.x + s} y1={a.y} x2={b.x + s} y2={b.y} className="edge halo" />}
              <line x1={a.x + s} y1={a.y} x2={b.x + s} y2={b.y} className={cls} />
              {bad && <text x={(a.x + b.x) / 2 + s} y={(a.y + b.y) / 2 + 4} textAnchor="middle" className="map-warn">!</text>}
            </g>
          );
        })}

        {NODES.filter((n) => n.kind === 'hub').map((n) => <circle key={n.id} cx={n.pos.x} cy={n.pos.y} r={4} className="hub" />)}
        {NODES.filter((n) => n.kind === 'entrance').map((n) => <rect key={n.id} x={n.pos.x - 4} y={n.pos.y - 4} width={8} height={8} rx={2} className="entr" />)}
        {[...shown].filter((id) => byId[id].kind !== 'hub').map((id) => <circle key={id} cx={pt(id).x} cy={pt(id).y} r={3.5} className="dot" />)}

        {pins.map((id) => (
          <g key={id} transform={`translate(${pt(id).x} ${pt(id).y})`}>
            <path d="M0 0c-9-9-9-16 0-16s9 7 0 16z" className="pin" transform="translate(0 -2)" />
            <circle cx="0" cy="-13" r="2.6" className="pin-dot" />
          </g>
        ))}
        {you && (
          <g>
            <circle cx={pt(you).x} cy={pt(you).y} r={9} className="you-ring" />
            <circle cx={pt(you).x} cy={pt(you).y} r={4.5} className="you" />
          </g>
        )}
      </svg>
      <figcaption>
        {you && <span><i className="k you-k" /> You</span>}
        {pins.length > 0 && <span><i className="k pin-k" /> Destination</span>}
        {route && <span><i className="k hot-k" /> Route</span>}
        {blocked.length > 0 && <span><i className="k bad-k" /> Verified barrier</span>}
        <span className="muted">{getNode(pins[0])?.name ?? 'Pilot area: Blocks A, B, C'}</span>
      </figcaption>
    </figure>
  );
}
