import type { SVGProps } from 'react';

type IconName = 'grid' | 'servers' | 'alert' | 'activity' | 'settings' | 'chevron' | 'arrow' | 'search' | 'download' | 'check' | 'clock' | 'shield' | 'cpu' | 'globe' | 'refresh' | 'more' | 'menu' | 'x' | 'database' | 'zap' | 'layers' | 'trend';
type Props = SVGProps<SVGSVGElement> & { name: IconName; size?: number };
const shape: Record<IconName, React.ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  servers: <><rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><circle cx="7" cy="6.5" r=".75" fill="currentColor" stroke="none"/><circle cx="7" cy="17.5" r=".75" fill="currentColor" stroke="none"/></>,
  alert: <><path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5M12 18h.01"/></>,
  activity: <path d="M3 12h4l3-8 4 16 3-8h4"/>,
  settings: <><path d="M12 3v2m0 14v2M4 12H2m20 0h-2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/><circle cx="12" cy="12" r="4"/></>,
  chevron: <path d="m9 18 6-6-6-6"/>, arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></>,
  download: <><path d="M12 3v12m-4-4 4 4 4-4M4 17v3h16v-3"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  shield: <><path d="M12 2 4 5v6c0 5.2 3.2 8.5 8 11 4.8-2.5 8-5.8 8-11V5Z"/><path d="m9 12 2 2 4-4"/></>,
  cpu: <><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v5M15 1v5M9 18v5M15 18v5M1 9h5M1 15h5M18 9h5M18 15h5"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></>,
  refresh: <><path d="M20 7V3h-4M4 17v4h4"/><path d="M20 7A9 9 0 0 0 5 6M4 17a9 9 0 0 0 15 1"/></>,
  more: <><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  x: <path d="M5 5 19 19M19 5 5 19"/>,
  database: <><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 4 18 4 18 0V5M3 12c0 4 18 4 18 0"/></>,
  zap: <path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z"/>,
  layers: <><path d="m12 2 9 5-9 5-9-5 9-5Zm-9 10 9 5 9-5M3 17l9 5 9-5"/></>,
  trend: <><path d="m3 17 6-6 4 3 8-9"/><path d="M15 5h6v6"/></>,
};
export function Icon({ name, size = 18, ...props }: Props) {
  return <svg {...props} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shape[name]}</svg>;
}
