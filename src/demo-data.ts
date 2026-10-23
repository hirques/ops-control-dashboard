import type { Activity, DemoState, Incident, Service, TimeRange } from './domain';

export const services: Service[] = [
  { id: 'edge', name: 'Edge Gateway', description: 'Ingress & traffic routing', category: 'Network', region: 'us-east-1', latencyMs: 384, uptime: 98.72, cpu: 81, memory: 64 },
  { id: 'auth', name: 'Identity Service', description: 'Authentication and sessions', category: 'Application', region: 'us-east-1', latencyMs: 212, uptime: 99.12, cpu: 72, memory: 61 },
  { id: 'api', name: 'Core API', description: 'Primary REST application', category: 'Application', region: 'us-east-1', latencyMs: 84, uptime: 99.98, cpu: 45, memory: 53 },
  { id: 'db', name: 'PostgreSQL Primary', description: 'Main transactional database', category: 'Database', region: 'us-east-1', latencyMs: 12, uptime: 99.99, cpu: 36, memory: 71 },
  { id: 'cache', name: 'Redis Cache', description: 'Distributed cache layer', category: 'Database', region: 'us-east-1', latencyMs: 4, uptime: 99.99, cpu: 26, memory: 48 },
  { id: 'worker', name: 'Task Worker', description: 'Background job processing', category: 'Compute', region: 'eu-west-1', latencyMs: 56, uptime: 99.93, cpu: 31, memory: 39 },
  { id: 'queue', name: 'Message Queue', description: 'Async event delivery', category: 'Application', region: 'eu-west-1', latencyMs: 32, uptime: 99.97, cpu: 42, memory: 56 },
  { id: 'backup', name: 'Backup Service', description: 'Snapshots and recovery', category: 'Compute', region: 'sa-east-1', latencyMs: 93, uptime: 99.89, cpu: 18, memory: 34 },
  { id: 'cdn', name: 'Asset CDN', description: 'Static assets and edge cache', category: 'Network', region: 'global', latencyMs: 21, uptime: 99.99, cpu: 14, memory: 22 },
  { id: 'monitor', name: 'Metrics Collector', description: 'Metrics aggregation pipeline', category: 'Compute', region: 'sa-east-1', latencyMs: 64, uptime: 99.96, cpu: 40, memory: 45 },
];

export const initialIncidents: Incident[] = [
  { id: 'INC-1042', serviceId: 'edge', title: 'Elevated gateway error rate', description: 'Intermittent 5xx responses affecting traffic routing.', severity: 'critical', state: 'open', date: 'Oct 23 · 09:42' },
  { id: 'INC-1041', serviceId: 'auth', title: 'Authentication latency spike', description: 'Increased response times for session validation.', severity: 'high', state: 'acknowledged', date: 'Oct 23 · 08:18' },
  { id: 'INC-1038', serviceId: 'db', title: 'Slow query threshold exceeded', description: 'Transient increase in average query duration.', severity: 'medium', state: 'resolved', date: 'Oct 22 · 16:05' },
  { id: 'INC-1036', serviceId: 'backup', title: 'Snapshot job delayed', description: 'Delayed backup execution due to worker saturation.', severity: 'medium', state: 'resolved', date: 'Oct 21 · 21:36' },
];

export const initialActivities: Activity[] = [
  { id: 'a1', action: 'New critical incident', description: 'INC-1042 · Elevated gateway error rate', timestamp: 'Oct 23 · 09:42', type: 'alert' },
  { id: 'a2', action: 'Incident acknowledged', description: 'INC-1041 · Authentication latency spike', timestamp: 'Oct 23 · 08:23', type: 'info' },
  { id: 'a3', action: 'Incident created', description: 'INC-1041 · Authentication latency spike', timestamp: 'Oct 23 · 08:18', type: 'alert' },
  { id: 'a4', action: 'Incident resolved', description: 'INC-1038 · Slow query threshold exceeded', timestamp: 'Oct 22 · 17:12', type: 'success' },
  { id: 'a5', action: 'Snapshot completed', description: 'Backup service · Scheduled snapshot', timestamp: 'Oct 22 · 02:00', type: 'success' },
];

export function defaultState(): DemoState {
  return { incidents: initialIncidents.map((i) => ({ ...i })), activities: initialActivities.map((a) => ({ ...a })) };
}

const timelineData: Record<TimeRange, { labels: string[]; cpu: number[]; memory: number[]; requests: number[] }> = {
  '24h': {
    labels: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'],
    cpu: [33,30,28,27,41,46,42,50,55,47,64,57], memory: [41,43,42,44,47,51,52,55,53,58,62,60], requests: [28,21,19,24,49,59,65,60,76,68,79,72],
  },
  '7d': {
    labels: ['Fri','Sat','Sun','Mon','Tue','Wed','Thu'],
    cpu: [38,35,31,49,41,52,57], memory: [42,46,47,50,53,56,60], requests: [51,38,35,63,58,71,72],
  },
  '30d': {
    labels: ['Sep 24','Sep 29','Oct 04','Oct 09','Oct 14','Oct 19','Oct 23'],
    cpu: [29,34,41,39,45,53,57], memory: [40,44,46,50,54,57,60], requests: [38,49,53,58,61,69,72],
  },
};

export function metricsFor(range: TimeRange) { return timelineData[range]; }
