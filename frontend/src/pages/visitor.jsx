import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { places, findRoute, getNode } from '../lib/graph.js';
import { EVENTS } from '../lib/data.js';
import { useData, useSession, setSession, blockedFeatures } from '../lib/store.js';
import { Screen } from '../components/Screen.jsx';
import LocationPicker from '../components/LocationPicker.jsx';
import MapPreview from '../components/MapPreview.jsx';
import { BarrierList } from './user.jsx';
import { Badge, Button, Card, Empty, Icon, LinkButton, Notice } from '../components/ui.jsx';

/* ------------------- Visitor home (Figure 39) ------------------- */
export function VisitorHome() {
  const rows = [['/visitor/events', 'Find an event', 'calendar'], ['/visitor/entrances', 'Find an accessible entrance', 'door'], ['/help/new', 'Request in-person help', 'person']];
  return (
    <Screen title="Welcome, Visitor" sub="Home" home>
      <p className="muted small">No account needed to get directions.</p>
      <div className="stack">
        {rows.map(([to, t, i]) => (
          <Link key={to} to={to} className="action-row"><span className="role-ico"><Icon name={i} size={22} /></span><span className="grow"><strong>{t}</strong></span><Icon name="arrow" size={18} /></Link>
        ))}
      </div>
      <Card>
        <strong>Messaging a helper</strong>
        <p className="muted small">Account-only feature. Visitors are asked to sign in.</p>
        <LinkButton to="/signin/user" variant="secondary">Sign In</LinkButton>
      </Card>
      <BarrierList />
    </Screen>
  );
}

/* ------------------- Event search (Figure 40) ------------------- */
export function EventSearch() {
  const [q, setQ] = useState('');
  const s = useSession();
  const nav = useNavigate();
  const list = EVENTS.filter((e) => e.name.toLowerCase().includes(q.trim().toLowerCase()));
  const go = (e) => nav(s.start ? `/navigate?from=${s.start}&to=${e.placeId}` : `/start?to=${e.placeId}`);
  return (
    <Screen title="Find an Event" sub="Event Search">
      <div className="searchbox"><Icon name="search" size={18} /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Event name, e.g. Career Fair" aria-label="Event name" autoFocus /></div>
      <div className="stack">
        {list.map((e) => {
          const p = getNode(e.placeId);
          return (
            <Card key={e.id}>
              <strong>{e.name}</strong>
              <p className="muted">{p.name}, Block {p.block} · {e.time}</p>
              <Button onClick={() => go(e)} icon="arrow">Get Directions</Button>
            </Card>
          );
        })}
        {!list.length && <Empty>No events found.</Empty>}
      </div>
    </Screen>
  );
}

/* ------------------- Nearest accessible entrance (Figure 41) ------------------- */
const ENTRANCE_FEATURE = { 'a-main': 'door-a-main', 'b-east': 'ramp-b-east', 'c-main': 'door-c-main' };
const DETAIL = { 'a-main': 'automatic door', 'b-east': 'ramp', 'c-main': 'automatic door' };

export function Entrances() {
  const data = useData();
  const s = useSession();
  const [loc, setLoc] = useState(s.start ?? null);
  const blocked = blockedFeatures(data);
  const all = places.filter((p) => p.kind === 'entrance' && p.acc.stepFree);
  const hidden = all.filter((p) => blocked.includes(ENTRANCE_FEATURE[p.id]));
  const ranked = loc
    ? all.filter((p) => !blocked.includes(ENTRANCE_FEATURE[p.id]))
        .map((p) => ({ p, r: findRoute(loc, p.id, { stepFree: true, blocked }) }))
        .filter((x) => x.r).sort((a, b) => a.r.dist - b.r.dist)
    : [];
  return (
    <Screen title="Nearest Accessible Entrance" sub="Accessible Entrances">
      <LocationPicker label="Where are you?" value={loc} onChange={(v) => { setLoc(v); setSession({ start: v }); }} />
      <MapPreview you={loc} pins={ranked[0] ? [ranked[0].p.id] : []} blocked={blocked} />
      <p className="muted small">Accessible entrances only, nearest first.</p>
      {hidden.length > 0 && <Notice kind="warn">{hidden.map((h) => h.name).join(', ')} {hidden.length > 1 ? 'are' : 'is'} hidden because of a verified barrier.</Notice>}
      {!loc && <Notice>Choose where you are to see the nearest entrance.</Notice>}
      <div className="stack">
        {ranked.map(({ p, r }, i) => (
          <Card key={p.id}>
            <div className="row between"><strong>{i + 1}. {p.name}</strong>{i === 0 && <Badge tone="lime">Nearest</Badge>}</div>
            <p className="muted">{r.dist} m away · {DETAIL[p.id]}</p>
            <LinkButton to={`/navigate?from=${loc}&to=${p.id}&sf=1`}>Directions</LinkButton>
          </Card>
        ))}
      </div>
    </Screen>
  );
}

/* ------------------- Staff home (Figure 43) ------------------- */
export function StaffHome() {
  const rows = [['/directory', 'Directory', 'Find a colleague or a resource office', 'book'], ['/barrier/new', 'Report a Barrier', 'Report a barrier near your classroom', 'alert']];
  return (
    <Screen title="Staff Home" sub="Home" home tabs={false}>
      <p className="muted">Choose a task. Each one opens in one step.</p>
      <div className="stack">
        {rows.map(([to, t, d, i]) => (
          <Link key={to} to={to} className="action-row"><span className="role-ico"><Icon name={i} size={22} /></span><span className="grow"><strong>{t}</strong><small>{d}</small></span><Icon name="arrow" size={18} /></Link>
        ))}
      </div>
    </Screen>
  );
}
