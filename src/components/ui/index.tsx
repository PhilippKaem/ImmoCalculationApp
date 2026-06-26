import React from 'react';
import { Info } from 'lucide-react';
import clsx from 'clsx';

// ─── Card ────────────────────────────────────────────────────────────────────
export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={clsx('bg-white rounded-xl border border-slate-200 shadow-sm', className)}>
    {children}
  </div>
);

export const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={clsx('px-5 py-4 border-b border-slate-100', className)}>{children}</div>
);

export const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={clsx('text-sm font-semibold text-slate-700 uppercase tracking-wide', className)}>{children}</h3>
);

export const CardBody = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={clsx('px-5 py-4', className)}>{children}</div>
);

// ─── KPI Card ────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  color?: 'default' | 'green' | 'amber' | 'red' | 'blue';
  tooltip?: string;
}

const kpiColors = {
  default: 'text-slate-800',
  green:   'text-green-600',
  amber:   'text-amber-600',
  red:     'text-red-600',
  blue:    'text-blue-600',
};

export const KpiCard = ({ label, value, sub, icon, color = 'default', tooltip }: KpiCardProps) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-1">
    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
      {icon && <span className="text-slate-400">{icon}</span>}
      <span>{label}</span>
      {tooltip && <InfoTooltip content={tooltip} />}
    </div>
    <div className={clsx('text-2xl font-bold tabular-nums', kpiColors[color])}>{value}</div>
    {sub && <div className="text-xs text-slate-400">{sub}</div>}
  </div>
);

// ─── InfoTooltip ─────────────────────────────────────────────────────────────
export const InfoTooltip = ({ content }: { content: string }) => (
  <div className="group relative inline-flex items-center">
    <Info className="h-3.5 w-3.5 text-slate-400 cursor-help hover:text-slate-600 transition-colors" />
    <div className="invisible group-hover:visible absolute z-50 w-72 bg-slate-900 text-white text-xs rounded-lg p-3 shadow-xl
      left-1/2 -translate-x-1/2 bottom-full mb-2 pointer-events-none leading-relaxed">
      {content}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
    </div>
  </div>
);

// ─── Input ───────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  suffix?: string;
  prefix?: string;
  tooltip?: string;
  error?: string;
}

export const Input = ({ label, suffix, prefix, tooltip, error, className, ...props }: InputProps) => (
  <div className="flex flex-col gap-1">
    <label className="flex items-center gap-1 text-xs font-medium text-slate-600">
      {label}
      {tooltip && <InfoTooltip content={tooltip} />}
    </label>
    <div className="flex items-center relative">
      {prefix && (
        <span className="absolute left-3 text-sm text-slate-400 pointer-events-none">{prefix}</span>
      )}
      <input
        className={clsx(
          'w-full rounded-lg border border-slate-300 bg-white py-2 text-sm text-slate-800',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
          prefix ? 'pl-7 pr-3' : 'px-3',
          suffix ? 'pr-14' : '',
          error && 'border-red-400',
          className,
        )}
        {...props}
      />
      {suffix && (
        <span className="absolute right-3 text-xs text-slate-400 pointer-events-none">{suffix}</span>
      )}
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ─── Select ──────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  tooltip?: string;
  options: { value: string; label: string }[];
}

export const Select = ({ label, tooltip, options, className, ...props }: SelectProps) => (
  <div className="flex flex-col gap-1">
    <label className="flex items-center gap-1 text-xs font-medium text-slate-600">
      {label}
      {tooltip && <InfoTooltip content={tooltip} />}
    </label>
    <select
      className={clsx(
        'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
        'appearance-none cursor-pointer',
        className,
      )}
      {...props}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// ─── Toggle / Checkbox ───────────────────────────────────────────────────────
interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  tooltip?: string;
  disabled?: boolean;
}

export const Toggle = ({ label, checked, onChange, tooltip, disabled }: ToggleProps) => (
  <label className={clsx('flex items-center gap-2 cursor-pointer', disabled && 'opacity-40 pointer-events-none')}>
    <div
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative w-9 h-5 rounded-full transition-colors duration-200',
        checked ? 'bg-blue-600' : 'bg-slate-300',
      )}
    >
      <div className={clsx(
        'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
        checked ? 'translate-x-4' : 'translate-x-0',
      )} />
    </div>
    <span className="text-xs font-medium text-slate-700">{label}</span>
    {tooltip && <InfoTooltip content={tooltip} />}
  </label>
);

// ─── Button ──────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const btnVariants = {
  primary:   'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400',
  ghost:     'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
};
const btnSizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

export const Button = ({ variant = 'primary', size = 'md', children, className, ...props }: ButtonProps) => (
  <button
    className={clsx(
      'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5',
      btnVariants[variant],
      btnSizes[size],
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

// ─── Badge ───────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  color?: 'green' | 'amber' | 'red' | 'blue' | 'slate';
}

const badgeColors = {
  green: 'bg-green-100 text-green-700 border-green-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  red:   'bg-red-100   text-red-700   border-red-200',
  blue:  'bg-blue-100  text-blue-700  border-blue-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const Badge = ({ children, color = 'slate' }: BadgeProps) => (
  <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', badgeColors[color])}>
    {children}
  </span>
);

// ─── Section divider ─────────────────────────────────────────────────────────
export const SectionTitle = ({ children, sub }: { children: React.ReactNode; sub?: string }) => (
  <div className="mb-4">
    <h2 className="text-lg font-semibold text-slate-800">{children}</h2>
    {sub && <p className="text-sm text-slate-500 mt-0.5">{sub}</p>}
  </div>
);

// ─── Number formatter ────────────────────────────────────────────────────────
export const fmtEur = (n: number, decimals = 0) =>
  n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + ' €';

export const fmtPct = (n: number, decimals = 1) =>
  n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + ' %';

export const fmtNum = (n: number, decimals = 1) =>
  n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
