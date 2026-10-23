import type { DemoState, IncidentState } from './domain';
import { defaultState, initialIncidents } from './demo-data';

export const STORAGE_KEY = 'ops-control-dashboard-v1';

export function parseSavedState(json: string | null): DemoState {
  if (!json) return defaultState();
  try {
    const data: unknown = JSON.parse(json);
    if (!data || typeof data !== 'object' || !('incidents' in data) || !Array.isArray(data.incidents)) return defaultState();
    const candidate = data as Partial<DemoState>;
    const saved = new Map(candidate.incidents?.filter((i) => i && typeof i.id === 'string').map((i) => [i.id, i.state]));
    const valid: IncidentState[] = ['open', 'acknowledged', 'resolved'];
    const incidents = initialIncidents.map((incident) => {
      const state = saved.get(incident.id);
      return { ...incident, state: state && valid.includes(state) ? state : incident.state };
    });
    const activities = Array.isArray(candidate.activities)
      ? candidate.activities.filter((a) => a && typeof a.id === 'string' && typeof a.action === 'string' && typeof a.description === 'string' && typeof a.timestamp === 'string' && ['info', 'alert', 'success'].includes(a.type)).slice(0, 60)
      : defaultState().activities;
    return { incidents, activities };
  } catch {
    return defaultState();
  }
}

export function loadDemoState(): DemoState {
  if (typeof window === 'undefined') return defaultState();
  try { return parseSavedState(window.localStorage.getItem(STORAGE_KEY)); }
  catch { return defaultState(); }
}

export function saveDemoState(value: DemoState) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch { /* demo works without storage */ }
}

export function clearDemoState() {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore private mode failures */ }
}
