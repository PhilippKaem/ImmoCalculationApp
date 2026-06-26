import React from 'react';
import { TrendingUp, Tag, Banknote, Calculator, Wrench, AlertTriangle } from 'lucide-react';
import { useStore } from '../lib/store';
import { Card, CardBody, SectionTitle, Badge, fmtEur } from '../components/ui';

interface Lever {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  details: string[];
  warning?: string;
  impact?: string;
  active?: boolean;
}

export function SavingsLeversPage() {
  const { results, property, financing, additionalCosts, tax } = useStore();

  const levers: Lever[] = [
    {
      id: 'grunderwerbsteuer',
      title: 'Kaufpreisaufteilung: Inventar ausweisen',
      subtitle: 'Grunderwerbsteuer reduzieren',
      icon: <Tag size={16} />,
      color: 'text-blue-600',
      active: false,
      impact: `Potenzial: bis zu ${fmtEur(property.purchasePrice * 0.10 * 0.06)} GrESt-Ersparnis bei 10 % Inventar`,
      details: [
        'Bewegliches Inventar (Einbauküche, Möbel, Markisen) separat im Kaufvertrag ausweisen.',
        'Inventar unterliegt NICHT der Grunderwerbsteuer (§ 2 GrEStG).',
        'Grenze: Bis ca. 15 % des Kaufpreises prüft das Finanzamt i.d.R. nicht detailliert.',
        'Ab ca. 50.000 € oder > 15 % drohen Nachweispflicht und Korrektur.',
        'Werte müssen realen Marktwerten entsprechen!',
      ],
      warning: 'Zielkonflikt: Inventar mindert die AfA-Basis des Gebäudes. Abwägen, ob GrESt-Ersparnis größer ist als AfA-Verlust.',
    },
    {
      id: 'makler',
      title: 'Maklerprovision verhandeln',
      subtitle: 'Kaufnebenkosten senken',
      icon: <TrendingUp size={16} />,
      color: 'text-green-600',
      active: additionalCosts.brokerFeePercent > 2,
      impact: `Aktuell: ${additionalCosts.brokerFeePercent} % = ${fmtEur(property.purchasePrice * additionalCosts.brokerFeePercent / 100)}`,
      details: [
        'Maklerprovision ist verhandelbar! Auch 1–2 % Käuferanteil ist möglich.',
        'Provisionsfreie Objekte (Direktkauf vom Eigentümer) bevorzugen.',
        'Bei ETW/EFH: hälftige Teilung nach § 656c/d BGB (max. 3,57 % Käuferanteil).',
        `0 % statt ${additionalCosts.brokerFeePercent} % würde ${fmtEur(property.purchasePrice * additionalCosts.brokerFeePercent / 100)} sparen.`,
      ],
    },
    {
      id: 'finanzierung',
      title: 'Finanzierung & KfW-Förderung optimieren',
      subtitle: 'Zinskosten minimieren',
      icon: <Banknote size={16} />,
      color: 'text-purple-600',
      active: true,
      impact: `Aktuell: ${financing.interestRate} % Zins = ${fmtEur(results.annualInterest)}/Jahr`,
      details: [
        'Mind. 3–5 Banken/Broker vergleichen (LoanLink, Interhyp, Dr. Klein, Hausbank).',
        'Beleihungsauslauf optimieren: Unter 80 % LTV → deutlich bessere Konditionen.',
        `Beleihungsauslauf aktuell: ${results.ltv.toFixed(0)} %${results.ltv > 80 ? ' → zu hoch für beste Konditionen' : ' → gut'}`,
        'Sondertilgungsrechte nutzen (meist 5–10 % p.a. kostenfrei).',
        `KfW-Programme (261, 458) gelten auch für vermietete Objekte. 2026: Budgets gekürzt.${financing.useKfw ? '' : ' → Noch nicht aktiviert!'}`,
        'Längere Zinsbindung (15–20 J.) gibt Planungssicherheit bei niedrigem Zins.',
      ],
      warning: financing.useKfw ? undefined : 'KfW-Förderung noch nicht aktiviert – Prüfen Sie Förderfähigkeit!',
    },
    {
      id: 'afa',
      title: 'AfA-Basis & Gebäudeanteil optimieren',
      subtitle: 'Steuerliche Absetzung maximieren',
      icon: <Calculator size={16} />,
      color: 'text-orange-600',
      active: true,
      impact: `AfA-Betrag p.a.: ${fmtEur(results.afaAmount)} · Steuereffekt: ${fmtEur(results.taxEffect)}`,
      details: [
        `Gebäudeanteil aktuell: ${tax.buildingShare} % der Gesamtinvestition → AfA-Basis: ${fmtEur(results.buildingValue)}`,
        'Realistisch hohen Gebäudeanteil ansetzen – aber plausibel und belegbar! (BFH IX R 26/19)',
        'BMF-Tool nicht bindend, aber als Orientierung nutzen. Gutachten bei hochpreisigen Lagen.',
        tax.useDegressiveAfa
          ? 'Degressive AfA 5 % aktiviert ✓'
          : 'Degressive AfA 5 % (§ 7 Abs. 5a): Prüfen ob berechtigt (Baubeginn 01.10.2023–30.09.2029)',
        tax.shorterUsefulLife > 0
          ? `Kürzere Nutzungsdauer: ${tax.shorterUsefulLife} Jahre ✓`
          : 'Kürzere tatsächliche Nutzungsdauer (§ 7 Abs. 4 S. 2 EStG): Gutachten kann höheren AfA-Satz ermöglichen',
        'Alle Werbungskosten vollständig erfassen: Fahrtkosten, Arbeitszimmer anteilig, Fachliteratur, Steuerberater.',
      ],
      warning: tax.buildingShare > 90 ? 'Gebäudeanteil > 90 % ist unplausibel und kann vom Finanzamt beanstandet werden.' : undefined,
    },
    {
      id: 'bewirtschaftung',
      title: 'Bewirtschaftungskosten optimieren',
      subtitle: 'Laufende Rendite steigern',
      icon: <Wrench size={16} />,
      color: 'text-teal-600',
      active: true,
      impact: `Laufende Kosten gesamt: ${fmtEur(results.totalNonAllocableCosts + results.wegReserveAnnual)}/Jahr`,
      details: [
        'Verwaltergebühr vergleichen: Qualität und Preis prüfen. Online-Verwaltungstools können günstiger sein.',
        'Versicherungen (Hausrat, Gebäude) regelmäßig vergleichen.',
        'Instandhaltung vorausschauend planen: Kleine Mängel beheben bevor sie teuer werden.',
        `Aktuelle kalkulatorische Instandhaltung: ${fmtEur(results.maintenanceCostAnnual)}/Jahr (${additionalCosts.maintenanceCostPerSqm} €/m²)`,
        'Mietausfall minimieren: Gute Mieterbonität prüfen, reibungslose Übergaben, schnelle Wiedervermietung.',
        'Umlagefähige Kosten vollständig auf Mieter umlegen (Betriebskostenabrechnung korrekt erstellen).',
      ],
    },
    {
      id: 'anschaffungsnaher-aufwand',
      title: '15%-Falle vermeiden (§ 6 Abs. 1 Nr. 1a EStG)',
      subtitle: 'Sofortabzug statt AfA-Bindung',
      icon: <AlertTriangle size={16} />,
      color: 'text-red-600',
      active: additionalCosts.renovationBudget > 0,
      impact: additionalCosts.renovationBudget > 0
        ? `Renovierungsbudget: ${fmtEur(additionalCosts.renovationBudget)} (${(additionalCosts.renovationBudget / results.buildingValue * 100).toFixed(1)} % des Gebäudewerts)`
        : 'Kein Renovierungsbudget geplant',
      details: [
        'Modernisierungen in den ersten 3 Jahren: Wenn > 15 % des Gebäudewerts (netto) = anschaffungsnaher Herstellungsaufwand.',
        'Folge: Nicht sofort absetzbar, sondern nur über die AfA (50 oder 33 Jahre!). Erheblicher Steuereffekt-Verlust.',
        `Grenze für Ihr Objekt: ${fmtEur(results.buildingValue * 0.15)} (15 % von ${fmtEur(results.buildingValue)})`,
        additionalCosts.renovationBudget > results.buildingValue * 0.15
          ? `⚠ WARNUNG: Ihr Budget von ${fmtEur(additionalCosts.renovationBudget)} überschreitet die Grenze!`
          : `Ihr Budget liegt unterhalb der Grenze ✓`,
        'Lösung: Maßnahmen auf Jahre 4+ verschieben ODER unter der Grenze bleiben ODER als Erhaltungsaufwand klassifizieren.',
        'Abgrenzung Erhaltungsaufwand (sofort absetzbar) vs. Herstellungsaufwand (AfA) mit Steuerberater klären.',
      ],
      warning: additionalCosts.renovationBudget > results.buildingValue * 0.15
        ? '15%-Grenze überschritten! Sofortige steuerliche Absetzung gefährdet.'
        : undefined,
    },
    {
      id: 'drei-objekte',
      title: 'Drei-Objekt-Grenze beachten',
      subtitle: 'Gewerblichen Grundstückshandel vermeiden',
      icon: <AlertTriangle size={16} />,
      color: 'text-red-700',
      active: false,
      impact: 'Kritisches Risiko für Mehrfach-Investoren',
      details: [
        'Mehr als 3 Objektverkäufe innerhalb von 5 Jahren → gewerblicher Grundstückshandel (§ 15 EStG).',
        'Folge: Die 10-Jahres-Steuerfreiheit entfällt RÜCKWIRKEND für alle Objekte.',
        'Zusätzlich fällt Gewerbesteuer an (15 %+ effektiv).',
        'Gilt auch bei Schenkung an nahe Angehörige mit anschließendem Verkauf!',
        'Lösung: Max. 3 Objekte in 5 Jahren veräußern. Haltedauer > 10 Jahre anstreben.',
      ],
      warning: 'Für Investoren mit mehreren Objekten: Unbedingt mit Steuerberater abstimmen!',
    },
  ];

  return (
    <div className="space-y-5">
      <SectionTitle sub="Steuerliche und wirtschaftliche Optimierungshebel für Ihre Immobilienrendite (AF-8.1 bis AF-8.6).">
        Sparhebel & Optimierungspotenziale
      </SectionTitle>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
        <strong>Disclaimer:</strong> Diese Hinweise stellen keine Steuer- oder Rechtsberatung dar. Bitte konsultieren Sie einen qualifizierten Steuerberater, bevor Sie steuerliche Gestaltungen vornehmen.
      </div>

      <div className="grid grid-cols-1 gap-4">
        {levers.map(lever => (
          <Card key={lever.id}>
            <CardBody>
              <div className="flex items-start gap-3">
                <span className={`${lever.color} mt-0.5 shrink-0`}>{lever.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{lever.title}</p>
                      <p className="text-xs text-slate-500">{lever.subtitle}</p>
                    </div>
                    {lever.impact && (
                      <Badge color="blue">{lever.impact}</Badge>
                    )}
                  </div>

                  <ul className="mt-3 space-y-1.5">
                    {lever.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <span className="text-slate-300 mt-0.5 shrink-0">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>

                  {lever.warning && (
                    <div className="mt-3 flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                      <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                      {lever.warning}
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card>
        <CardBody>
          <p className="text-sm font-semibold text-slate-700 mb-3">Zusammenfassung: Wo liegt das größte Potenzial?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="font-semibold text-green-700 mb-1">Sofort umsetzbar</p>
              <ul className="space-y-0.5">
                <li>• Maklerprovision verhandeln</li>
                <li>• Finanzierungsangebote vergleichen</li>
                <li>• KfW-Förderprogramme prüfen</li>
                <li>• Werbungskosten vollständig erfassen</li>
              </ul>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-semibold text-blue-700 mb-1">Beim Kauf regeln</p>
              <ul className="space-y-0.5">
                <li>• Inventar im Kaufvertrag aufführen</li>
                <li>• Gebäudeanteil realistisch bestimmen</li>
                <li>• Übergabeprotokoll Mängel dokumentieren</li>
                <li>• WEG-Protokolle auf Sonderumlagen prüfen</li>
              </ul>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="font-semibold text-amber-700 mb-1">Mittelfristig</p>
              <ul className="space-y-0.5">
                <li>• Sanierungsplanung (GEG) antizipieren</li>
                <li>• Mieterhöhungspotenzial ausschöpfen</li>
                <li>• Anschlussfinanzierung frühzeitig planen</li>
                <li>• Haltedauer {'>'} 10 Jahre anstreben</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
