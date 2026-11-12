// Tiny persistent store (no backend in this prototype).
//  - Shared data lives in localStorage, so a second browser tab behaves like a second device:
//    approve a barrier in one tab and routes change in the other, accept a help request, chat, etc.
//  - Per-tab session (who is signed in, chosen start point, current help request) lives in sessionStorage.
import { useSyncExternalStore } from 'react';
import { DEMO_ACCOUNTS, DIRECTORY_SEED } from './data.js';
import { guessFeature } from './graph.js';

const KEY = 'campusassist.data.v1';
const SKEY = 'campusassist.session.v1';
const clone = (o) => JSON.parse(JSON.stringify(o));
const now = () => new Date().toISOString();

function seed() {
  return {
    users: clone(DEMO_ACCOUNTS),
    requests: [],
    barriers: [
      { id: 'R-001', type: 'Broken Elevator', location: 'Block A, Elevator 2 near Cafeteria', description: 'Out of service, maintenance sign posted.', photo: null, reporter: 'student@campus.test', status: 'pending', feature: null, reason: '', createdAt: now(), decidedAt: null },
      { id: 'R-002', type: 'Blocked Entrance', location: 'Block A Main Entrance', description: 'Delivery pallets blocking the automatic door.', photo: null, reporter: 'staff@campus.test', status: 'pending', feature: null, reason: '', createdAt: now(), decidedAt: null },
    ],
    directory: clone(DIRECTORY_SEED),
    schedules: [],
    counters: { req: 1, bar: 3 },
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* storage blocked: fall through to seed */ }
  return seed();
}

let state = load();
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } };

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) { state = load(); emit(); }
  });
}

export const getData = () => state;
export const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
export const useData = () => useSyncExternalStore(subscribe, getData);

/** Run a mutation on the freshest copy of the data. Return {ok:false,error} to abort without saving. */
function mutate(fn) {
  const draft = clone(load());
  const out = fn(draft) ?? { ok: true };
  if (out.ok === false) return out;
  state = draft;
  save();
  emit();
  return out;
}

export function resetDemo() {
  state = seed();
  save();
  try { sessionStorage.removeItem(SKEY); } catch { /* ignore */ }
  session = {};
  emit(); emitS();
}

/* ------------------------------ session (per tab) ------------------------------ */
function loadS() {
  try { return JSON.parse(sessionStorage.getItem(SKEY)) ?? {}; } catch { return {}; }
}
let session = loadS();
const sListeners = new Set();
const emitS = () => sListeners.forEach((l) => l());
export const getSession = () => session;
export const useSession = () => useSyncExternalStore((l) => { sListeners.add(l); return () => sListeners.delete(l); }, getSession);
export function setSession(patch) {
  session = { ...session, ...patch };
  try { sessionStorage.setItem(SKEY, JSON.stringify(session)); } catch { /* ignore */ }
  emitS();
}
export function signOut() {
  session = {};
  try { sessionStorage.removeItem(SKEY); } catch { /* ignore */ }
  emitS();
}

/* ---------------------------------- auth ---------------------------------- */
export function signIn(email, password, role) {
  const u = getData().users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u || u.password !== password) return { ok: false, error: 'Sign-in refused: incorrect email or password.' };
  if (!u.active) return { ok: false, error: 'Sign-in refused: this account has been deactivated.' };
  if (u.role !== role) return { ok: false, error: `Sign-in refused: this is not a ${ROLE_LABEL[role].toLowerCase()} account.` };
  setSession({ role: u.role, email: u.email, name: u.name });
  return { ok: true };
}
export const ROLE_LABEL = { user: 'Campus User', staff: 'Faculty Staff', helper: 'Authorized Helper', admin: 'Administrator', visitor: 'Visitor' };
export const homePath = (role) => ({ user: '/home', visitor: '/visitor', staff: '/staff', helper: '/helper', admin: '/admin' }[role] ?? '/');

/* -------------------------------- help requests -------------------------------- */
export const ACTIVE = ['accepted', 'on_the_way', 'arrived'];
export const STATUS_LABEL = { pending: 'Pending', accepted: 'Accepted', on_the_way: 'On the way', arrived: 'Arrived', completed: 'Completed', cancelled: 'Cancelled' };

export function submitRequest({ locationId, destination, type, ownerEmail, ownerName, scheduledFor = null }) {
  return mutate((d) => {
    const id = `REQ-${String(d.counters.req++).padStart(3, '0')}`;
    d.requests.push({
      id, ownerEmail: ownerEmail ?? null, ownerName: ownerName ?? 'Guest', locationId, destination: destination ?? '', type,
      status: 'pending', helperEmail: null, helperName: null, createdAt: now(), acceptedAt: null, scheduledFor,
      messages: [], cancelledAfterAccept: false, ackedByHelper: false,
    });
    return { ok: true, id };
  });
}

export function cancelRequest(id) {
  return mutate((d) => {
    const r = d.requests.find((x) => x.id === id);
    if (!r || !['pending', ...ACTIVE].includes(r.status)) return { ok: false, error: 'This request can no longer be cancelled.' };
    r.cancelledAfterAccept = ACTIVE.includes(r.status);
    r.status = 'cancelled';
  });
}

export function acceptRequest(id, helperEmail) {
  return mutate((d) => {
    const h = d.users.find((u) => u.email === helperEmail && u.role === 'helper' && u.active);
    if (!h) return { ok: false, error: 'Only active authorized helpers can accept requests.' };
    const r = d.requests.find((x) => x.id === id);
    if (!r) return { ok: false, error: 'Request not found.' };
    if (r.status === 'cancelled') return { ok: false, error: 'This request was cancelled.' };
    if (r.status !== 'pending') return { ok: false, error: 'Another helper has already accepted this request.' };
    if (d.requests.some((x) => x.helperEmail === helperEmail && ACTIVE.includes(x.status))) return { ok: false, error: 'Finish your active request before accepting another one.' };
    r.status = 'accepted'; r.helperEmail = h.email; r.helperName = h.name; r.acceptedAt = now();
  });
}

export function setRequestStatus(id, helperEmail, status) {
  return mutate((d) => {
    const r = d.requests.find((x) => x.id === id && x.helperEmail === helperEmail);
    if (!r || !ACTIVE.includes(r.status)) return { ok: false, error: 'This request is not active.' };
    r.status = status;
  });
}

export function completeRequest(id, helperEmail) {
  return mutate((d) => {
    const r = d.requests.find((x) => x.id === id && x.helperEmail === helperEmail);
    if (!r || !ACTIVE.includes(r.status)) return { ok: false, error: 'This request is not active.' };
    r.status = 'completed';
  });
}

export function ackCancelled(id) {
  return mutate((d) => { const r = d.requests.find((x) => x.id === id); if (r) r.ackedByHelper = true; });
}

export function sendMessage(id, from, email, text) {
  return mutate((d) => {
    const r = d.requests.find((x) => x.id === id);
    if (!r) return { ok: false, error: 'Request not found.' };
    if (!text.trim()) return { ok: false, error: 'Type a message first.' };
    if (r.status === 'pending') return { ok: false, error: 'The message cannot be sent: no helper has been assigned yet.' };
    if (!ACTIVE.includes(r.status)) return { ok: false, error: 'The message cannot be sent: this request is closed.' };
    if (from === 'user' && (!r.ownerEmail || r.ownerEmail !== email)) return { ok: false, error: 'Sign in with the account that made this request to send messages.' };
    if (from === 'helper' && r.helperEmail !== email) return { ok: false, error: 'Only the assigned helper can message the user.' };
    r.messages.push({ from, text: text.trim(), at: now() });
  });
}

/* ------------------------------------ barriers ------------------------------------ */
export function submitBarrier({ type, location, description, photo, reporter }) {
  return mutate((d) => {
    const id = `R-${String(d.counters.bar++).padStart(3, '0')}`;
    d.barriers.push({ id, type, location: location.trim(), description: description.trim(), photo: photo ?? null, reporter, status: 'pending', feature: null, reason: '', createdAt: now(), decidedAt: null });
    return { ok: true, id };
  });
}
export const suggestedFeature = (b) => b.feature ?? guessFeature(b.type, b.location);

export function approveBarrier(id, feature) {
  return mutate((d) => {
    const b = d.barriers.find((x) => x.id === id);
    if (!b || b.status !== 'pending') return { ok: false, error: 'Only pending reports can be approved.' };
    b.status = 'approved'; b.feature = feature || null; b.decidedAt = now();
  });
}
export function rejectBarrier(id, reason) {
  return mutate((d) => {
    const b = d.barriers.find((x) => x.id === id);
    if (!b || b.status !== 'pending') return { ok: false, error: 'Only pending reports can be rejected.' };
    b.status = 'rejected'; b.reason = reason ?? ''; b.decidedAt = now();
  });
}
export function resolveBarrier(id) {
  return mutate((d) => {
    const b = d.barriers.find((x) => x.id === id);
    if (!b || b.status !== 'approved') return { ok: false, error: 'This barrier cannot be marked resolved because it was never approved.' };
    b.status = 'resolved'; b.decidedAt = now();
  });
}
/** Features currently blocked by approved barriers. */
export const blockedFeatures = (data) => [...new Set(data.barriers.filter((b) => b.status === 'approved' && b.feature).map((b) => b.feature))];

/* ------------------------------- helpers & directory ------------------------------- */
export const TEMP_PASSWORD = 'welcome123';
export function addHelper(name, email) {
  return mutate((d) => {
    const e = email.trim().toLowerCase();
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(e)) return { ok: false, error: 'Enter a full name and a valid email address.' };
    if (d.users.some((u) => u.email.toLowerCase() === e)) return { ok: false, error: 'The account was refused: that email already has an account.' };
    d.users.push({ email: e, password: TEMP_PASSWORD, role: 'helper', name: name.trim(), active: true });
  });
}
export function setHelperActive(email, active) {
  return mutate((d) => {
    const u = d.users.find((x) => x.email === email && x.role === 'helper');
    if (!u) return { ok: false, error: 'Helper not found.' };
    u.active = active;
  });
}
export function updateDirectoryEntry(id, { name, placeId }) {
  return mutate((d) => {
    const e = d.directory.find((x) => x.id === id);
    if (!e) return { ok: false, error: 'Entry not found.' };
    if (!placeId) return { ok: false, error: 'An entry without a location cannot be saved.' };
    if (!name.trim()) return { ok: false, error: 'An entry needs a name.' };
    e.name = name.trim(); e.placeId = placeId;
  });
}

/* -------------------------------- scheduled arrival plans -------------------------------- */
export function addSchedule(plan) {
  return mutate((d) => { d.schedules.push({ id: `S-${Date.now()}`, ...plan }); });
}
export function removeSchedule(id) {
  return mutate((d) => { d.schedules = d.schedules.filter((s) => s.id !== id); });
}
