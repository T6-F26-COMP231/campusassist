import { describe, it, expect } from 'vitest';
import { findRoute, planRoute, describeRoute, guessFeature } from './graph.js';

const hasStairs = (r) => r.legs.some((l) => l.edge.type === 'stairs');

describe('route engine (matches acceptance tests in the report)', () => {
  it('Story 6: Bookstore to Student HUB lists ordered steps ending at the destination, via the bridge', () => {
    const r = findRoute('a-bookstore', 'b-hub');
    const steps = describeRoute(r);
    expect(steps[0].text).toMatch(/Start at Campus Bookstore/);
    expect(steps.at(-1).text).toMatch(/Arrive at Student HUB/);
    expect(steps.some((s) => /bridge/i.test(s.text))).toBe(true);
  });

  it('Story 7: a step-free route contains no stairs', () => {
    const r = findRoute('a-bookstore', 'a-a318', { stepFree: true });
    expect(r).not.toBeNull();
    expect(hasStairs(r)).toBe(false);
    expect(hasStairs(findRoute('a-bookstore', 'a-a318'))).toBe(true); // standard route prefers short stairs
  });

  it('Story 7: no step-free route when the only elevator is blocked', () => {
    expect(findRoute('a-bookstore', 'a-a318', { stepFree: true, blocked: ['elev-a'] })).toBeNull();
    expect(findRoute('a-bookstore', 'a-a318', { blocked: ['elev-a'] })).not.toBeNull(); // stairs still work
  });

  it('Story 25: approving a barrier reroutes step-free users around it', () => {
    const before = planRoute('a-bookstore', 'b-hub', { stepFree: true });
    const after = planRoute('a-bookstore', 'b-hub', { stepFree: true, blocked: ['elev-a'] });
    expect(before.route.legs.some((l) => l.edge.feature === 'elev-a')).toBe(true);
    expect(after.route).not.toBeNull();
    expect(after.route.legs.some((l) => l.edge.feature === 'elev-a')).toBe(false);
    expect(after.rerouted).toBe(true);
  });

  it('pending barriers change nothing (blocked list empty)', () => {
    expect(planRoute('a-bookstore', 'b-hub', { stepFree: true }).rerouted).toBe(false);
  });

  it('routes compute well inside the 3 second target', () => {
    const t = performance.now();
    for (let i = 0; i < 200; i++) findRoute('c-c214', 'a-a318', { stepFree: true });
    expect((performance.now() - t) / 200).toBeLessThan(50);
  });

  it('guesses the affected feature for admins', () => {
    expect(guessFeature('Broken Elevator', 'Block A, Elevator 2 near Cafeteria')).toBe('elev-a');
    expect(guessFeature('Blocked Entrance', 'Block A Main Entrance')).toBe('door-a-main');
    expect(guessFeature('Other', 'somewhere vague')).toBeNull();
  });
});
