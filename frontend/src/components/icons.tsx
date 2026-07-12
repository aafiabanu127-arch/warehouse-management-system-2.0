// Minimal hand-drawn line-icon set (20x20, stroke-based) used across the
// Ocean glassmorphism dashboard. Kept dependency-free and on-brand rather
// than pulling in a generic icon library.
type IconProps = { className?: string };
const base = 'w-4 h-4';

export function HomeIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5 10 3l7 6.5" />
      <path d="M5 8.5V17h10V8.5" />
    </svg>
  );
}

export function WarehouseIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 8 10 3.5 17.5 8V17h-15V8Z" />
      <path d="M7.5 17v-5h5v5" />
    </svg>
  );
}

export function GridIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="11" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="11" width="6" height="6" rx="1" />
      <rect x="11" y="11" width="6" height="6" rx="1" />
    </svg>
  );
}

export function RackIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="14" height="14" rx="1.5" />
      <path d="M3 8h14M3 13h14M8 3v14M13 3v14" />
    </svg>
  );
}

export function ShelfIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h14M3 10h14M3 15h14" />
    </svg>
  );
}

export function BoxIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6.5 10 3l7 3.5-7 3.5-7-3.5Z" />
      <path d="M3 6.5V14l7 3.5 7-3.5V6.5" />
      <path d="M10 10v7.5" />
    </svg>
  );
}

export function PackageIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="14" height="10" rx="1.3" />
      <path d="M3 6l7-3 7 3M6.5 6v10M13.5 6v10" />
    </svg>
  );
}

export function TagIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 3h4a2 2 0 0 1 2 2v4L8.5 17.5a1.5 1.5 0 0 1-2.1 0L3 14.1a1.5 1.5 0 0 1 0-2.1L11 3Z" />
      <circle cx="14" cy="6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ShuffleIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h2.5c1.8 0 2.7 1.1 3.8 2.7M17 5h-3l1.6 1.6M17 5l-1.6-1.6M17 5 15.4 6.6" />
      <path d="M3 15h2.5c1.8 0 2.7-1.1 3.8-2.7M17 15h-3l1.6-1.6M17 15l-1.6 1.6M17 15l-1.6-1.6" />
    </svg>
  );
}

export function AnalyticsIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17V9M10 17V3M16 17v-6" />
    </svg>
  );
}

export function ReportIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2.5h6l3 3V17a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z" />
      <path d="M7.5 10h5M7.5 13h5" />
    </svg>
  );
}

export function CheckShieldIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2.5 16 5v5c0 4-2.6 6.6-6 7.5-3.4-.9-6-3.5-6-7.5V5l6-2.5Z" />
      <path d="M7.3 10 9 11.7l3.5-3.7" />
    </svg>
  );
}

export function BellIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a4 4 0 0 1 8 0c0 4 1.5 5 1.5 5h-11S6 12 6 8Z" />
      <path d="M8.3 15.5a1.8 1.8 0 0 0 3.4 0" />
    </svg>
  );
}

export function SparkleIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3.5c.5 2.4 1 3.4 1.6 4C12.2 8.1 13.2 8.6 15.5 9c-2.3.4-3.3.9-3.9 1.5-.6.6-1.1 1.6-1.6 4-.5-2.4-1-3.4-1.6-4C6.8 9.9 5.8 9.4 3.5 9c2.3-.4 3.3-.9 3.9-1.5.6-.6 1.1-1.6 1.6-4Z" />
      <path d="M15.8 3v3M14.3 4.5h3" />
    </svg>
  );
}

export function UsersIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="7" r="2.7" />
      <path d="M2.5 17c.5-3 2.4-4.5 5-4.5s4.5 1.5 5 4.5" />
      <path d="M13 5a2.5 2.5 0 0 1 0 5" />
      <path d="M14 12.7c2 .4 3.2 1.8 3.6 4.3" />
    </svg>
  );
}

export function ArrowDownIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3.5v12M5 11l5 4.5 5-4.5" />
    </svg>
  );
}

export function ArrowUpIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 16.5v-12M5 9l5-4.5L15 9" />
    </svg>
  );
}

export function AlertTriangleIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3 18 16.5H2L10 3Z" />
      <path d="M10 8v3.2" />
      <circle cx="10" cy="13.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SearchIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8.5" cy="8.5" r="5" />
      <path d="m16.5 16.5-3.6-3.6" />
    </svg>
  );
}

export function ActivityIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 10h3l2-5.5 4 11 2-5.5h4" />
    </svg>
  );
}

export function LogOutIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 17H4.5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1H8" />
      <path d="M12.5 14l4-4-4-4M16 10H7.5" />
    </svg>
  );
}

export function MenuIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5.5h14M3 10h14M3 14.5h14" />
    </svg>
  );
}
