import { useState } from 'react';
import type { TimeRange } from '../domain';
import { metricsFor } from '../demo-data';

type Key = 'cpu' | 'memory' | 'requests';
const lines: Record<Key, { color: string; label: string }> = {
  cpu: { color: '#6b8df6', label: 'CPU usage' },
  memory: { color: '#4ecfaf', label: 'Memory' },
  requests: { color: '#bba2fa', label: 'Requests' },
};
const X0 = 48;
const X1 = 840;
const Y0 = 22;
const Y1 = 222;

function points(values: number[]) {
  return values.map((v, i) => [X0 + i / Math.max(1, values.length - 1) * (X1 - X0), Y1 - v / 100 * (Y1 - Y0)] as const);
}
function linePath(values: number[]) {
  return points(values).map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}
function areaPath(values: number[]) {
  return `${linePath(values)} L${X1},${Y1} L${X0},${Y1} Z`;
}

export function TrendChart({ range }: { range: TimeRange }) {
  const data = metricsFor(range);
  const [visible, setVisible] = useState<Record<Key, boolean>>({ cpu: true, memory: true, requests: false });
  const [selected, setSelected] = useState<number | null>(null);
  const index = selected === null ? data.labels.length - 1 : Math.min(selected, data.labels.length - 1);
  const keys = (Object.keys(lines) as Key[]);
  return <div className="chart-wrap">
    <div className="chart-head">
      <div><h2>Resource utilization</h2><p>Illustrative infrastructure performance</p></div>
      <div className="chart-legend" aria-label="Toggle chart series">
        {keys.map((key) => <button type="button" key={key} className={`legend-item ${visible[key] ? 'enabled' : ''}`} aria-pressed={visible[key]} onClick={() => setVisible((v) => ({ ...v, [key]: !v[key] }))}>
          <span style={{ background: lines[key].color }} />{lines[key].label}
        </button>)}
      </div>
    </div>
    <div className="chart-tooltip" aria-live="polite"><strong>{data.labels[index]}</strong><span>CPU {data.cpu[index]}%</span><span>Memory {data.memory[index]}%</span>{visible.requests && <span>Requests {data.requests[index]} (index)</span>}</div>
    <svg className="trend-svg" viewBox="0 0 865 270" role="img" aria-label={`Resource utilization chart for ${range}. CPU and memory usage are illustrative percentages.`} preserveAspectRatio="none">
      <defs><linearGradient id="areaFade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#658afa" stopOpacity=".2"/><stop offset="1" stopColor="#658afa" stopOpacity="0"/></linearGradient></defs>
      {[0,25,50,75,100].map((t) => {
        const y = Y1 - (t / 100) * (Y1 - Y0);
        return <g key={t}><line x1={X0} y1={y} x2={X1} y2={y} stroke="#283244" strokeDasharray="3 6"/><text x="34" y={y + 4} textAnchor="end" fill="#8390a7" fontSize="12">{t}%</text></g>;
      })}
      {visible.cpu && <path d={areaPath(data.cpu)} fill="url(#areaFade)"/>}
      {keys.filter((key) => visible[key]).map((key) => <path key={key} d={linePath(data[key])} fill="none" stroke={lines[key].color} strokeWidth="2.7" strokeLinejoin="round" strokeLinecap="round"/>)}
      {selected !== null && <line x1={X0 + index / Math.max(1,data.labels.length-1) * (X1-X0)} y1={Y0} x2={X0 + index / Math.max(1,data.labels.length-1) * (X1-X0)} y2={Y1} stroke="#8799b4" strokeDasharray="4 5" />}
      {data.labels.map((label, i) => <g key={label}>
        <text x={X0 + i / Math.max(1,data.labels.length-1)*(X1-X0)} y="252" textAnchor="middle" fill="#8390a7" fontSize="11.5">{label}</text>
        <rect x={X0 + i / Math.max(1,data.labels.length-1)*(X1-X0) - (X1-X0)/Math.max(1,data.labels.length-1)/2} y={Y0} width={(X1-X0)/Math.max(1,data.labels.length-1)} height={Y1-Y0} fill="transparent" onMouseEnter={() => setSelected(i)} onClick={() => setSelected(i)} />
      </g>)}
    </svg>
    <div className="chart-foot"><span>Demo dataset · not live telemetry</span><span>Last sample: Oct 23, 2026</span></div>
  </div>;
}
