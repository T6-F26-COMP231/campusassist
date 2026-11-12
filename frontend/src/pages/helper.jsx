import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { findRoute, getNode } from '../lib/graph.js';
import { useData, useSession, setSession, acceptRequest, setRequestStatus, completeRequest, ackCancelled, blockedFeatures, ACTIVE, STATUS_LABEL } from '../lib/store.js';
import { Screen, useAuth } from '../components/Screen.jsx';
import LocationPicker from '../components/LocationPicker.jsx';
import RoutePanel from '../components/RoutePanel.jsx';
import MapPreview from '../components/MapPreview.jsx';
import { Badge, Button, Card, Dialog, Empty, Field, Icon, LinkButton, Notice, fmtDateTime } from '../components/ui.jsx';

const HELPER_DEFAULT_LOC = 'b-concourse';

function useHelper() {
  const data = useData();
  const s = useSession();
  const { email } = useAuth();
  const active = data.requests.find((r) => r.helperEmail === email && ACTIVE.includes(r.status));
  const cancelledNotice = data.requests.find((r) => r.helperEmail === email && r.status === 'cancelled' && r.cancelledAfterAccept && !r.ackedByHelper);
  return { data, email, loc: s.helperLoc ?? HELPER_DEFAULT_LOC, active, cancelledNotice };
}

/* ------------------- Open requests nearby (Figure 25) ------------------- */
export function OpenRequests() {
  const { data, email, loc, active, cancelledNotice } = useHelper();
  const nav = useNavigate();
  const blocked = blockedFeatures(data);
  const [msg, setMsg] = useState({});
  const open = data.requests.filter((r) => r.status === 'pending').map((r) => ({ r, d: findRoute(loc, r.locationId, { blocked })?.dist ?? null }))
    .sort((a, b) => (a.d ?? 1e9) - (b.d ?? 1e9));

  const accept = (id) => {
    const res = acceptRequest(id, email);
    if (!res.ok) setMsg((m) => ({ ...m, [id]: res.error })); else nav(`/helper/active/${id}`);
  };

  return (
    <Screen title="Open Requests Nearby" sub="Help Requests" home>
      <LocationPicker label="My location" value={loc} onChange={(v) => setSession({ helperLoc: v ?? HELPER_DEFAULT_LOC })} allowQr={false} hint="Distances are measured along walkable routes from here." />
      {cancelledNotice && (
        <Notice kind="warn" action={<Button variant="secondary" onClick={() => ackCancelled(cancelledNotice.id)}>Dismiss</Button>}>
          {cancelledNotice.id} was cancelled by the user. You do not need to go.
        </Notice>
      )}
      {active && (
        <Link to={`/helper/active/${active.id}`} className="banner">
          <Icon name="person" /><span className="grow"><strong>You have an active request</strong><small>{active.id} · {STATUS_LABEL[active.status]}</small></span><Icon name="arrow" size={18} />
        </Link>
      )}
      <p className="muted small" aria-live="polite">{open.length} open request{open.length === 1 ? '' : 's'}</p>
      <div className="stack">
        {open.map(({ r, d }) => {
          const p = getNode(r.locationId);
          return (
            <Card key={r.id}>
              <div className="row between"><strong>Request {r.id}</strong>{r.scheduledFor ? <Badge tone="ink"><Icon name="calendar" size={12} /> {fmtDateTime(r.scheduledFor)}</Badge> : <Badge tone="lime">Now</Badge>}</div>
              <dl className="kv">
                <dt>From</dt><dd>{r.ownerName}</dd>
                <dt>Location</dt><dd>{p.name}, Block {p.block}, Floor {p.floor}</dd>
                <dt>Needs</dt><dd>{r.destination || r.type}</dd>
                <dt>Distance</dt><dd>{d == null ? 'No route from your location' : `${d} m away`}</dd>
              </dl>
              {msg[r.id] && <Notice kind="error">{msg[r.id]}</Notice>}
              <div className="row gap">
                <LinkButton variant="secondary" to={`/helper/request/${r.id}`}>Details</LinkButton>
                <Button onClick={() => accept(r.id)} disabled={!!active} title={active ? 'Finish your active request first' : undefined}>Accept Request</Button>
              </div>
            </Card>
          );
        })}
        {!open.length && <Empty>No open requests right now. New ones appear here instantly.</Empty>}
      </div>
    </Screen>
  );
}

/* ------------------- Request details + accept (Figure 26) ------------------- */
export function RequestDetails() {
  const { id } = useParams();
  const { data, email, active } = useHelper();
  const nav = useNavigate();
  const [err, setErr] = useState('');
  const r = data.requests.find((x) => x.id === id);
  if (!r) return <Screen title="Request not found"><Empty>That request no longer exists.</Empty></Screen>;
  const p = getNode(r.locationId);
  const taken = r.status !== 'pending';
  return (
    <Screen title="Request Details" sub={r.id}>
      <MapPreview pins={[r.locationId]} blocked={blockedFeatures(data)} />
      <Card>
        <strong>{r.ownerName}</strong>
        <p>{r.destination || r.type}</p>
        <p className="muted">{p.name}, Block {p.block}, Floor {p.floor}</p>
        {r.scheduledFor && <p><Icon name="calendar" size={14} /> Scheduled for {fmtDateTime(r.scheduledFor)}</p>}
      </Card>
      {taken && <Notice kind="warn">This request is {STATUS_LABEL[r.status].toLowerCase()}{r.helperEmail && r.helperEmail !== email ? ' by another helper' : ''}, so it can’t be accepted.</Notice>}
      {err && <Notice kind="error">{err}</Notice>}
      <Button disabled={taken || !!active} onClick={() => { const res = acceptRequest(r.id, email); res.ok ? nav(`/helper/active/${r.id}`) : setErr(res.error); }}>Accept Request</Button>
      {active && !taken && <p className="muted small">Finish your active request ({active.id}) before accepting another.</p>}
    </Screen>
  );
}

/* ------------------- Active request: status, complete (Figures 28, 30) ------------------- */
export function ActiveRequest() {
  const { id } = useParams();
  const { data, email } = useHelper();
  const [status, setStatus] = useState('on_the_way');
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState(null);
  const r = data.requests.find((x) => x.id === id && x.helperEmail === email);
  if (!r) return <Screen title="Not available"><Notice kind="error">You are not assigned to this request.</Notice><LinkButton to="/helper">Back to open requests</LinkButton></Screen>;
  const p = getNode(r.locationId);

  if (r.status === 'cancelled') {
    return (
      <Screen title="Request cancelled" sub={r.id}>
        <Notice kind="warn">The user cancelled this request. You do not need to go.</Notice>
        <LinkButton to="/helper" onClick={() => ackCancelled(r.id)}>View Available Requests</LinkButton>
      </Screen>
    );
  }
  if (r.status === 'completed') {
    return (
      <Screen title="Request Completed!" sub={r.id}>
        <Notice kind="success">Thanks, {r.id} is closed. You can take another request now.</Notice>
        <LinkButton to="/helper">View Available Requests</LinkButton>
      </Screen>
    );
  }
  return (
    <Screen title="Active Help Request" sub={r.id}>
      <Card>
        <dl className="kv">
          <dt>User</dt><dd>{r.ownerName}</dd>
          <dt>Location</dt><dd>{p.name}, Block {p.block}, Floor {p.floor}</dd>
          <dt>Needs</dt><dd>{r.destination || r.type}</dd>
          <dt>Status</dt><dd><strong>{STATUS_LABEL[r.status]}</strong></dd>
        </dl>
      </Card>
      <div className="row gap wrap">
        <LinkButton variant="secondary" icon="arrow" to={`/helper/active/${r.id}/directions`}>Directions to user</LinkButton>
        <LinkButton variant="secondary" icon="send" to={`/help/${r.id}/chat`}>Message user</LinkButton>
      </div>
      <Card>
        <Field label="Select new status">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="on_the_way">On the way</option>
            <option value="arrived">Arrived</option>
          </select>
        </Field>
        <Button onClick={() => { const res = setRequestStatus(r.id, email, status); setMsg(res.ok ? `Status updated successfully. The user now sees: ${STATUS_LABEL[status]}.` : res.error); }}>Update Status</Button>
        {msg && <Notice kind="success">{msg}</Notice>}
      </Card>
      <Button variant="secondary" icon="check" onClick={() => setConfirm(true)}>Mark complete</Button>
      {confirm && (
        <Dialog title="Complete this request?" onClose={() => setConfirm(false)}>
          <p>Have you finished assisting {r.ownerName}?</p>
          <div className="row gap end">
            <Button variant="secondary" onClick={() => setConfirm(false)}>Go back</Button>
            <Button onClick={() => { completeRequest(r.id, email); setConfirm(false); }}>Yes, complete</Button>
          </div>
        </Dialog>
      )}
    </Screen>
  );
}

/* ------------------- Directions to the user (Figure 27) ------------------- */
export function DirectionsToUser() {
  const { id } = useParams();
  const { data, email, loc } = useHelper();
  const [sf, setSf] = useState(false);
  const r = data.requests.find((x) => x.id === id && x.helperEmail === email);
  if (!r) return <Screen title="Not available"><Notice kind="error">You are not assigned to this request.</Notice></Screen>;
  return (
    <Screen title="Directions to User" sub="Active Navigation">
      <LocationPicker label="Your location" value={loc} onChange={(v) => setSession({ helperLoc: v ?? HELPER_DEFAULT_LOC })} allowQr={false} />
      <Card><span className="muted small">Destination (user’s location)</span><strong>{getNode(r.locationId).name}</strong></Card>
      <RoutePanel from={loc} to={r.locationId} stepFree={sf} onStepFree={setSf} />
    </Screen>
  );
}
