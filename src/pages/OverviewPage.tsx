import React from 'react';
import {
  TrendingUp, TrendingDown, BarChart2, ArrowUpRight, Home, Percent,
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Download,
  FileSpreadsheet, Target, Zap,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useStore } from '../lib/store';
import { exportPDF, exportExcel } from '../lib/export';
import {
  Card, CardHeader, CardTitle, CardBody, KpiCard, SectionTitle,
  Badge, Button, fmtEur, fmtPct, fmtNum,
} from '../components/ui';

const CF_COLORS = { positive: '#22c55e', negative: '#ef4444' };

const CustomCFTooltip = ({ active, payload, label }: Record<string, unknown>) => {
  if (!active || !payload || !(payload as { length: number }).length) return null;
  const p = payload as Array<{ value: number; name: string }>;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1">Jahr {label as number}</p>
      {p.map((entry, i) => (
        <p key={i} style={{ color: entry.value >= 0 ? '#22c55e' : '#ef4444' }}>
          {entry.name}: {fmtEur(entry.value)}
        </p>
      ))}
    </div>
  );
};

export function OverviewPage() {
  const { results, property, currentObjectName } = useStore();
  const r = results;

  const recConfig = {
    kaufen:        { label: 'KAUFEN',       color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: <CheckCircle2 className="text-green-600" size={32} />, badge: 'green' as const },
    bedingt:       { label: 'BEDINGT',      color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: <ShieldAlert   className="text-amber-600"  size={32} />, badge: 'amber' as const },
    'nicht-kaufen':{ label: 'NICHT KAUFEN', color: 'text-red-700',   bg: 'bg-red-50   border-red-200',   icon: <ShieldAlert   className="text-red-600"    size={32} />, badge: 'red' as const },
  }[r.recommendation];

  // Cashflow projection data
  const cfData = r.cashflowProjection.slice(0, 20).map(e => ({
    year: e.year,
    'CF nach Steuer': Math.round(e.cashflowAfterTax),
    'Kumuliert': Math.round(e.cumulativeCashflow),
    'Immobilienwert': Math.round(e.propertyValue),
    'Restschuld': Math.round(e.remainingLoan),
  }));

  // Amortization data
  const amoData = r.amortizationSchedule.slice(0, 20).map(e => ({
    year: e.year,
    'Zinsen': Math.round(e.interestPayment),
    'Tilgung': Math.round(e.repaymentPayment),
  }));

  // Cost breakdown pie
  const costData = [
    { name: 'Zinsen',            value: Math.round(r.annualInterest),           color: '#3b82f6' },
    { name: 'Tilgung',           value: Math.round(r.annualRepayment),          color: '#60a5fa' },
    { name: 'Instandhaltung',    value: Math.round(r.maintenanceCostAnnual),    color: '#f97316' },
    { name: 'Hausverwaltung',    value: Math.round(r.managementCostAnnual),     color: '#a78bfa' },
    { name: 'WEG-Rücklage',      value: Math.round(r.wegReserveAnnual),         color: '#f59e0b' },
    { name: 'Leerstand',         value: Math.round(r.vacancyLossAnnual),        color: '#ef4444' },
    { name: 'Sonstige',          value: Math.round(r.otherNonAllocableCostsAnnual), color: '#94a3b8' },
  ].filter(d => d.value > 0);

  // Equity build-up (first 20 years)
  const equityData = r.cashflowProjection.slice(0, 20).map(e => ({
    year: e.year,
    'Eigenkapital': Math.round(e.totalEquity),
    'Restschuld': Math.round(e.remainingLoan),
  }));

  const kpiColor = (val: number, good: number, bad: number, inverse = false): 'green' | 'amber' | 'red' => {
    const ok = inverse ? val <= good : val >= good;
    const warn = inverse ? val <= bad : val >= bad;
    return ok ? 'green' : warn ? 'amber' : 'red';
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <SectionTitle sub={property.address || 'Kapitalanlage Deutschland'}>
          {currentObjectName}
        </SectionTitle>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={() => exportPDF(r, property, currentObjectName)}>
            <Download size={13} /> PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={() => exportExcel(r, property, currentObjectName)}>
            <FileSpreadsheet size={13} /> Excel
          </Button>
        </div>
      </div>

      {/* Recommendation banner */}
      <div className={`rounded-xl border p-4 flex items-start gap-4 ${recConfig.bg}`}>
        {recConfig.icon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xl font-bold ${recConfig.color}`}>{recConfig.label}</span>
            <Badge color={recConfig.badge}>{r.score}/100 Punkte</Badge>
          </div>
          <p className="text-sm text-slate-700">{r.recommendationText}</p>
          {r.topLeverages.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-xs text-slate-500">Top-Hebel:</span>
              {r.topLeverages.map(l => <Badge key={l} color="slate">{l}</Badge>)}
            </div>
          )}
        </div>
        {/* Score bar */}
        <div className="shrink-0 w-24 text-center hidden sm:block">
          <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${r.score >= 65 ? 'bg-green-500' : r.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${r.score}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">Score</p>
        </div>
      </div>

      {/* Risk flags */}
      {r.riskFlags.length > 0 && (
        <div className="space-y-2">
          {r.riskFlags.map(flag => (
            <div
              key={flag.id}
              className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${
                flag.severity === 'critical'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <div>
                <strong>{flag.title}:</strong> {flag.description}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPI Grid Row 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard
          label="Bruttomietrendite"
          value={fmtPct(r.grossRentalYield)}
          sub={`${fmtEur(r.annualRent)}/Jahr`}
          icon={<Percent size={14} />}
          color={kpiColor(r.grossRentalYield, 4, 3)}
          tooltip="Jahreskaltmiete / Kaufpreis. Vorsteuer-Faustrendite ohne Kosten."
        />
        <KpiCard
          label="Nettomietrendite"
          value={fmtPct(r.netRentalYield)}
          sub="inkl. Bewirtschaftung & NK"
          icon={<TrendingUp size={14} />}
          color={kpiColor(r.netRentalYield, 3.5, 2.5)}
          tooltip="(Jahreskaltmiete − nicht umlagefähige Kosten) / (Kaufpreis + Kaufnebenkosten). Die relevante Vergleichsgröße zum Sollzins."
        />
        <KpiCard
          label="Kaufpreisfaktor"
          value={`${fmtNum(r.purchasePriceFactor)}x`}
          sub="Kaufpreis / Jahreskaltmiete"
          icon={<BarChart2 size={14} />}
          color={kpiColor(r.purchasePriceFactor, 25, 30, true)}
          tooltip="Kaufpreis / Jahreskaltmiete (Vervielfältiger). Kehrwert der Bruttomietrendite. Unter 20 = günstig, über 30 = teuer."
        />
        <KpiCard
          label="Cap Rate"
          value={fmtPct(r.capRate)}
          sub="NOI / Kaufpreis"
          icon={<Target size={14} />}
          color={kpiColor(r.capRate, 3.5, 2.5)}
          tooltip="Net Operating Income (NOI) / Kaufpreis. Internationaler Bewertungsstandard unabhängig von der Finanzierungsstruktur."
        />
      </div>

      {/* KPI Grid Row 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard
          label="Cashflow/Monat (n. Steuern)"
          value={fmtEur(r.cashflowAfterTax / 12)}
          sub={r.cashflowAfterTax > 0 ? 'Positiver CF' : 'Negativer CF'}
          icon={r.cashflowAfterTax > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          color={r.cashflowAfterTax > 0 ? 'green' : r.cashflowAfterTax > -200 ? 'amber' : 'red'}
          tooltip="Effektive Miete minus alle Kosten minus Kapitaldienst plus/minus Steuereffekt. Die wichtigste Liquiditätskennzahl."
        />
        <KpiCard
          label="DSCR"
          value={fmtNum(r.dscr, 2)}
          sub="NOI / Kapitaldienst"
          icon={<ShieldCheck size={14} />}
          color={kpiColor(r.dscr, 1.2, 1.0)}
          tooltip="Debt Service Coverage Ratio: NOI / (Zinsen + Tilgung). Zielwert Banken: ≥ 1,1–1,2. Unter 1,0 = kritisch."
        />
        <KpiCard
          label="Eigenkapitalrendite"
          value={fmtPct(r.roe)}
          sub="CF + Tilgung + Wertsteigerung"
          icon={<ArrowUpRight size={14} />}
          color={kpiColor(r.roe, 5, 3)}
          tooltip="(Cashflow n. Steuern + Tilgung + Wertsteigerung) / eingesetztes EK. Enthält Leverage-Effekt. Bestandteile transparent ausweisen!"
        />
        <KpiCard
          label="IRR"
          value={fmtPct(r.irr)}
          sub={`Über ${r.cashflowProjection.length} Jahre`}
          icon={<Zap size={14} />}
          color={kpiColor(r.irr, 5, 3)}
          tooltip="Interner Zinsfuß über die Haltedauer, inkl. laufender Cashflows, Tilgungsgewinn und Exit. Vergleichbar mit ETF-Rendite nach Steuern."
        />
      </div>

      {/* KPI Grid Row 3 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard
          label="Gesamtinvestition"
          value={fmtEur(r.totalInvestment)}
          sub={`KNK: ${fmtPct(r.purchaseCostRatio)}`}
          icon={<Home size={14} />}
          tooltip="Kaufpreis + alle Kaufnebenkosten. Kaufnebenkosten sind 'verlorenes Eigenkapital' und senken die Rendite."
        />
        <KpiCard
          label="Darlehen"
          value={fmtEur(r.loanAmount)}
          sub={`LTV: ${fmtPct(r.ltv)}`}
          icon={<BarChart2 size={14} />}
          color={kpiColor(r.ltv, 80, 90, true)}
          tooltip="Benötigtes Fremdkapital. Beleihungsauslauf (LTV) beeinflusst Zinssatz stark. Über 80 % = schlechtere Konditionen."
        />
        <KpiCard
          label="AfA / Steuereffekt p.a."
          value={fmtEur(r.afaAmount)}
          sub={r.taxEffect > 0 ? `+${fmtEur(r.taxEffect)} Ersparnis` : `${fmtEur(r.taxEffect)} Steuerlast`}
          icon={<Percent size={14} />}
          color={r.taxEffect > 0 ? 'green' : 'red'}
          tooltip="AfA mindert das zu versteuernde Einkommen aus der Vermietung. Steuerersparnis = steuerpflichtiger Verlust × Grenzsteuersatz."
        />
        <KpiCard
          label="Break-even Miete"
          value={fmtEur(r.breakEvenMonthlyRent)}
          sub="Cashflow-neutral (brutto)"
          icon={<Target size={14} />}
          color={r.breakEvenMonthlyRent <= useStore.getState().rental.monthlyRent ? 'green' : 'red'}
          tooltip="Mindestmiete für einen ausgeglichenen Cashflow vor Steuern. Wenn Ist-Miete darüber liegt: Puffer vorhanden."
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Cashflow-Projektion (20 Jahre)</CardTitle>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={cfData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: 'Jahr', position: 'insideBottom', offset: -2, fontSize: 11 }} />
                <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomCFTooltip />} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="CF nach Steuer" stroke="#3b82f6" fill="url(#cfGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="Kumuliert" stroke="#22c55e" fill="url(#cumGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tilgungsplan – Zins vs. Tilgung (20 Jahre)</CardTitle></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={amoData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => fmtEur(v)} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Zinsen"  fill="#ef4444" radius={[2, 2, 0, 0]} stackId="a" />
                <Bar dataKey="Tilgung" fill="#3b82f6" radius={[2, 2, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card>
          <CardHeader><CardTitle>Eigenkapitalentwicklung</CardTitle></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={equityData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="ekGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => fmtEur(v)} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="Eigenkapital" stroke="#22c55e" fill="url(#ekGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="Restschuld"   stroke="#ef4444" fill="none" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Jährliche Kostenstruktur</CardTitle></CardHeader>
          <CardBody className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={costData}
                  cx="40%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {costData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => fmtEur(v)} />
                <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Annual cashflow breakdown */}
      <Card>
        <CardHeader><CardTitle>Cashflow-Rechnung Jahr 1 (Detailansicht)</CardTitle></CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Income */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Einnahmen</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Kaltmiete (brutto)</span>
                  <span className="font-medium text-green-700">{fmtEur(r.annualRent)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>− Leerstandsverlust</span>
                  <span>{fmtEur(-r.vacancyLossAnnual)}</span>
                </div>
                <div className="border-t pt-1 flex justify-between font-semibold">
                  <span>Effektive Miete</span>
                  <span>{fmtEur(r.effectiveAnnualRent)}</span>
                </div>
              </div>
            </div>

            {/* Costs */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Kosten & Kapitaldienst</p>
              <div className="space-y-1.5 text-sm">
                {[
                  { label: '− Hausverwaltung',          val: r.managementCostAnnual },
                  { label: '− Instandhaltung',           val: r.maintenanceCostAnnual },
                  { label: '− WEG-Rücklage (CF)',        val: r.wegReserveAnnual },
                  { label: '− Sonstige n.u.K.',          val: r.otherNonAllocableCostsAnnual },
                  { label: '− Zinsen',                   val: r.annualInterest },
                  { label: '− Tilgung',                  val: r.annualRepayment },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-slate-500">
                    <span>{row.label}</span>
                    <span>{fmtEur(-row.val)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Result */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Ergebnis</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>CF vor Steuern</span>
                  <span className={r.cashflowBeforeTax < 0 ? 'text-red-600' : 'text-green-700'}>{fmtEur(r.cashflowBeforeTax)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>AfA p.a.</span>
                  <span className="text-green-600">{fmtEur(r.afaAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Steuerl. Verlust/Gewinn</span>
                  <span className={r.taxableIncome < 0 ? 'text-green-600' : 'text-red-600'}>{fmtEur(r.taxableIncome)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>± Steuereffekt</span>
                  <span className={r.taxEffect > 0 ? 'text-green-600' : 'text-red-600'}>{fmtEur(r.taxEffect)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-1.5">
                  <span>CF nach Steuern</span>
                  <span className={r.cashflowAfterTax < 0 ? 'text-red-700' : 'text-green-700'}>{fmtEur(r.cashflowAfterTax)}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-xs">
                  <span>= pro Monat</span>
                  <span className={r.cashflowAfterTax < 0 ? 'text-red-600' : 'text-green-600'}>{fmtEur(r.cashflowAfterTax / 12)}</span>
                </div>
              </div>

              {/* Exit box */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-700">Exit nach {r.cashflowProjection.length} Jahren</p>
                <div className="flex justify-between">
                  <span>Verkaufspreis (progn.)</span>
                  <span className="font-medium">{fmtEur(r.projectedSalePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>− Verkaufskosten</span>
                  <span>{fmtEur(-r.saleCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span>− Spekulationssteuer</span>
                  <span className={r.speculativeTax > 0 ? 'text-red-600' : ''}>{fmtEur(-r.speculativeTax)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>Nettoveräußerungserlös</span>
                  <span className="text-green-700">{fmtEur(r.netExitProceeds)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// Fix: pass rental from store correctly for breakeven color
const OverviewPageWrapper = () => {
  const rental = useStore(s => s.rental);
  return <OverviewPage />;
};

export default OverviewPageWrapper;
