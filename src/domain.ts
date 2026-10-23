export type ServiceStatus = 'healthy' | 'degraded' | 'down';
export type Severity = 'critical' | 'high' | 'medium';
export type IncidentState = 'open' | 'acknowledged' | 'resolved';
export type TimeRange = '24h' | '7d' | '30d';
export type View = 'overview' | 'services' | 'incidents' | 'activity' | 'settings';

export interface Service {
  id: string;
  name: string;
  description: string;
  category: 'Compute' | 'Database' | 'Network' | 'Application';
  region: string;
  latencyMs: number;
  uptime: number;
  cpu: number;
  memory: number;
}

export interface Incident {
  id: string;
  serviceId: string;
  title: string;
  description: string;
  severity: Severity;
  state: IncidentState;
  date: string;
}

export interface Activity {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  type: 'info' | 'alert' | 'success';
}

export interface DemoState { incidents: Incident[]; activities: Activity[] }

const severityRank: Record<Severity, number> = { medium: 1, high: 2, critical: 3 };

export function serviceStatus(service: Service, incidents: Incident[]): ServiceStatus {
  const open = incidents.filter((incident) => incident.serviceId === service.id && incident.state !== 'resolved');
  if (open.some((incident) => incident.severity === 'critical')) return 'down';
  return open.length ? 'degraded' : 'healthy';
}

export function statusCounts(services: Service[], incidents: Incident[]) {
  return services.reduce((acc, service) => {
    acc[serviceStatus(service, incidents)]++;
    return acc;
  }, { healthy: 0, degraded: 0, down: 0 } as Record<ServiceStatus, number>);
}

export function activeIncidents(incidents: Incident[]) {
  return incidents.filter((incident) => incident.state !== 'resolved')
    .sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);
}

export function filterServices(services: Service[], incidents: Incident[], query: string, status: 'all' | ServiceStatus) {
  const normalized = query.trim().toLowerCase();
  return services.filter((service) => {
    const matchesText = `${service.name} ${service.description} ${service.category} ${service.region}`.toLowerCase().includes(normalized);
    return matchesText && (status === 'all' || serviceStatus(service, incidents) === status);
  });
}

export function changeIncidentState(state: DemoState, incidentId: string, nextState: 'acknowledged' | 'resolved', timestamp: string): DemoState {
  const target = state.incidents.find((incident) => incident.id === incidentId);
  if (!target || target.state === 'resolved' || target.state === nextState) return state;
  const changed = state.incidents.map((incident) => incident.id === incidentId ? { ...incident, state: nextState } : incident);
  const activity: Activity = {
    id: `${incidentId}-${nextState}-${timestamp}`,
    action: nextState === 'resolved' ? 'Incident resolved' : 'Incident acknowledged',
    description: `${target.id} · ${target.title}`,
    timestamp,
    type: nextState === 'resolved' ? 'success' : 'info',
  };
  return { incidents: changed, activities: [activity, ...state.activities] };
}

export function availability(services: Service[], incidents: Incident[]) {
  if (services.length === 0) return 100;
  return services.reduce((sum, service) => sum + (serviceStatus(service, incidents) === 'down' ? 0 : 1), 0) / services.length * 100;
}
