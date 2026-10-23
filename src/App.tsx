import { useEffect, useMemo, useState } from 'react';
import { Icon } from './components/Icons';
import { TrendChart } from './components/TrendChart';
import { services, defaultState } from './demo-data';
import { activeIncidents, availability, changeIncidentState, filterServices, serviceStatus, statusCounts } from './domain';
import type { DemoState, Incident, IncidentState, Service, ServiceStatus, TimeRange, View } from './domain';
import { clearDemoState, loadDemoState, saveDemoState } from './store';

const navigation: { label: string; id: View; icon: 'grid' | 'servers' | 'alert' | 'activity' | 'settings' }[] = [
  { label: 'Overview', id: 'overview', icon: 'grid' },
  { label: 'Services', id: 'services', icon: 'servers' },
  { label: 'Incidents', id: 'incidents', icon: 'alert' },
  { label: 'Activity log', id: 'activity', icon: 'activity' },
  { label: 'Settings', id: 'settings', icon: 'settings' },
];
const pageTitles: Record<View, { title: string; description: string }> = {
  overview: { title: 'Infrastructure overview', description: 'A clear view of what needs attention.' },
  services: { title: 'Service inventory', description: 'Operational health across the demo environment.' },
  incidents: { title: 'Incident management', description: 'Triage, acknowledge, and resolve sample incidents.' },
  activity: { title: 'Activity log', description: 'Review events and actions recorded in this demo.' },
  settings: { title: 'Demo settings', description: 'How this interactive portfolio demo works.' },
};
const statusLabels: Record<ServiceStatus, string> = { healthy: 'Operational', degraded: 'Degraded', down: 'Critical' };
const stateLabels: Record<IncidentState, string> = { open: 'Open', acknowledged: 'Acknowledged', resolved: 'Resolved' };

function StatusBadge({ status }: { status: ServiceStatus }) {
  return <span className={`badge-status ${status}`}><span className="status-indicator" />{statusLabels[status]}</span>;
}
function IncidentBadge({ state }: { state: IncidentState }) {
  return <span className={`badge-status incident-${state}`}><span className="status-indicator" />{stateLabels[state]}</span>;
}
function SeverityBadge({ severity }: { severity: Incident['severity'] }) {
  return <span className={`severity ${severity}`}><span className="severity-mark" />{severity}</span>;
}
function ProgressBar({ value, color }: { value: number; color?: 'warn' | 'critical' }) {
  return <div className="utilization"><div style={{ width: `${Math.min(100, Math.max(0, value))}%` }} className={color ?? ''} /><span>{value}%</span></div>;
}
function StatCard({ label, value, detail, tone, icon }: { label: string; value: string | number; detail: string; tone: 'blue' | 'green' | 'amber' | 'red'; icon: 'servers' | 'shield' | 'alert' | 'activity' }) {
  return <div className="stat-card">
    <div className="stat-card-top"><span>{label}</span><span className={`stat-icon ${tone}`}><Icon name={icon} size={19}/></span></div>
    <div className="stat-value">{value}</div>
    <div className="stat-detail"><span className={`mini-dot ${tone}`}/>{detail}</div>
  </div>;
}
function ServiceTable({ filtered, incidents, compact = false, onViewAll }: { filtered: Service[]; incidents: Incident[]; compact?: boolean; onViewAll?: () => void }) {
  return <div className="table-overflow">
    <table className="services-table">
      <thead><tr><th>Service</th><th>Status</th><th>Region</th><th>Latency</th>{!compact && <><th>CPU</th><th>Memory</th></>}<th>Uptime</th></tr></thead>
      <tbody>{filtered.length ? filtered.map((service) => <tr key={service.id}>
        <td><div className="service-name"><span className="service-symbol"><Icon name={service.category === 'Database' ? 'database' : service.category === 'Network' ? 'globe' : service.category === 'Compute' ? 'cpu' : 'layers'} size={17}/></span><span><strong>{service.name}</strong><small>{service.description}</small></span></div></td>
        <td><StatusBadge status={serviceStatus(service, incidents)}/></td>
        <td><span className="muted-cell">{service.region}</span></td><td className="mono-cell">{service.latencyMs} ms</td>
        {!compact && <><td><ProgressBar value={service.cpu} color={service.cpu >= 80 ? 'critical' : service.cpu >= 65 ? 'warn' : undefined}/></td><td><ProgressBar value={service.memory} color={service.memory >= 80 ? 'critical' : undefined}/></td></>}
        <td className="mono-cell">{service.uptime.toFixed(2)}%</td>
      </tr>) : <tr><td colSpan={compact ? 5 : 7} className="empty-state">No services match these filters.</td></tr>}</tbody>
    </table>
    {compact && onViewAll && <button className="table-footer" onClick={onViewAll} type="button">View all services <Icon name="arrow" size={16}/></button>}
  </div>;
}
function IncidentCard({ incident, onOpen }: { incident: Incident; onOpen: (incident: Incident) => void }) {
  return <button type="button" className="incident-row" onClick={() => onOpen(incident)}>
    <span className={`incident-edge ${incident.severity}`}/>
    <span className="incident-content"><span className="incident-top"><span className="incident-id">{incident.id}</span><SeverityBadge severity={incident.severity}/></span>
      <strong>{incident.title}</strong><small>{incident.date} · {stateLabels[incident.state]}</small></span>
    <Icon name="chevron" size={16} className="incident-chevron"/>
  </button>;
}
function EmptyCard({ text }: { text: string }) {
  return <div className="empty-card"><Icon name="shield" size={27}/><strong>All clear</strong><p>{text}</p></div>;
}

export function App() {
  const [demo, setDemo] = useState<DemoState>(loadDemoState);
  const [view, setView] = useState<View>('overview');
  const [range, setRange] = useState<TimeRange>('24h');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | ServiceStatus>('all');
  const [incidentFilter, setIncidentFilter] = useState<'active' | 'all' | 'resolved'>('active');
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => saveDemoState(demo), [demo]);
  const counts = useMemo(() => statusCounts(services, demo.incidents), [demo.incidents]);
  const unresolved = useMemo(() => activeIncidents(demo.incidents), [demo.incidents]);
  const visibleServices = useMemo(() => filterServices(services, demo.incidents, search, filter), [demo.incidents, search, filter]);
  const incidentSelected = demo.incidents.find((incident) => incident.id === selectedIncident) ?? null;
  const visibleIncidents = demo.incidents.filter((incident) => incidentFilter === 'all' || (incidentFilter === 'resolved' ? incident.state === 'resolved' : incident.state !== 'resolved'));
  const demoAvailability = availability(services, demo.incidents);

  function navigate(next: View) { setView(next); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function setIncident(incident: Incident, state: 'acknowledged' | 'resolved') {
    const timestamp = new Date().toISOString();
    setDemo((previous) => changeIncidentState(previous, incident.id, state, timestamp));
    setToast(`${incident.id} ${state === 'resolved' ? 'resolved' : 'acknowledged'} locally`);
  }
  function reset() { clearDemoState(); setDemo(defaultState()); setSelectedIncident(null); setToast('Demo data restored'); }
  function exportReport() {
    const payload = { generatedAt: new Date().toISOString(), source: 'Illustrative portfolio demo; not connected to real systems', services: services.map(s => ({...s, status: serviceStatus(s, demo.incidents)})), incidents: demo.incidents, activities: demo.activities };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'ops-control-demo-report.json'; anchor.click(); URL.revokeObjectURL(url);
    setToast('Sample report exported');
  }

  return <div className="app-layout">
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <button type="button" className="brand" onClick={() => navigate('overview')} aria-label="Ops Control home">
        <span className="brand-mark"><Icon name="activity" size={21}/></span>
        <span className="brand-text">OPS<span>CONTROL</span><small>INFRASTRUCTURE INTELLIGENCE</small></span>
      </button>
      <div className="sidebar-section-label">WORKSPACE</div>
      <nav className="side-nav" aria-label="Primary navigation">
        {navigation.slice(0, 4).map((item) => <button key={item.id} type="button" onClick={() => navigate(item.id)} className={`nav-link ${view === item.id ? 'active' : ''}`} aria-current={view === item.id ? 'page' : undefined}>
          <Icon name={item.icon} size={18}/><span>{item.label}</span>{item.id === 'incidents' && unresolved.length > 0 && <em>{unresolved.length}</em>}
        </button>)}
      </nav>
      <div className="sidebar-section-label second-label">GENERAL</div>
      <nav className="side-nav" aria-label="General"><button type="button" onClick={() => navigate('settings')} className={`nav-link ${view === 'settings' ? 'active' : ''}`}><Icon name="settings" size={18}/> <span>Settings</span></button></nav>
      <div className="sidebar-spacer"/>
      <div className="environment-card"><div className="environment-title"><span className="pulse-dot"/> DEMO ENVIRONMENT</div><strong>Sandbox workspace</strong><p>Isolated, interactive sample data. No production systems connected.</p><button type="button" onClick={() => navigate('settings')}>About this demo <Icon name="arrow" size={15}/></button></div>
      <div className="sidebar-bottom"><span className="profile-icon">H</span><div><strong>Henrique</strong><small>Portfolio project</small></div><span className="profile-metadata">v1.0</span></div>
    </aside>
    {mobileOpen && <button type="button" className="sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close menu"/>}
    <div className="main-panel">
      <header className="topbar">
        <div className="breadcrumbs"><button type="button" className="mobile-toggle" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Icon name="menu" size={21}/></button><span>Workspace</span><Icon name="chevron" size={14}/><strong>{pageTitles[view].title}</strong></div>
        <div className="topbar-right"><span className="topbar-date"><Icon name="clock" size={14}/> Sample snapshot · Oct 2026</span><span className="demo-pill"><span className="pulse-dot"/> DEMO MODE</span><span className="topbar-avatar">H</span></div>
      </header>
      <main className="content">
        <div className="page-header"><div><div className="eyebrow"><span/> OPERATIONS CENTER <span className="eyebrow-slash">/</span> {view.toUpperCase()}</div><h1>{pageTitles[view].title}</h1><p>{pageTitles[view].description}</p></div>
        <div className="page-actions">{view === 'overview' && <div className="range-selector" role="group" aria-label="Chart time range">{(['24h', '7d', '30d'] as const).map((r) => <button type="button" key={r} className={range === r ? 'selected' : ''} onClick={() => setRange(r)} aria-pressed={range === r}>{r}</button>)}</div>}
        <button className="button-outline" type="button" onClick={exportReport}><Icon name="download" size={17}/> <span>Export JSON</span></button></div></div>

        {view === 'overview' && <>
          <div className="summary-alert"><span className="summary-alert-icon"><Icon name="alert" size={19}/></span><div><strong>{unresolved.length ? `${unresolved.length} incident${unresolved.length > 1 ? 's' : ''} require attention` : 'All demo incidents resolved'}</strong><p>{unresolved.length ? 'Review active events affecting your sample environment.' : 'There are no unresolved incidents in your local demo state.'}</p></div><button type="button" onClick={() => navigate('incidents')}>Review incidents <Icon name="arrow" size={16}/></button></div>
          <div className="stats-grid"><StatCard label="Total services" value={services.length.toString().padStart(2,'0')} detail="Across 4 infrastructure groups" tone="blue" icon="servers"/>
            <StatCard label="Operational" value={counts.healthy.toString().padStart(2,'0')} detail="No active incidents" tone="green" icon="shield"/>
            <StatCard label="Degraded" value={counts.degraded.toString().padStart(2,'0')} detail="Needs investigation" tone="amber" icon="activity"/>
            <StatCard label="Critical" value={counts.down.toString().padStart(2,'0')} detail="Immediate attention" tone="red" icon="alert"/></div>
          <div className="dashboard-main-grid"><section className="panel chart-panel"><TrendChart range={range}/></section>
            <section className="panel availability-panel"><div className="panel-header"><h2>Availability snapshot</h2><span className="panel-icon"><Icon name="more" size={18}/></span></div><p>Services responding in demo state</p>
              <div className="donut-wrap"><div className="donut" style={{ '--percentage': `${demoAvailability}%` } as React.CSSProperties}><div><strong>{demoAvailability.toFixed(0)}<small>%</small></strong><span>Available</span></div></div></div>
              <div className="availability-list"><div><span><i className="mini-dot green"/>Operational</span><strong>{counts.healthy}</strong></div><div><span><i className="mini-dot amber"/>Degraded</span><strong>{counts.degraded}</strong></div><div><span><i className="mini-dot red"/>Critical</span><strong>{counts.down}</strong></div></div>
              <div className="fine-print">Availability here means not in critical state, not a historical SLA.</div>
            </section></div>
          <div className="dashboard-bottom-grid"><section className="panel incidents-panel"><div className="panel-header with-action"><div><h2>Active incidents</h2><p>Prioritized by severity</p></div><button type="button" className="text-link" onClick={() => navigate('incidents')}>View all <Icon name="arrow" size={15}/></button></div>
            {unresolved.length ? unresolved.map((incident) => <IncidentCard key={incident.id} incident={incident} onOpen={(i) => setSelectedIncident(i.id)}/>) : <EmptyCard text="Try resetting the sandbox to replay the incident workflow."/>}
            </section><section className="panel services-panel"><div className="panel-header with-action"><div><h2>Service health</h2><p>Top monitored services</p></div><button type="button" className="text-link" onClick={() => navigate('services')}>Explore services <Icon name="arrow" size={15}/></button></div>
              <div className="quick-services">{[services[0], services[1], services[3], services[4]].map((service) => <div className="quick-service" key={service.id}><div className="quick-service-logo"><Icon name={service.category === 'Database' ? 'database' : service.category === 'Network' ? 'globe' : 'layers'} size={18}/></div><span><strong>{service.name}</strong><small>{service.region}</small></span><StatusBadge status={serviceStatus(service, demo.incidents)}/></div>)}</div>
            </section></div>
        </>}

        {view === 'services' && <section className="panel full-panel">
          <div className="panel-header with-action"><div><h2>Monitored services <span className="subtle-count">{visibleServices.length}</span></h2><p>Search and filter simulated infrastructure</p></div><span className="table-hint">Illustrative telemetry</span></div>
          <div className="table-toolbar"><label className="search-input"><Icon name="search" size={17}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search services, region, category..." aria-label="Search services"/></label><div className="filter-bar" aria-label="Filter by service status">{(['all','healthy','degraded','down'] as const).map((item) => <button type="button" key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} aria-pressed={filter === item}>{item === 'all' ? 'All' : statusLabels[item]}</button>)}</div></div>
          <ServiceTable filtered={visibleServices} incidents={demo.incidents}/>
        </section>}

        {view === 'incidents' && <div className="incidents-layout"><section className="panel full-panel"><div className="panel-header with-action"><div><h2>Incident queue <span className="subtle-count">{visibleIncidents.length}</span></h2><p>Review status and take actions</p></div><div className="filter-bar"><button type="button" className={incidentFilter === 'active' ? 'active' : ''} onClick={() => setIncidentFilter('active')}>Active</button><button type="button" className={incidentFilter === 'resolved' ? 'active' : ''} onClick={() => setIncidentFilter('resolved')}>Resolved</button><button type="button" className={incidentFilter === 'all' ? 'active' : ''} onClick={() => setIncidentFilter('all')}>All</button></div></div>
        {visibleIncidents.length ? visibleIncidents.map((incident) => <IncidentCard key={incident.id} incident={incident} onOpen={(i) => setSelectedIncident(i.id)}/>) : <EmptyCard text="No incidents match this filter."/>}</section>
          <aside className="incident-note"><span className="note-icon"><Icon name="shield" size={23}/></span><h3>A safe place to experiment</h3><p>Acknowledge and resolve incidents. Changes are stored only in your browser and are never sent to a server.</p><button type="button" onClick={reset}>Reset the incident demo <Icon name="refresh" size={15}/></button></aside></div>}

        {view === 'activity' && <section className="panel full-panel"><div className="panel-header"><div><h2>Event timeline <span className="subtle-count">{demo.activities.length}</span></h2><p>Includes your local demo interactions</p></div></div><div className="timeline">{demo.activities.map((event) => <div className="timeline-event" key={event.id}><span className={`timeline-mark ${event.type}`}><Icon name={event.type === 'success' ? 'check' : event.type === 'alert' ? 'alert' : 'clock'} size={15}/></span><div><strong>{event.action}</strong><p>{event.description}</p><small>{event.timestamp.includes('T') ? new Date(event.timestamp).toLocaleString() : event.timestamp}</small></div></div>)}</div></section>}

        {view === 'settings' && <div className="settings-layout"><section className="panel settings-panel"><div className="settings-icon"><Icon name="shield" size={23}/></div><h2>Built for demonstration</h2><p>Ops Control is a front-end engineering showcase. Every service name, alert, timestamp, and metric is illustrative. It does not connect to a production environment or collect real telemetry.</p><div className="settings-table"><div><span>Data source</span><strong>Local fixture (TypeScript)</strong></div><div><span>Session changes</span><strong>Browser localStorage</strong></div><div><span>Hosting</span><strong>Static GitHub Pages</strong></div><div><span>External APIs</span><strong>None</strong></div></div><button type="button" className="button-danger" onClick={reset}><Icon name="refresh" size={17}/> Reset demo state</button></section>
          <section className="panel settings-panel roadmap-card"><div className="settings-icon"><Icon name="zap" size={23}/></div><h2>Extensible architecture</h2><p>Designed to evolve into a production monitoring client with a dedicated API, collector jobs, authentication, and streaming events. Those integrations are intentionally not claimed as implemented here.</p><div className="roadmap"><span><Icon name="check" size={16}/> Responsive dashboard UI</span><span><Icon name="check" size={16}/> Incident state management</span><span><Icon name="check" size={16}/> Data export and unit tests</span><span className="future"><Icon name="clock" size={16}/> API integration (future)</span></div></section></div>}

        <footer className="main-footer"><span>© 2026 OPS CONTROL · Built as a portfolio demo</span><span>React · TypeScript · Vite <i/> Sample data only</span></footer>
      </main>
    </div>

    {incidentSelected && <div className="modal-overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setSelectedIncident(null); }}><section role="dialog" aria-modal="true" aria-labelledby="incident-title" className="incident-dialog"><div className="dialog-top"><span className="incident-id">INCIDENT DETAIL · {incidentSelected.id}</span><button type="button" className="icon-button" onClick={() => setSelectedIncident(null)} aria-label="Close incident details"><Icon name="x" size={19}/></button></div><div className="dialog-body"><SeverityBadge severity={incidentSelected.severity}/><h2 id="incident-title">{incidentSelected.title}</h2><p>{incidentSelected.description}</p><div className="detail-fields"><div><span>Service</span><strong>{services.find(s => s.id === incidentSelected.serviceId)?.name}</strong></div><div><span>Created</span><strong>{incidentSelected.date}</strong></div><div><span>Status</span><IncidentBadge state={incidentSelected.state}/></div><div><span>Severity</span><strong className="capitalize">{incidentSelected.severity}</strong></div></div><div className="dialog-notice"><Icon name="shield" size={17}/> Actions affect only browser-local demonstration data.</div></div><div className="dialog-actions"><button type="button" className="button-outline" onClick={() => setSelectedIncident(null)}>Close</button>{incidentSelected.state === 'open' && <button type="button" className="button-outline" onClick={() => setIncident(incidentSelected, 'acknowledged')}>Acknowledge</button>}{incidentSelected.state !== 'resolved' && <button type="button" className="button-primary" onClick={() => { setIncident(incidentSelected, 'resolved'); setSelectedIncident(null); }}><Icon name="check" size={16}/> Resolve incident</button>}</div></section></div>}
    {toast && <button type="button" className="toast" onClick={() => setToast('')} aria-live="polite"><Icon name="check" size={16}/>{toast}<Icon name="x" size={14}/></button>}
  </div>;
}
