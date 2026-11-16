import { useState } from 'react';
import { places, getNode } from '../lib/graph.js';
import { QR_CODES } from '../lib/data.js';
import { Button, Dialog, Field, Notice, Icon } from './ui.jsx';

const grouped = ['A', 'B', 'C'].map((b) => [b, places.filter((p) => p.block === b)]);

/** Select-from-list location chooser with a simulated QR scan (no camera needed for the prototype). */
export default function LocationPicker({ label = 'Your location', value, onChange, error, allowQr = true, hint }) {
  const [qr, setQr] = useState(false);
  return (
    <div className="picker">
      <Field label={label} error={error} hint={hint}>
        <select value={value ?? ''} onChange={(e) => onChange(e.target.value || null)} aria-invalid={!!error}>
          <option value="">Choose on the map list…</option>
          {grouped.map(([b, list]) => (
            <optgroup key={b} label={`Block ${b}`}>
              {list.map((p) => <option key={p.id} value={p.id}>{p.name} · F{p.floor}</option>)}
            </optgroup>
          ))}
        </select>
      </Field>
      {allowQr && <Button variant="secondary" icon="qr" onClick={() => setQr(true)}>Scan campus QR code</Button>}
      {qr && <QrDialog onClose={() => setQr(false)} onScan={(id) => { onChange(id); setQr(false); }} />}
    </div>
  );
}

export function QrDialog({ onClose, onScan }) {
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const submit = (c) => {
    const id = QR_CODES[c.trim().toUpperCase()];
    if (!id) return setErr('That QR code is not a CampusAssist code. Close this and choose a start manually.');
    onScan(id);
  };
  return (
    <Dialog title="Scan campus QR code" onClose={onClose}>
      <p className="muted small">Prototype scanner: pick a code posted on campus, or type one. Real cameras are not used.</p>
      <div className="qr-grid">
        {Object.entries(QR_CODES).map(([c, id]) => (
          <button key={c} className="chip" onClick={() => submit(c)}>
            <Icon name="qr" size={16} />
            <span><strong>{getNode(id).name}</strong><small>{c}</small></span>
          </button>
        ))}
      </div>
      <Field label="Or enter a code">
        <input value={code} onChange={(e) => { setCode(e.target.value); setErr(''); }} placeholder="e.g. CA-HUB-01" />
      </Field>
      <div className="row gap">
        <Button onClick={() => submit(code)}>Use code</Button>
        <Button variant="secondary" onClick={() => submit('INVALID-QR')}>Scan an invalid code</Button>
      </div>
      {err && <Notice kind="error" action={<Button variant="ghost" onClick={onClose}>Choose manually</Button>}>{err}</Notice>}
    </Dialog>
  );
}
