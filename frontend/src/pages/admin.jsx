import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { places, getNode } from '../lib/graph.js';
import { FEATURES } from '../lib/data.js';
import { useData, approveBarrier, rejectBarrier, resolveBarrier, suggestedFeature, blockedFeatures, addHelper, setHelperActive, updateDirectoryEntry, TEMP_PASSWORD } from '../lib/store.js';
import { Screen, useAuth } from '../components/Screen.jsx';
import MapPreview from '../components/MapPreview.jsx';
import { Badge, Button, Card, Empty, Field, Icon, Notice, fmtDateTime } from '../components/ui.jsx';

const TONE = { pending: 'lime', approved: 'ink', rejected: 'neutral', resolved: 'neutral' };

/* ------------------- Admin home (Figure 31 leads here) ------------------- */
export function AdminHome() {
  const data = useData();
  const pending = data.barriers.filter((b) => b.status === 'pending').length;
  const active = data.barriers.filter((b) => b.status === 'approved').length;
  const helpers = data.users.filter((u) => u.role === 'helper' && u.active).length;
  const rows = [
    ['/admin/reports', 'Review Barrier Reports', `${pending} pending · ${active} active`, 'alert'],
    ['/admin/helpers', 'Helper Accounts', `${helpers} active helper${helpers === 1 ? '' : 's'}`, 'users'],
    ['/admin/directory', 'Directory Entries', `${data.directory.length} entries`, 'book'],
  ];
  return (
    <Screen title="Admin Home" sub="Administrator" home tabs={false}>
      <div className="stack">
        {rows.map(([to, t, d, i]) => (
          <Link key={to} to={to} className="action-row">
            <span className="role-ico"><Icon name={i} size={22} /></span>
            <span className="grow"><strong>{t}</strong><small>{d}</small></span>
            {t.startsWith('Review') && pending > 0 && <Badge tone="lime">{pending}</Badge>}
            <Icon name="arrow" size={18} />
          </Link>
        ))}
      </div>
    </Screen>
  );
}

/* ------------------- Barrier reports list (Figure 32) ------------------- */
export function BarrierReports() {
  const data = useData();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? 'pending';
  const groups = { pending: ['pending'], approved: ['approved'], closed: ['rejected', 'resolved'] };
  const list = data.barriers.filter((b) => groups[tab].includes(b.status)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const count = (t) => data.barriers.filter((b) => groups[t].includes(b.status)).length;
  return (
    <Screen title="Barrier Reports" sub="Administrator" tabs={false}>
      <div className="seg" role="tablist">
        {[['pending', 'Pending'], ['approved', 'Approved'], ['closed', 'Closed']].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setParams({ tab: k }, { replace: true })}>{l} ({count(k)})</button>
        ))}
      </div>
      <div className="stack">
        {list.map((b) => (
          <Card key={b.id}>
            <div className="row between"><strong>Report {b.id.replace('R-', '')} · {b.type}</strong><Badge tone={TONE[b.status]}>{b.status}</Badge></div>
            <p className="muted">{b.location}</p>
            <p className="small">{b.description || 'No description.'}</p>
            <Link className="btn btn-secondary" to={`/admin/reports/${b.id}`}>View Details</Link>
          </Card>
        ))}
        {!list.length && <Empty>No {tab} reports.</Empty>}
      </div>
    </Screen>
  );
}

/* ------------------- Report details: approve / reject / resolve (Figures 33–35) ------------------- */
export function ReportDetails() {
  const { id } = useParams();
  const data = useData();
  const b = data.barriers.find((x) => x.id === id);
  const [feature, setFeature] = useState(b ? suggestedFeature(b) ?? '' : '');
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState(null);
  if (!b) return <Screen title="Not found" tabs={false}><Empty>Report not found.</Empty></Screen>;

  const run = (res, ok) => setMsg(res.ok ? { kind: 'success', text: ok } : { kind: 'error', text: res.error });
  const shown = b.status === 'approved' ? b.feature : feature;
  const blocked = blockedFeatures(data);
  return (
    <Screen title={`Report ${b.id.replace('R-', '')}`} sub={b.type} tabs={false}>
      <Card>
        <div className="row between"><strong>{b.type}</strong><Badge tone={TONE[b.status]}>{b.status}</Badge></div>
        <dl className="kv">
          <dt>Location</dt><dd>{b.location}</dd>
          <dt>Description</dt><dd>{b.description || '—'}</dd>
          <dt>Reported</dt><dd>{fmtDateTime(b.createdAt)} by {b.reporter}</dd>
          {b.reason && <><dt>Reason</dt><dd>{b.reason}</dd></>}
        </dl>
        {b.photo && <img className="evidence" src={b.photo} alt="Photo attached to the report" />}
      </Card>

      <Field label="Route feature this blocks" hint="Approved barriers remove this feature from every route, for all users.">
        <select value={shown ?? ''} disabled={b.status !== 'pending'} onChange={(e) => setFeature(e.target.value)}>
          <option value="">None (does not change routes)</option>
          {Object.entries(FEATURES).map(([k, f]) => <option key={k} value={k}>{f.label}</option>)}
        </select>
      </Field>
      <MapPreview blocked={shown ? [...new Set([...blocked, shown])] : blocked} label="Barrier location" />
      {b.status === 'pending' && !feature && <Notice kind="warn">No route feature is selected, so approving this report will not change any routes.</Notice>}

      <Field label="Reason (optional, for rejections)"><textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Elevator checked and working" /></Field>
      <div className="stack">
        <Button icon="check" disabled={b.status !== 'pending'} onClick={() => run(approveBarrier(b.id, feature), feature ? `Approved. Routes now avoid “${FEATURES[feature].label}” for all users.` : 'Approved. No routes were changed.')}>Approve Report</Button>
        <Button variant="secondary" icon="x" disabled={b.status !== 'pending'} onClick={() => run(rejectBarrier(b.id, reason), 'Rejected. No routes were changed.')}>Reject Report</Button>
        <Button variant="secondary" onClick={() => run(resolveBarrier(b.id), 'Resolved. Blocked routes are open again.')}>Mark Resolved</Button>
      </div>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <p className="muted small">Approved barriers update routes for all users. Rejected reports do not change any routes.</p>
    </Screen>
  );
}

/* ------------------- Helper accounts (Figures 36–37) ------------------- */
export function HelperAccounts() {
  const data = useData();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState(null);
  const helpers = data.users.filter((u) => u.role === 'helper');
  const add = (e) => {
    e.preventDefault();
    const r = addHelper(name, email);
    if (r.ok) { setMsg({ kind: 'success', text: `Helper added. They can sign in with ${email.trim().toLowerCase()} and the temporary password “${TEMP_PASSWORD}”.` }); setName(''); setEmail(''); }
    else setMsg({ kind: 'error', text: r.error });
  };
  return (
    <Screen title="Helper Accounts" sub="Administrator" tabs={false}>
      <form className="stack" onSubmit={add} noValidate>
        <h2>Add Helper</h2>
        <Field label="Full name"><input value={name} onChange={(e) => { setName(e.target.value); setMsg(null); }} placeholder="Alex Smith" /></Field>
        <Field label="Email address"><input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setMsg(null); }} placeholder="alex@example.com" /></Field>
        <Button type="submit" icon="users">Add Helper</Button>
        {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      </form>
      <h2>Current helpers</h2>
      <div className="stack">
        {helpers.map((h) => (
          <Card key={h.email}>
            <div className="row between"><strong>{h.name}</strong><Badge tone={h.active ? 'lime' : 'neutral'}>{h.active ? 'Active' : 'Deactivated'}</Badge></div>
            <p className="muted">{h.email}</p>
            {h.active
              ? <Button variant="secondary" onClick={() => setHelperActive(h.email, false)}>Deactivate Helper</Button>
              : <Button variant="secondary" onClick={() => setHelperActive(h.email, true)}>Reactivate Helper</Button>}
            <p className="muted small">{h.active ? '' : 'A deactivated helper can no longer sign in or take requests.'}</p>
          </Card>
        ))}
      </div>
    </Screen>
  );
}

/* ------------------- Directory entries (Figure 38) ------------------- */
export function DirectoryEntries() {
  const data = useData();
  return (
    <Screen title="Directory Entries" sub="Administrator" tabs={false}>
      <div className="stack">
        {data.directory.map((e) => (
          <Link key={e.id} to={`/admin/directory/${e.id}`} className="action-row">
            <span className="grow"><strong>{e.name}</strong><small>{e.kind === 'resource' ? 'Resource office' : 'Colleague'} · {getNode(e.placeId)?.name}</small></span>
            <span className="link">Edit</span>
          </Link>
        ))}
      </div>
    </Screen>
  );
}

export function EditEntry() {
  const { id } = useParams();
  const data = useData();
  const nav = useNavigate();
  const e = data.directory.find((x) => x.id === id);
  const [name, setName] = useState(e?.name ?? '');
  const [placeId, setPlaceId] = useState(e?.placeId ?? '');
  const [msg, setMsg] = useState(null);
  if (!e) return <Screen title="Not found" tabs={false}><Empty>Entry not found.</Empty></Screen>;
  const save = (ev) => {
    ev.preventDefault();
    const r = updateDirectoryEntry(e.id, { name, placeId });
    setMsg(r.ok ? { kind: 'success', text: 'Saved. The directory now shows the new location.' } : { kind: 'error', text: r.error });
  };
  return (
    <Screen title="Update Directory Entry" sub="Administrator" tabs={false}>
      <form className="stack" onSubmit={save} noValidate>
        <Field label="Office name"><input value={name} onChange={(ev) => { setName(ev.target.value); setMsg(null); }} /></Field>
        <Field label="Location (required)">
          <select value={placeId} onChange={(ev) => { setPlaceId(ev.target.value); setMsg(null); }}>
            <option value="">Select a location…</option>
            {places.filter((p) => p.kind !== 'entrance').map((p) => <option key={p.id} value={p.id}>{p.name} · Block {p.block}, F{p.floor}</option>)}
          </select>
        </Field>
        <Button type="submit">Save Changes</Button>
        {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
        <Button variant="secondary" onClick={() => nav('/admin/directory')}>Back to Directory Entries</Button>
      </form>
    </Screen>
  );
}
