import React from 'react';
import { CloudRain, Sun, Cloud, TrendingUp, TrendingDown } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell,
} from 'recharts';
import { useStore } from '../lib/store';
import { Card, CardHeader, CardTitle, CardBody, SectionTitle, Badge, fmtEur, fmtPct, fmtNum } from '../components/ui';
import type { ScenarioResult } from '../lib/types';

const SCENARIO_CONFIGS = [
  { key: 'pessimistic' as const, label: 'Pessimistisch', icon: <CloudRain size={18} className="text-red-500" />, color: '#ef4444', badgeColor: 'red' as const, bg: 'bg-red-50 border-red-200' },
  { key: 'realistic'   as const, label: 'Realistisch',   icon: <Cloud    size={18} className="text-blue-500" />, color: '#3b82f6', badgeColor: 'blue' as const, bg: 'bg-blue-50 border-blue-200' },
  { key: 'optimistic'  as const, label: 'Optimistisch',  icon: <Sun      size={18} className="text-green-500" />, color: '#22c55e', badgeColor: 'green' as const, bg: 'bg-green-50 border-green-200' },
];

const recLabel = (r: 'kaufen' | 'bedingt' | 'nicht-kaufen') =>
  ({ kaufen: 'Kaufen', bedingt: 'Bedingt', 'nicht-kaufen': 'Nicht kaufen' }[r]);

const recBadge = (r: 'kaufen' | 'bedingt' | 'nicht-kaufen') =>
  ({ kaufen: 'green' as const, bedingt: 'amber' as const, 'nicht-kaufen': 'red' as const }[r]);

function ScenarioCard({ cfg, data }: { cfg: typeof SCENARIO_CONFIGS[0]; data: ScenarioResult }) {
  return (
    <Card className={`border ${cfg.bg}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          {cfg.icon}
          <CardTitle>{cfg.label}</CardTitle>
          <Badge color={recBadge(data.recommendation)}>{recLabel(data.recommendation)}</Badge>
          <Badge color="slate">{data.score}/100</Badge>
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        {/* Assumptions */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-white/60 rounded-lg p-2.5">
          <div>
            <p className="text-slate-400">Mietsteigerung</p>
            <p className="font-semibold">{fmtPct(data.rentIncreasePA)} p.a.</p>
          </div>
          <div>
            <p className="text-slate-400">Leerstandsquote</p>
            <p className="font-semibold">{fmtPct(data.vacancyRate)}</p>
          </div>
          <div>
            <p className="text-slate-400">Anschlusszins</p>
            <p className="font-semibold">{fmtPct(data.interestRateAtRefinancing)}</p>
          </div>
          <div>
            <p className="text-slate-400">Wertsteigerung</p>
            <p className="font-semibold">{fmtPct(data.appreciationRate)} p.a.</p>
          </div>
        </div>

        {/* Key metrics */}
        <div className="space-y-1.5 text-sm">
          {[
            { label: 'Nettomietrendite',    val: fmtPct(data.netRentalYield), good: data.netRentalYield >= 3 },
            { label: 'CF/Jahr (Jahr 1)',    val: fmtEur(data.cashflowAfterTaxY1), good: data.cashflowAfterTaxY1 >= 0 },
            { label: 'CF/Jahr (Jahr 10)',   val: fmtEur(data.cashflowAfterTaxY10), good: data.cashflowAfterTaxY10 >= 0 },
            { label: 'IRR',                 val: fmtPct(data.irr), good: data.irr >= 4 },
            { label: 'Nettoveräußerungserlös', val: fmtEur(data.netExitProceeds), good: data.netExitProceeds >= 0 },
          ].map(row => (
            <div key={row.label} className="flex justify-between items-center">
              <span className="text-slate-500">{row.label}</span>
              <span className={`font-semibold tabular-nums ${row.good ? 'text-green-700' : 'text-red-600'}`}>
                {row.val}
              </span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

export function ScenariosPage() {
  const { results } = useStore();
  const { scenarios } = results;

  const cashflowBarData = [
    { name: 'CF Jahr 1',  Pessimistisch: Math.round(scenarios.pessimistic.cashflowAfterTaxY1), Realistisch: Math.round(scenarios.realistic.cashflowAfterTaxY1), Optimistisch: Math.round(scenarios.optimistic.cashflowAfterTaxY1) },
    { name: 'CF Jahr 10', Pessimistisch: Math.round(scenarios.pessimistic.cashflowAfterTaxY10), Realistisch: Math.round(scenarios.realistic.cashflowAfterTaxY10), Optimistisch: Math.round(scenarios.optimistic.cashflowAfterTaxY10) },
    { name: 'Exit (Netto)', Pessimistisch: Math.round(scenarios.pessimistic.netExitProceeds / 1000), Realistisch: Math.round(scenarios.realistic.netExitProceeds / 1000), Optimistisch: Math.round(scenarios.optimistic.netExitProceeds / 1000) },
  ];

  const radarData = [
    { metric: 'Rendite',     Pess: Math.max(0, scenarios.pessimistic.netRentalYield * 10),  Real: Math.max(0, scenarios.realistic.netRentalYield * 10),  Opt: Math.max(0, scenarios.optimistic.netRentalYield * 10) },
    { metric: 'Cashflow',    Pess: Math.max(0, (scenarios.pessimistic.cashflowAfterTaxY1 + 3000) / 60), Real: Math.max(0, (scenarios.realistic.cashflowAfterTaxY1 + 3000) / 60), Opt: Math.max(0, (scenarios.optimistic.cashflowAfterTaxY1 + 3000) / 60) },
    { metric: 'IRR',         Pess: Math.max(0, scenarios.pessimistic.irr * 5),              Real: Math.max(0, scenarios.realistic.irr * 5),              Opt: Math.max(0, scenarios.optimistic.irr * 5) },
    { metric: 'Score',       Pess: scenarios.pessimistic.score,                              Real: scenarios.realistic.score,                              Opt: scenarios.optimistic.score },
    { metric: 'Exit',        Pess: Math.max(0, (scenarios.pessimistic.netExitProceeds + 50000) / 1500), Real: Math.max(0, (scenarios.realistic.netExitProceeds + 50000) / 1500), Opt: Math.max(0, (scenarios.optimistic.netExitProceeds + 50000) / 1500) },
  ];

  const irrBarData = [
    { name: 'Pessimistisch', IRR: parseFloat(scenarios.pessimistic.irr.toFixed(1)), fill: '#ef4444' },
    { name: 'Realistisch',   IRR: parseFloat(scenarios.realistic.irr.toFixed(1)),   fill: '#3b82f6' },
    { name: 'Optimistisch',  IRR: parseFloat(scenarios.optimistic.irr.toFixed(1)),  fill: '#22c55e' },
  ];

  return (
    <div className="space-y-5">
      <SectionTitle sub="Mindestens drei parallele Szenarien für Zins, Mietsteigerung, Wertentwicklung und Mietausfall (AF-1.3).">
        Szenario-Analyse
      </SectionTitle>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
        <strong>Inflation / Realzins:</strong> Die Immobilien-Wertsteigerung und Mietsteigerung sollten relativ zur angenommenen Inflation interpretiert werden. Eine Restschuld verliert real an Wert (Pluspunkt bei positivem Realzins). Im pessimistischen Szenario wird 0 % Wertsteigerung angenommen (Realverlust bei Inflation).
      </div>

      {/* Scenario cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {SCENARIO_CONFIGS.map(cfg => (
          <ScenarioCard key={cfg.key} cfg={cfg} data={scenarios[cfg.key]} />
        ))}
      </div>

      {/* Comparison table */}
      <Card>
        <CardHeader><CardTitle>Kennzahlenvergleich</CardTitle></CardHeader>
        <CardBody className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase">Kennzahl</th>
                {SCENARIO_CONFIGS.map(cfg => (
                  <th key={cfg.key} className="text-right py-2 text-xs font-semibold" style={{ color: cfg.color }}>
                    {cfg.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Mietsteigerung p.a.', fmt: (s: ScenarioResult) => fmtPct(s.rentIncreasePA) },
                { label: 'Leerstandsquote', fmt: (s: ScenarioResult) => fmtPct(s.vacancyRate) },
                { label: 'Anschlusszins', fmt: (s: ScenarioResult) => fmtPct(s.interestRateAtRefinancing) },
                { label: 'Wertsteigerung p.a.', fmt: (s: ScenarioResult) => fmtPct(s.appreciationRate) },
                { label: '—', fmt: () => '' },
                { label: 'Bruttomietrendite', fmt: (s: ScenarioResult) => fmtPct(s.grossRentalYield) },
                { label: 'Nettomietrendite', fmt: (s: ScenarioResult) => fmtPct(s.netRentalYield) },
                { label: 'Cashflow p.a. (Jahr 1)', fmt: (s: ScenarioResult) => fmtEur(s.cashflowAfterTaxY1) },
                { label: 'Cashflow p.a. (Jahr 10)', fmt: (s: ScenarioResult) => fmtEur(s.cashflowAfterTaxY10) },
                { label: 'ROE (Jahr 1)', fmt: (s: ScenarioResult) => fmtPct(s.roe) },
                { label: 'IRR', fmt: (s: ScenarioResult) => fmtPct(s.irr) },
                { label: 'Nettoveräußerungserlös', fmt: (s: ScenarioResult) => fmtEur(s.netExitProceeds) },
                { label: 'Score', fmt: (s: ScenarioResult) => `${s.score}/100` },
                { label: 'Empfehlung', fmt: (s: ScenarioResult) => recLabel(s.recommendation) },
              ].map((row, i) => (
                <tr key={i} className={`border-b border-slate-50 ${row.label === '—' ? 'h-2' : ''}`}>
                  {row.label !== '—' && (
                    <>
                      <td className="py-1.5 text-slate-600">{row.label}</td>
                      {(['pessimistic', 'realistic', 'optimistic'] as const).map(k => (
                        <td key={k} className="py-1.5 text-right font-medium tabular-nums">{row.fmt(scenarios[k])}</td>
                      ))}
                    </>
                  )}
                  {row.label === '—' && <td colSpan={4} />}
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card>
          <CardHeader><CardTitle>IRR-Vergleich nach Szenario</CardTitle></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={irrBarData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `${v} %`} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v: number) => `${v} %`} />
                <Bar dataKey="IRR" radius={[0, 4, 4, 0]}>
                  {irrBarData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Scenario Radar</CardTitle></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <Radar name="Pessimistisch" dataKey="Pess" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                <Radar name="Realistisch"   dataKey="Real" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                <Radar name="Optimistisch"  dataKey="Opt"  stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Sensitivity */}
      <Card>
        <CardHeader><CardTitle>Sensitivitätsanalyse</CardTitle></CardHeader>
        <CardBody>
          <p className="text-sm text-slate-600 mb-3">Welche Eingabe verändert das Ergebnis am stärksten?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                label: 'Kaufpreis ±10 %',
                impact: results.grossRentalYield * 0.1,
                description: 'Kaufpreis 10 % günstiger → Rendite und Score steigen deutlich.',
                icon: <TrendingUp size={14} />,
              },
              {
                label: 'Miete ±5 %',
                impact: results.annualRent * 0.05 / 100,
                description: 'Mieterhöhung oder -senkung um 5 % wirkt direkt auf CF und Rendite.',
                icon: <TrendingUp size={14} />,
              },
              {
                label: 'Zins ±1 %',
                impact: results.loanAmount * 0.01 / 100,
                description: `1 % mehr Zins kostet ${fmtEur(results.loanAmount * 0.01 / 12)}/Monat zusätzlich.`,
                icon: <TrendingDown size={14} />,
              },
              {
                label: 'Mietsteigerung ±1 %',
                impact: results.annualRent * 0.01,
                description: `1 % mehr Mietsteigerung p.a. erhöht CF nach 10 Jahren um ca. ${fmtEur(results.annualRent * 0.1)}/Jahr.`,
                icon: <TrendingUp size={14} />,
              },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-blue-500 mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">Hinweis: Die Wertsteigerungsannahme dominiert den IRR am stärksten. Daher werden Wertannahmen mit und ohne Wertsteigerung getrennt ausgewiesen (AF-5.10).</p>
        </CardBody>
      </Card>
    </div>
  );
}
