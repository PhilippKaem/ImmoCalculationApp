import React from 'react';
import { Trash2, FolderOpen, Plus, Building2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { Card, CardBody, SectionTitle, Button, Badge, fmtEur, fmtPct, fmtNum } from '../components/ui';
import { FEDERAL_STATE_NAMES } from '../lib/constants';

const recBadge = (r: 'kaufen' | 'bedingt' | 'nicht-kaufen') =>
  ({ kaufen: 'green' as const, bedingt: 'amber' as const, 'nicht-kaufen': 'red' as const }[r]);
const recLabel = (r: 'kaufen' | 'bedingt' | 'nicht-kaufen') =>
  ({ kaufen: 'Kaufen', bedingt: 'Bedingt', 'nicht-kaufen': 'Nicht kaufen' }[r]);

export function ComparisonPage() {
  const { savedObjects, loadObject, deleteObject, saveCurrentObject, currentObjectName, results, property } = useStore();

  if (savedObjects.length === 0) {
    return (
      <div className="space-y-5">
        <SectionTitle sub="Speichern Sie Objekte für den Vergleich.">Objektvergleich</SectionTitle>
        <Card>
          <CardBody className="text-center py-12">
            <Building2 size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm mb-1">Noch keine gespeicherten Objekte</p>
            <p className="text-xs text-slate-400 mb-4">Klicken Sie in der Sidebar auf „Objekt speichern", um das aktuelle Objekt zu speichern.</p>
            <Button onClick={saveCurrentObject} size="sm">
              <Plus size={13} /> {currentObjectName} speichern
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const rows = [
    { label: 'Kaufpreis',          fmt: (o: typeof savedObjects[0]) => fmtEur(o.property.purchasePrice) },
    { label: 'Wohnfläche',         fmt: (o: typeof savedObjects[0]) => `${o.property.livingArea} m²` },
    { label: 'Bundesland',         fmt: (o: typeof savedObjects[0]) => FEDERAL_STATE_NAMES[o.property.federalState] },
    { label: 'Baujahr',            fmt: (o: typeof savedObjects[0]) => `${o.property.constructionYear}` },
    { label: '—', fmt: () => '' },
    { label: 'Gesamtinvestition',  fmt: (o: typeof savedObjects[0]) => fmtEur(o.results.totalInvestment) },
    { label: 'Eigenkapital',       fmt: (o: typeof savedObjects[0]) => fmtEur(o.financing.equity) },
    { label: 'Darlehen',           fmt: (o: typeof savedObjects[0]) => fmtEur(o.results.loanAmount) },
    { label: 'Beleihungsauslauf',  fmt: (o: typeof savedObjects[0]) => fmtPct(o.results.ltv) },
    { label: '—', fmt: () => '' },
    { label: 'Kaltmiete/Monat',    fmt: (o: typeof savedObjects[0]) => fmtEur(o.rental.monthlyRent) },
    { label: 'Bruttomietrendite',  fmt: (o: typeof savedObjects[0]) => fmtPct(o.results.grossRentalYield) },
    { label: 'Nettomietrendite',   fmt: (o: typeof savedObjects[0]) => fmtPct(o.results.netRentalYield) },
    { label: 'Kaufpreisfaktor',    fmt: (o: typeof savedObjects[0]) => `${fmtNum(o.results.purchasePriceFactor)}x` },
    { label: 'Cap Rate',           fmt: (o: typeof savedObjects[0]) => fmtPct(o.results.capRate) },
    { label: '—', fmt: () => '' },
    { label: 'CF/Monat (n. St.)',  fmt: (o: typeof savedObjects[0]) => fmtEur(o.results.cashflowAfterTax / 12) },
    { label: 'DSCR',              fmt: (o: typeof savedObjects[0]) => fmtNum(o.results.dscr, 2) },
    { label: 'ROE',               fmt: (o: typeof savedObjects[0]) => fmtPct(o.results.roe) },
    { label: 'IRR',               fmt: (o: typeof savedObjects[0]) => fmtPct(o.results.irr) },
    { label: '—', fmt: () => '' },
    { label: 'Empfehlung',        fmt: (o: typeof savedObjects[0]) => recLabel(o.results.recommendation) },
    { label: 'Score',             fmt: (o: typeof savedObjects[0]) => `${o.results.score}/100` },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionTitle sub={`${savedObjects.length} gespeicherte Objekte`}>Objektvergleich</SectionTitle>
        <Button onClick={saveCurrentObject} size="sm" variant="secondary">
          <Plus size={13} /> Aktuelles Objekt speichern
        </Button>
      </div>

      {/* Saved objects list */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {savedObjects.map(obj => (
          <Card key={obj.id} className="hover:border-blue-300 transition-colors">
            <CardBody className="py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{obj.name}</p>
                  <p className="text-xs text-slate-400">{fmtEur(obj.property.purchasePrice)}</p>
                  <div className="mt-1">
                    <Badge color={recBadge(obj.results.recommendation)}>{recLabel(obj.results.recommendation)}</Badge>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => loadObject(obj.id)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                    title="Laden"
                  >
                    <FolderOpen size={13} />
                  </button>
                  <button
                    onClick={() => deleteObject(obj.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                    title="Löschen"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Comparison table */}
      {savedObjects.length >= 2 && (
        <Card>
          <CardBody className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase w-40">Kennzahl</th>
                  {savedObjects.map(obj => (
                    <th key={obj.id} className="text-right py-2 text-xs font-semibold text-slate-700 max-w-32">
                      <p className="truncate">{obj.name}</p>
                      <p className="font-normal text-slate-400 text-xs">{fmtEur(obj.property.purchasePrice)}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className={`border-b border-slate-50 ${row.label === '—' ? 'h-2' : ''}`}>
                    {row.label !== '—' && (
                      <>
                        <td className="py-1.5 text-slate-500 text-xs">{row.label}</td>
                        {savedObjects.map(obj => (
                          <td key={obj.id} className="py-1.5 text-right font-medium text-slate-700 tabular-nums text-xs">
                            {row.fmt(obj)}
                          </td>
                        ))}
                      </>
                    )}
                    {row.label === '—' && <td colSpan={savedObjects.length + 1} />}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {savedObjects.length === 1 && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-sm text-slate-500">
          Speichern Sie mind. 2 Objekte für den Side-by-Side Vergleich.
        </div>
      )}
    </div>
  );
}
