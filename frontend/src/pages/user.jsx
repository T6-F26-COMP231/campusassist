import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { places, getNode, findRoute } from '../lib/graph.js';
import { FEATURES, BARRIER_TYPES } from '../lib/data.js';
import { useData, useSession, setSession, blockedFeatures, submitBarrier, submitRequest, addSchedule, removeSchedule, STATUS_LABEL, ACTIVE } from '../lib/store.js';
import { Screen, useAuth } from '../components/Screen.jsx';
import LocationPicker from '../components/LocationPicker.jsx';
import RoutePanel from '../components/RoutePanel.jsx';
import MapPreview from '../components/MapPreview.jsx';
import { Badge, Button, Card, Empty, Field, Icon, LinkButton, Notice, fmtDateTime } from '../components/ui.jsx';

/* ------------------------------ Home (Figure 9) ------------------------------ */
export function ActiveRequestBanner() {
  const data = useData();
  const s = useSession();
  const r = data.requests.find((x) => x.id === s.myRequestId);
  if (!r || ![ 'pending', ...ACTIVE ].includes(r.status)) return null;
  return (
    <Link to={`/help/${r.id}`} className="banner">
      <Icon name="person" /><span className="grow"><strong>Your help request is {STATUS_LABEL[r.status].toLowerCase()}</strong><small>{r.id} · tap to view status</small></span><Icon name="arrow" size={18} />
    </Link>
  );
}

export function BarrierList() {
  const data = useData();
  const list = data.barriers.filter((b) => b.status === 'approved');
  if (!list.length) return null;
  return (
    <Card>
      <h2><Icon name="alert" size={18} /> Verified barriers right now</h2>
      <ul className="plain">
        {list.map((b) => <li key={b.id}><strong>{b.type}</strong> · {b.location}</li>)}
      </ul>
      <p className="muted small">Routes avoid these automatically.</p>
    </Card>
  );
}

export function Home() {
  const { name } = useAuth();
  const items = [
    ['/search', 'Search Location', 'Find rooms, offices, elevators and washrooms', 'search'],
    ['/help/new', 'Request Help', 'Ask an authorized helper to guide you', 'person'],
    ['/barrier/new', 'Report Barrier', 'Broken elevator? Blocked ramp? Tell us', 'alert'],
    ['/plan', 'Plan Arrival', 'Know when to leave for class', 'calendar'],
    ['/directory', 'Campus Directory', 'Faculty offices and campus services', 'book'],
  ];
  return (
    <Screen title="Welcome" sub="Home" home>
      <p className="muted lead">Hi {name?.split(' ')[0] || 'there'}. Find your way around campus.</p>
      <ActiveRequestBanner />
      <div className="stack">
        {items.map(([to, t, d, i]) => (
          <Link key={to} to={to} className="action-row">
            <span className="role-ico"><Icon name={i} size={22} /></span>
            <span className="grow"><strong>{t}</strong><small>{d}</small></span>
            <Icon name="arrow" size={18} />
          </Link>
        ))}
      </div>
      <BarrierList />
    </Screen>
  );
}

/* ------------------------- Search + filters (Figures 10–11) ------------------------- */
const FILTERS = [['elevator', 'Elevators', 'elevator'], ['washroom', 'Accessible washrooms', 'washroom'], ['ramp', 'Ramps', 'ramp'], ['autoDoor', 'Auto doors', 'door']];
const FEATURE_NAMES = { elevator: 'Elevator nearby', stepFree: 'Step-free access', washroom: 'Accessible washroom nearby', ramp: 'Ramp', autoDoor: 'Automatic door' };

export function Search() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [filters, setFilters] = useState([]);
  const query = q.trim().toLowerCase();
  const results = useMemo(() => places
    .filter((p) => (!query || p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)))
    .filter((p) => filters.every((f) => p.acc[f]))
    .sort((a, b) => (b.name.toLowerCase().startsWith(query) - a.name.toLowerCase().startsWith(query)) || a.name.localeCompare(b.name)), [query, filters]);
  const toggle = (f) => setFilters((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));

  return (
    <Screen title="Find a Campus Location" sub="Search Location">
      <form role="search" onSubmit={(e) => e.preventDefault()}>
        <div className="searchbox">
          <Icon name="search" size={18} />
          <input type="search" value={q} aria-label="Search campus locations" placeholder="Search campus location…" autoFocus
            onChange={(e) => { setQ(e.target.value); setParams(e.target.value ? { q: e.target.value } : {}, { replace: true }); }} />
        </div>
      </form>
      <fieldset className="filters">
        <legend>Accessible facilities</legend>
        <div className="row gap wrap">
          {FILTERS.map(([f, label, icon]) => (
            <button key={f} type="button" className={`chip toggle ${filters.includes(f) ? 'on' : ''}`} aria-pressed={filters.includes(f)} onClick={() => toggle(f)}>
              <Icon name={icon} size={16} />{label}
            </button>
          ))}
          {filters.length > 0 && <button type="button" className="link" onClick={() => setFilters([])}>Clear filters</button>}
        </div>
      </fieldset>
      <p className="muted small" aria-live="polite">{results.length} result{results.length === 1 ? '' : 's'}</p>
      <div className="stack">
        {results.map((p) => (
          <Link key={p.id} to={`/place/${p.id}`} className="result">
            <strong>{p.name}</strong>
            <small>Block {p.block}, Floor {p.floor}</small>
            <span className="row gap wrap">
              {['elevator', 'washroom', 'ramp', 'autoDoor'].filter((f) => p.acc[f]).map((f) => <Badge key={f}>{FEATURE_NAMES[f]}</Badge>)}
            </span>
            <span className="view">View Details <Icon name="arrow" size={14} /></span>
          </Link>
        ))}
        {!results.length && <Empty>No results found{query ? ` for “${q}”` : ''}. Try another name or clear the filters.</Empty>}
      </div>
    </Screen>
  );
}

/* ------------------------- Destination details (Figure 12) ------------------------- */
export function Place() {
  const { id } = useParams();
  const nav = useNavigate();
  const data = useData();
  const s = useSession();
  const p = getNode(id);
  const blocked = blockedFeatures(data);
  if (!p || p.kind === 'hub') return <Screen title="Not found"><Empty>That place does not exist.</Empty><LinkButton to="/search">Back to search</LinkButton></Screen>;
  const blockedHere = blocked.includes(getEntranceFeature(p.id));
  const go = () => (s.start ? nav(`/navigate?from=${s.start}&to=${p.id}`) : nav(`/start?to=${p.id}`));
  const rows = [['elevator', 'Elevator Access'], ['stepFree', 'Step-Free Entrance'], ['washroom', 'Accessible Washroom Nearby'], ['ramp', 'Ramp'], ['autoDoor', 'Automatic Door']];

  return (
    <Screen title={p.name} sub="Destination Details">
      <p className="muted">Progress Campus, Block {p.block}, Floor {p.floor}</p>
      <p>{p.description}</p>
      {blockedHere && <Notice kind="warn">A verified barrier is reported at this entrance.</Notice>}
      <MapPreview pins={[p.id]} you={s.start} blocked={blocked} />
      <Card>
        <h2>Accessibility Features</h2>
        <ul className="acc-list">
          {rows.map(([k, label]) => (
            <li key={k} className={p.acc[k] ? 'yes' : 'no'}>
              <Icon name={p.acc[k] ? 'check' : 'x'} size={16} />
              <span>{p.acc[k] ? label : `No ${label.replace(' Nearby', '').replace('Access', 'access').toLowerCase()}`}</span>
              <span className="sr-only">{p.acc[k] ? 'available' : 'not available'}</span>
            </li>
          ))}
        </ul>
      </Card>
      <div className="row between wrap">
        <span className="muted small">Starting point: <strong>{s.start ? getNode(s.start)?.name : 'not set'}</strong></span>
        <Link className="link" to={`/start?to=${p.id}`}>{s.start ? 'Change' : 'Set it now'}</Link>
      </div>
      <Button icon="arrow" onClick={go}>Get Directions</Button>
    </Screen>
  );
}
const getEntranceFeature = (id) => ({ 'a-main': 'door-a-main', 'b-east': 'ramp-b-east', 'c-main': 'door-c-main' }[id]);

/* ------------------------- Set start location (Figure 13) ------------------------- */
export function StartLocation() {
  const [params] = useSearchParams();
  const to = params.get('to');
  const nav = useNavigate();
  const s = useSession();
  const [start, setStart] = useState(s.start ?? null);
  const [just, setJust] = useState(false);
  const dest = getNode(to);
  const proceed = () => { setSession({ start }); nav(to ? `/navigate?from=${start}&to=${to}` : `/search`); };

  return (
    <Screen title="Set Start Location" sub="Destination Details">
      {dest && <Card><span className="muted small">Destination</span><strong>{dest.name}</strong></Card>}
      <LocationPicker label="Where are you now?" value={start} onChange={(v) => { setStart(v); setJust(true); setSession({ start: v }); }} hint="Scan a QR code posted on campus, or pick your spot from the list." />
      {start && <Notice kind="success">Starting point set to <strong>{getNode(start).name}</strong>.</Notice>}
      <Button icon="arrow" disabled={!start} onClick={proceed}>{to ? 'Continue to directions' : 'Done'}</Button>
      {!start && !just && <p className="muted small">The app can’t detect your indoor location, so it needs a starting point from you.</p>}
    </Screen>
  );
}

/* ------------------------- Navigation (Figures 14–15) ------------------------- */
export function Navigate() {
  const [params, setParams] = useSearchParams();
  const from = params.get('from') || null;
  const to = params.get('to') || null;
  const stepFree = params.get('sf') === '1';
  const set = (patch) => {
    const next = Object.fromEntries(params);
    Object.entries(patch).forEach(([k, v]) => (v ? (next[k] = v) : delete next[k]));
    setParams(next, { replace: true });
    if (patch.from) setSession({ start: patch.from });
  };
  return (
    <Screen title="Step-by-Step Directions" sub="Navigation">
      <Card>
        <LocationPicker label="From" value={from} onChange={(v) => set({ from: v })} />
        <LocationPicker label="To" value={to} onChange={(v) => set({ to: v })} allowQr={false} />
        <Button variant="ghost" icon="swap" onClick={() => set({ from: to, to: from })}>Swap</Button>
      </Card>
      <RoutePanel from={from} to={to} stepFree={stepFree} onStepFree={(v) => set({ sf: v ? '1' : '' })} />
    </Screen>
  );
}

/* ------------------------- Report barrier (Figures 20, 46) ------------------------- */
async function shrink(file) {
  const url = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
  const k = Math.min(1, 640 / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.7);
}

export function ReportBarrier() {
  const { role, email } = useAuth();
  const [type, setType] = useState(BARRIER_TYPES[0]);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(null);

  const onPhoto = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try { setPhoto(await shrink(f)); } catch { setError('That photo could not be read. Try another image.'); }
  };
  const submit = (e) => {
    e.preventDefault();
    if (!location.trim()) return setError('A report without a location is not accepted. Tell us where the barrier is.');
    const r = submitBarrier({ type, location, description, photo, reporter: email ?? 'guest' });
    setSent(r.id);
  };

  if (sent) {
    return (
      <Screen title="Report sent" sub="Report Barrier">
        <Notice kind="success">Report <strong>{sent}</strong> was saved. An administrator reviews it before any routes change.</Notice>
        <Button variant="secondary" onClick={() => { setSent(null); setLocation(''); setDescription(''); setPhoto(null); }}>Report another barrier</Button>
        <LinkButton to={role === 'staff' ? '/staff' : '/home'}>Back to home</LinkButton>
      </Screen>
    );
  }
  return (
    <Screen title="Report a Barrier" sub="Report Barrier">
      <form className="stack" onSubmit={submit} noValidate>
        <Field label="Barrier type"><select value={type} onChange={(e) => setType(e.target.value)}>{BARRIER_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Location (required)" error={error}>
          <input list="barrier-places" value={location} onChange={(e) => { setLocation(e.target.value); setError(''); }} placeholder="e.g. Near room B230, Block B" aria-invalid={!!error} />
          <datalist id="barrier-places">
            {Object.values(FEATURES).map((f) => <option key={f.label} value={f.label} />)}
            {places.filter((p) => p.kind !== 'entrance').map((p) => <option key={p.id} value={`Near ${p.name}`} />)}
          </datalist>
        </Field>
        <Field label="Description"><textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is blocked?" /></Field>
        <div className="stack tight">
          <label className="btn btn-secondary file"><Icon name="image" size={18} />{photo ? 'Replace photo' : '+ Add photo (optional)'}<input type="file" accept="image/*" onChange={onPhoto} hidden /></label>
          {photo && <div className="photo"><img src={photo} alt="Attached barrier" /><Button variant="ghost" onClick={() => setPhoto(null)}>Remove</Button></div>}
        </div>
        <Button type="submit" icon="send">Submit for review</Button>
        <p className="muted small">An administrator reviews it before routes change.</p>
      </form>
    </Screen>
  );
}

/* ------------------------- Plan arrival (Figure 21) ------------------------- */
const pad = (n) => String(n).padStart(2, '0');
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

export function PlanArrival() {
  const data = useData();
  const s = useSession();
  const { email, role, name } = useAuth();
  const blocked = blockedFeatures(data);
  const [start, setStart] = useState(s.start ?? null);
  const [room, setRoom] = useState(null);
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState('');
  const [sf, setSf] = useState(false);
  const [book, setBook] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const mine = data.schedules.filter((x) => x.owner === (email ?? 'guest'));

  const route = start && room ? findRoute(start, room, { stepFree: sf, blocked }) : null;
  const cls = time ? new Date(`${date}T${time}`) : null;
  const leave = route && cls ? new Date(cls.getTime() - (route.minutes + 7) * 60000) : null;
  const t12 = (d) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const save = () => {
    setSaved(false);
    if (!start || !room || !time) return setError('Choose where you are starting, your classroom, and the class start time.');
    if (cls <= new Date()) return setError('That class time is in the past. Pick a time later than now.');
    if (!route) return setError(sf ? 'No step-free route is available to that room right now.' : 'No route is available to that room right now.');
    addSchedule({ owner: email ?? 'guest', startId: start, roomId: room, classAt: cls.toISOString(), leaveAt: leave.toISOString(), minutes: route.minutes, stepFree: sf });
    if (book) submitRequest({ locationId: start, destination: `Scheduled arrival: ${getNode(room).name}`, type: sf ? 'Mobility Assistance' : 'Standard Guiding', ownerEmail: email, ownerName: name, scheduledFor: cls.toISOString() });
    setError(''); setSaved(true);
  };

  return (
    <Screen title="Plan Route for a Class" sub="Plan Arrival">
      <LocationPicker label="Starting from" value={start} onChange={(v) => { setStart(v); setError(''); }} />
      <LocationPicker label="Class room" value={room} onChange={(v) => { setRoom(v); setError(''); }} allowQr={false} />
      <div className="row gap">
        <Field label="Date"><input type="date" value={date} onChange={(e) => { setDate(e.target.value); setError(''); }} /></Field>
        <Field label="Class start time"><input type="time" value={time} onChange={(e) => { setTime(e.target.value); setError(''); }} /></Field>
      </div>
      <label className="check-row"><input type="checkbox" checked={sf} onChange={(e) => setSf(e.target.checked)} /><span><strong>Step-free route</strong></span></label>
      {role === 'user' && <label className="check-row"><input type="checkbox" checked={book} onChange={(e) => setBook(e.target.checked)} /><span><strong>Also book an in-person helper</strong><small>Adds a scheduled request that helpers can accept</small></span></label>}
      {route && <Card><strong>Estimated walking time: {route.minutes} min</strong>{leave && <p className="leave">Leave by <strong>{t12(leave)}</strong> (7 min buffer)</p>}</Card>}
      {error && <Notice kind="error">{error}</Notice>}
      {saved && <Notice kind="success">Schedule saved.</Notice>}
      <Button onClick={save} icon="calendar">Save schedule route</Button>
      {mine.length > 0 && (
        <Card>
          <h2>Saved plans</h2>
          <ul className="plain">
            {mine.map((m) => (
              <li key={m.id} className="row between">
                <span><strong>{getNode(m.roomId).name}</strong><small className="block">Class {fmtDateTime(m.classAt)} · leave {new Date(m.leaveAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</small></span>
                <span className="row gap">
                  <Link className="link" to={`/navigate?from=${m.startId}&to=${m.roomId}${m.stepFree ? '&sf=1' : ''}`}>Directions</Link>
                  <button className="link danger" onClick={() => removeSchedule(m.id)}>Remove</button>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </Screen>
  );
}

/* ------------------------- Directory (Figures 22, 23, 44, 45) ------------------------- */
export function Directory() {
  const data = useData();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'resource' ? 'resource' : 'colleague';
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const list = data.directory.filter((e) => e.kind === tab && (!q.trim() || e.name.toLowerCase().includes(q.trim().toLowerCase()) || e.dept.toLowerCase().includes(q.trim().toLowerCase())));
  return (
    <Screen title="Directory" sub="Directory">
      <div className="seg" role="tablist">
        {[['colleague', 'Colleagues'], ['resource', 'Resource Offices']].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => { setParams(k === 'resource' ? { tab: 'resource' } : {}, { replace: true }); setQ(''); setOpen(null); }}>{l}</button>
        ))}
      </div>
      <div className="searchbox">
        <Icon name="search" size={18} />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} aria-label={tab === 'resource' ? 'Search resource offices' : 'Search colleague name'} placeholder={tab === 'resource' ? 'Search resource offices…' : 'Search faculty name…'} />
      </div>
      <div className="stack">
        {list.map((e) => {
          const p = getNode(e.placeId);
          const expanded = open === e.id;
          return (
            <Card key={e.id} className="entry">
              <button className="entry-head" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : e.id)}>
                <span className="grow"><strong>{e.name}</strong><small className="block">{e.dept}</small></span>
                <span className="muted small">{p?.name.replace(/ \(.*\)/, '')}</span>
              </button>
              <div className="row between wrap">
                <span className="muted small"><Icon name="pin" size={14} /> {p?.name}, Block {p?.block}, Floor {p?.floor}</span>
                <LinkButton variant="primary" to={`/place/${e.placeId}`}>Show on Map</LinkButton>
              </div>
              {expanded && <p className="muted small">{e.email}</p>}
            </Card>
          );
        })}
        {!list.length && <Empty>No results found.</Empty>}
      </div>
    </Screen>
  );
}
