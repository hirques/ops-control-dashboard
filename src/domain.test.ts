import { describe, expect, it } from 'vitest';
import { activeIncidents, availability, changeIncidentState, filterServices, serviceStatus, statusCounts } from './domain';
import { defaultState, services, metricsFor } from './demo-data';

const initial = () => defaultState();

describe('service health', () => {
  it('reports critical status when an unresolved critical incident exists', () => {
    expect(serviceStatus(services[0], initial().incidents)).toBe('down');
  });
  it('reports degraded status for an unresolved high severity incident', () => {
    expect(serviceStatus(services[1], initial().incidents)).toBe('degraded');
  });
  it('reports healthy status when no unresolved incident exists', () => {
    expect(serviceStatus(services[2], initial().incidents)).toBe('healthy');
  });
  it('counts all ten services exactly once', () => {
    const counts = statusCounts(services, initial().incidents);
    expect(counts).toEqual({ healthy: 8, degraded: 1, down: 1 });
  });
  it('calculates displayed snapshot availability', () => {
    expect(availability(services, initial().incidents)).toBe(90);
  });
  it('handles an empty inventory', () => {
    expect(availability([], [])).toBe(100);
  });
  it('excludes resolved incidents from active list', () => {
    const incidents = activeIncidents(initial().incidents);
    expect(incidents.length).toBe(2);
    expect(incidents.every((i) => i.state !== 'resolved')).toBe(true);
    expect(incidents[0].severity).toBe('critical');
  });
});

describe('search and filters', () => {
  it('matches a service by name case-insensitively', () => {
    expect(filterServices(services, initial().incidents, 'postgresql', 'all').map((s) => s.id)).toEqual(['db']);
  });
  it('matches a service by region', () => {
    expect(filterServices(services, initial().incidents, 'eu-west-1', 'all')).toHaveLength(2);
  });
  it('filters by computed critical state', () => {
    expect(filterServices(services, initial().incidents, '', 'down').map((s) => s.id)).toEqual(['edge']);
  });
  it('combines text search with status filter', () => {
    expect(filterServices(services, initial().incidents, 'AUTH', 'degraded').map((s) => s.id)).toEqual(['auth']);
  });
});

describe('incident actions', () => {
  it('acknowledges an open incident and records an action', () => {
    const updated = changeIncidentState(initial(), 'INC-1042', 'acknowledged', '2026-10-23T15:10:00Z');
    expect(updated.incidents[0].state).toBe('acknowledged');
    expect(updated.activities[0].action).toBe('Incident acknowledged');
    expect(updated.activities[0].timestamp).toBe('2026-10-23T15:10:00Z');
  });
  it('resolves a critical incident and restores the associated service', () => {
    const updated = changeIncidentState(initial(), 'INC-1042', 'resolved', '2026-10-23T15:10:00Z');
    expect(updated.incidents[0].state).toBe('resolved');
    expect(serviceStatus(services[0], updated.incidents)).toBe('healthy');
    expect(availability(services, updated.incidents)).toBe(100);
  });
  it('ignores invalid incident IDs', () => {
    const original = initial();
    expect(changeIncidentState(original, 'MISSING', 'resolved', 'now')).toBe(original);
  });
  it('does not reopen a resolved incident via acknowledge action', () => {
    const original = initial();
    expect(changeIncidentState(original, 'INC-1038', 'acknowledged', 'now')).toBe(original);
  });
  it('does not duplicate an already applied state transition', () => {
    const original = initial();
    expect(changeIncidentState(original, 'INC-1041', 'acknowledged', 'now')).toBe(original);
  });
  it('keeps the input state immutable', () => {
    const original = initial();
    changeIncidentState(original, 'INC-1042', 'resolved', 'now');
    expect(original.incidents[0].state).toBe('open');
    expect(original.activities).toHaveLength(5);
  });
});

describe('demo metric ranges', () => {
  it.each(['24h', '7d', '30d'] as const)('provides consistent series for %s', (range) => {
    const { labels, cpu, memory, requests } = metricsFor(range);
    expect(labels.length).toBeGreaterThan(0);
    expect(cpu).toHaveLength(labels.length);
    expect(memory).toHaveLength(labels.length);
    expect(requests).toHaveLength(labels.length);
  });
});
