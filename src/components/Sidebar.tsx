import React from 'react';
import {
  LayoutDashboard, SlidersHorizontal, BarChart3, ClipboardCheck,
  Lightbulb, GitCompare, Building2, Save, RotateCcw, ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../lib/store';
import type { ActivePage } from '../lib/types';

interface NavItem {
  id: ActivePage;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

const NAV: NavItem[] = [
  { id: 'overview',     label: 'Übersicht',      sublabel: 'Kennzahlen & Empfehlung', icon: <LayoutDashboard size={16} /> },
  { id: 'inputs',       label: 'Eingaben',        sublabel: 'Objekt, Miete, Finanzierung', icon: <SlidersHorizontal size={16} /> },
  { id: 'scenarios',    label: 'Szenarien',       sublabel: 'Pessimistisch / Optimistisch', icon: <BarChart3 size={16} /> },
  { id: 'duediligence', label: 'Due Diligence',   sublabel: 'Qualitative Prüfpunkte', icon: <ClipboardCheck size={16} /> },
  { id: 'savings',      label: 'Sparhebel',       sublabel: 'Rendite optimieren', icon: <Lightbulb size={16} /> },
  { id: 'comparison',   label: 'Vergleich',       sublabel: 'Objekte vergleichen', icon: <GitCompare size={16} /> },
];

export function Sidebar() {
  const { activePage, setActivePage, currentObjectName, setCurrentObjectName, saveCurrentObject, resetToDefaults } = useStore();

  const [editingName, setEditingName] = React.useState(false);
  const [nameVal, setNameVal] = React.useState(currentObjectName);

  const handleNameSave = () => {
    setCurrentObjectName(nameVal);
    setEditingName(false);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col bg-gradient-to-b from-slate-900 to-blue-950 text-white z-30">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg">
            <Building2 size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">ImmoKalkulator</p>
            <p className="text-xs text-blue-300">Kapitalanlage DE · v2.0</p>
          </div>
        </div>
      </div>

      {/* Current object */}
      <div className="px-4 py-3 border-b border-white/10">
        <p className="text-xs text-slate-400 mb-1">Aktuelles Objekt</p>
        {editingName ? (
          <div className="flex gap-1">
            <input
              autoFocus
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={e => { if (e.key === 'Enter') handleNameSave(); }}
              className="flex-1 bg-white/10 rounded px-2 py-1 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        ) : (
          <button
            onClick={() => { setNameVal(currentObjectName); setEditingName(true); }}
            className="text-sm font-medium text-white hover:text-blue-300 transition-colors flex items-center gap-1 group"
          >
            {currentObjectName}
            <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150',
              activePage === item.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-white/10 hover:text-white',
            )}
          >
            <span className={clsx('shrink-0', activePage === item.id ? 'text-white' : 'text-slate-400')}>
              {item.icon}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight truncate">{item.label}</p>
              <p className={clsx('text-xs leading-tight truncate', activePage === item.id ? 'text-blue-200' : 'text-slate-500')}>
                {item.sublabel}
              </p>
            </div>
          </button>
        ))}
      </nav>

      {/* Actions */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1.5">
        <button
          onClick={saveCurrentObject}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all"
        >
          <Save size={14} className="text-slate-400" />
          Objekt speichern
        </button>
        <button
          onClick={resetToDefaults}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all"
        >
          <RotateCcw size={14} className="text-slate-400" />
          Zurücksetzen
        </button>
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-3 border-t border-white/10">
        <p className="text-xs text-slate-500 leading-tight">
          Keine Steuer- oder Anlageberatung. Rechtsstand 2026. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </aside>
  );
}
