import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ASSIST_TYPES } from '../lib/data.js';
import { useData, useSession, setSession, submitRequest, sendMessage } from '../lib/store.js';
import { Screen, useAuth } from '../components/Screen.jsx';
import LocationPicker from '../components/LocationPicker.jsx';
import { Button, Empty, Field, Notice, fmtTime } from '../components/ui.jsx';

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
    nav(guest ? '/visitor' : '/home');
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
