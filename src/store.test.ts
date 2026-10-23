import { describe, expect, it } from 'vitest';
import { defaultState } from './demo-data';
import { parseSavedState } from './store';

describe('local demo persistence', () => {
  it('returns demo defaults when no saved state exists', () => {
    expect(parseSavedState(null)).toEqual(defaultState());
  });
  it('recovers safely from malformed JSON', () => {
    expect(parseSavedState('{oops')).toEqual(defaultState());
  });
  it('recovers safely from an unexpected JSON shape', () => {
    expect(parseSavedState('42')).toEqual(defaultState());
  });
  it('keeps only recognized incident states', () => {
    const data = { incidents: [{ id: 'INC-1042', state: 'resolved' }, { id: 'INC-1041', state: 'elevated' }], activities: [] };
    const state = parseSavedState(JSON.stringify(data));
    expect(state.incidents[0].state).toBe('resolved');
    expect(state.incidents[1].state).toBe('acknowledged');
  });
  it('ignores unknown incident identifiers', () => {
    const state = parseSavedState(JSON.stringify({ incidents: [{ id: 'INVALID', state: 'resolved' }], activities: [] }));
    expect(state.incidents).toEqual(defaultState().incidents);
  });
  it('drops malformed activity objects', () => {
    const state = parseSavedState(JSON.stringify({ incidents: [], activities: [{ id: 'x', action: 'Test', description: 'Test activity', timestamp: 'now', type: 'success' }, { id: 123 }] }));
    expect(state.activities).toHaveLength(1);
  });
});
