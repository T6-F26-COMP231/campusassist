import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getNode } from '../lib/graph.js';
import { ASSIST_TYPES } from '../lib/data.js';
import { useData, useSession, setSession, submitRequest, cancelRequest, sendMessage, STATUS_LABEL, ACTIVE } from '../lib/store.js';
import { Screen, useAuth } from '../components/Screen.jsx';
import LocationPicker from '../components/LocationPicker.jsx';
import MapPreview from '../components/MapPreview.jsx';
import { Button, Card, Dialog, Empty, Field, Icon, LinkButton, Notice, fmtDateTime, fmtTime } from '../components/ui.jsx';

/* ------------------- Request in-person help (Figures 16 and 42) ------------------- */
export function RequestHelp() {
  const { role, email, name } = useAuth();
  const s = useSession();
  const nav = useNavigate();
  const guest = role === 'visitor';
  const [loc, setLoc] = useState(s.start ?? null);
  const [dest, setDest] = useState('');
  const [type, setType] = useState(ASSIST_TYPES[0]);
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!loc) return setError('The request was not sent: choose your current location first.');
    const r = submitRequest({ locationId: loc, destination: dest.trim(), type, ownerEmail: guest ? null : email, ownerName: guest ? 'Guest' : name });
    setSession({ myRequestId: r.id, start: loc });
    nav(`/help/${r.id}`);
  };

  return (
    <Screen title={guest ? 'Request Help' : 'Request In-Person Help'} sub="Request Help">
      <form className="stack" onSubmit={submit} noValidate>
        <LocationPicker label="Your location (required)" value={loc} onChange={(v) => { setLoc(v); setError(''); }} error={error} />
        <Field label={guest ? 'Note for helper (optional)' : 'Destination / description'}>
          <textarea rows={3} value={dest} onChange={(e) => setDest(e.target.value)} placeholder={guest ? 'Where are you headed?' : 'e.g. Lost near room B101, need help walking to Block C'} />
        </Field>
        <fieldset className="radios">
          <legend>Assistance type</legend>
          {ASSIST_TYPES.map((t) => <label key={t}><input type="radio" name="type" checked={type === t} onChange={() => setType(t)} />{t}</label>)}
        </fieldset>
        <Button type="submit" icon="send">Send Help Request</Button>
        <p className="muted small">For non-emergency navigation help only. In an emergency, contact campus security or call 911.</p>
      </form>
    </Screen>
  );
}

/* ------------------- Status + cancel (Figures 17–18) ------------------- */
const STEPS = [['pending', 'Request Submitted', 'Your request was received'], ['accepted', 'Accepted', 'A helper accepted your request'], ['on_the_way', 'On the Way', 'Your helper is coming'], ['arrived', 'Arrived', 'Your helper is with you'], ['completed', 'Completed', 'All done']];

export function HelpStatus() {
  const { id } = useParams();
  const data = useData();
  const { role } = useAuth();
  const nav = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const r = data.requests.find((x) => x.id === id);
  if (!r) return <Screen title="Request not found"><Empty>We could not find that help request.</Empty><LinkButton to="/help/new">Request help</LinkButton></Screen>;

  const idx = STEPS.findIndex(([k]) => k === r.status);
  const open = r.status === 'pending' || ACTIVE.includes(r.status);
  const guest = !r.ownerEmail;
  const cancelled = r.status === 'cancelled';
  const place = getNode(r.locationId);

  return (
    <Screen title={open ? 'My Help Request' : cancelled ? 'Request cancelled' : 'Request completed'} sub={r.id}>
      <Card>
        <dl className="kv">
          <dt>Status</dt><dd><strong>{STATUS_LABEL[r.status]}</strong></dd>
          <dt>Location</dt><dd>{place?.name}, Block {place?.block}, Floor {place?.floor}</dd>
          {r.destination && <dt>Note</dt>}{r.destination && <dd>{r.destination}</dd>}
          <dt>Type</dt><dd>{r.type}</dd>
          {r.helperName && <><dt>Helper</dt><dd>{r.helperName}</dd></>}
          {r.scheduledFor && <><dt>Scheduled</dt><dd>{fmtDateTime(r.scheduledFor)}</dd></>}
        </dl>
      </Card>

      {cancelled ? (
        <Notice kind="info">This request was cancelled{r.cancelledAfterAccept ? ' and your helper has been notified' : ''}.</Notice>
      ) : (
        <ol className="timeline" aria-live="polite">
          {STEPS.map(([k, label, sub], i) => (
            <li key={k} className={i < idx ? 'done' : i === idx ? 'now' : ''}>
              <span className="dot">{i <= idx && <Icon name="check" size={12} />}</span>
              <span><strong>{label}</strong><small>{sub}</small></span>
            </li>
          ))}
        </ol>
      )}

      {r.status === 'pending' && <Notice>Waiting for a helper. Most requests are accepted within a few minutes.</Notice>}
      {ACTIVE.includes(r.status) && <Notice kind="success">Current status: <strong>{STATUS_LABEL[r.status]}</strong>. {r.status === 'on_the_way' ? 'Your helper is on the way.' : r.status === 'arrived' ? 'Your helper has arrived.' : 'A helper is assigned.'}</Notice>}

      <div className="stack">
        {open && (guest || role === 'visitor'
          ? <Link className="btn btn-secondary" to="/signin/user"><Icon name="send" size={18} />Sign in to message your helper</Link>
          : <LinkButton variant="primary" to={`/help/${r.id}/chat`} icon="send">Message helper</LinkButton>)}
        {open && <Button variant="secondary" onClick={() => setConfirm(true)}>Cancel Request</Button>}
        {!open && <LinkButton to="/help/new" variant="secondary">New help request</LinkButton>}
        <LinkButton to={role === 'visitor' ? '/visitor' : '/home'} variant="ghost">Back to home</LinkButton>
      </div>

      {confirm && (
        <Dialog title="Cancel help request?" onClose={() => setConfirm(false)}>
          <p>Are you sure you want to cancel your request?{ACTIVE.includes(r.status) && ' Your helper will be notified.'}</p>
          <div className="row gap end">
            <Button variant="secondary" onClick={() => setConfirm(false)}>Go back</Button>
            <Button onClick={() => { cancelRequest(r.id); setConfirm(false); }}>Yes, cancel</Button>
          </div>
        </Dialog>
      )}
    </Screen>
  );
}

/* ------------------- Messaging (Figures 19 and 29) ------------------- */
export function Chat() {
  const { id } = useParams();
  const data = useData();
  const { role, email } = useAuth();
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const end = useRef(null);
  const r = data.requests.find((x) => x.id === id);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [r?.messages.length]);

  if (!r) return <Screen title="Messages"><Empty>Request not found.</Empty></Screen>;
  if (role === 'visitor' || (!r.ownerEmail && role !== 'helper')) {
    return (
      <Screen title="Messages" sub="Account feature">
        <Notice kind="info" action={<Link className="btn btn-primary" to="/signin/user">Sign in</Link>}>Messaging is an account-only feature. Please sign in to continue.</Notice>
      </Screen>
    );
  }
  const me = role === 'helper' ? 'helper' : 'user';
  const other = me === 'helper' ? `User: ${r.ownerName}` : `Assigned Helper: ${r.helperName ?? 'not assigned yet'}`;
  const send = (e) => {
    e.preventDefault();
    const res = sendMessage(r.id, me, email, text);
    if (!res.ok) return setError(res.error);
    setText(''); setError('');
  };

  return (
    <Screen title={me === 'helper' ? 'Chat with User' : 'Message Assigned Helper'} sub={r.id} tabs={false}>
      <div className="whois">{other}</div>
      <div className="chat" aria-live="polite">
        {r.messages.length === 0 && <Empty>No messages yet. Share exactly where you are, e.g. “by the red benches near the stairs”.</Empty>}
        {r.messages.map((m, i) => (
          <div key={i} className={`bubble ${m.from === me ? 'mine' : 'theirs'}`}>
            <small>{m.from === me ? 'You' : m.from === 'helper' ? r.helperName : r.ownerName} · {fmtTime(m.at)}</small>
            {m.text}
          </div>
        ))}
        <div ref={end} />
      </div>
      {error && <Notice kind="error">{error}</Notice>}
      <form className="composer" onSubmit={send}>
        <input value={text} onChange={(e) => { setText(e.target.value); setError(''); }} aria-label="Message" placeholder={me === 'helper' ? 'Confirm the meeting spot…' : 'Type a message…'} />
        <Button type="submit" icon="send">Send</Button>
      </form>
    </Screen>
  );
}
