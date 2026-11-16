import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { planRoute, describeRoute, getNode } from '../lib/graph.js';
import { blockedFeatures, useData } from '../lib/store.js';
import MapPreview from './MapPreview.jsx';
import { Button, Card, Icon, Notice, Badge, fmtTime } from './ui.jsx';

/**
 * Turn-by-turn directions. Used by Campus Users, Visitors, and Helpers
 * so that everyone gets the same step format.
 */
export default function RoutePanel({ from, to, stepFree, onStepFree }) {
  const data = useData();
  const blocked = blockedFeatures(data);
  const { route, rerouted, avoided } = useMemo(
    () => (from && to ? planRoute(from, to, { stepFree, blocked }) : {}),
    [from, to, stepFree, blocked.join(',')], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const steps = useMemo(() => describeRoute(route), [route]);
  const [guided, setGuided] = useState(false);
  const [i, setI] = useState(0);
  const [refreshed, setRefreshed] = useState(null);

  if (!from || !to) return <Notice>Choose a starting point and a destination to see directions.</Notice>;
  if (from === to) return <Notice kind="success">You are already at {getNode(to).name}.</Notice>;

  if (!route) {
    return (
      <div className="stack">
        <Notice kind="error">
          {stepFree
            ? <>No step-free route is available right now to <strong>{getNode(to).name}</strong>. A verified barrier may be blocking the elevator or ramp.</>
            : <>No route is available right now to <strong>{getNode(to).name}</strong>.</>}
        </Notice>
        <MapPreview you={from} pins={[to]} blocked={blocked} />
        <div className="row gap wrap">
          {stepFree && <Button variant="secondary" onClick={() => onStepFree?.(false)}>Show the standard route</Button>}
          <Link className="btn btn-primary" to="/help/new"><Icon name="person" size={18} />Request in-person help</Link>
        </div>
      </div>
    );
  }

  const stairsOnRoute = steps.some((s) => s.stairs);
  const step = steps[i];
  const done = i === steps.length - 1;

  return (
    <div className="stack">
      {onStepFree && (
        <label className="check-row">
          <input type="checkbox" checked={stepFree} onChange={(e) => { onStepFree(e.target.checked); setGuided(false); setI(0); }} />
          <span><strong>Step-free route</strong><small>Uses elevators and ramps, avoids stairs and verified barriers</small></span>
        </label>
      )}
      <div className="row gap wrap">
        <Badge tone="lime"><Icon name="clock" size={14} /> ≈ {route.minutes} min</Badge>
        <Badge>{route.dist} m</Badge>
        {stepFree && <Badge tone="ink">Step-free</Badge>}
        {!stepFree && stairsOnRoute && <Badge>Includes stairs</Badge>}
      </div>
      {rerouted && <Notice kind="warn">Rerouted around a verified barrier: {avoided.join(', ')}.</Notice>}

      <MapPreview route={route} you={from} pins={[to]} blocked={blocked} />

      {guided ? (
        <Card className="guide" aria-live="polite">
          <div className="row between"><span className="muted small">Step {i + 1} of {steps.length}</span><span className="muted small">{refreshed && `Refreshed ${refreshed}`}</span></div>
          <progress max={steps.length - 1} value={i} aria-label="Route progress" />
          <p className="guide-text"><Icon name={step.icon} size={26} /> {step.text}</p>
          <div className="row gap">
            <Button variant="secondary" disabled={i === 0} onClick={() => setI(i - 1)}>Previous</Button>
            {done ? <Button onClick={() => { setGuided(false); setI(0); }}>Finish</Button> : <Button onClick={() => setI(i + 1)}>Next step</Button>}
            <Button variant="ghost" icon="swap" onClick={() => setRefreshed(fmtTime(new Date().toISOString()))}>Refresh route</Button>
          </div>
          <p className="muted small">Your progress is not tracked automatically (no indoor positioning). Tap Next step as you go, or refresh the route if you get off course.</p>
        </Card>
      ) : (
        <>
          <ol className="steps">
            {steps.map((s, k) => (
              <li key={k} className={s.stairs ? 'stairs' : ''}>
                <span className="step-ico"><Icon name={s.icon} size={16} /></span>
                <span>{s.text}</span>
              </li>
            ))}
          </ol>
          <Button icon="arrow" onClick={() => { setGuided(true); setI(0); }}>Start Navigation</Button>
        </>
      )}
    </div>
  );
}
