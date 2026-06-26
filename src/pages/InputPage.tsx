import React, { useState } from 'react';
import { MapPin, Home, Banknote, Receipt, Wrench } from 'lucide-react';
import { useStore } from '../lib/store';
import { FEDERAL_STATE_NAMES, LAND_TRANSFER_TAX } from '../lib/constants';
import { Input, Select, Toggle, Card, CardHeader, CardTitle, CardBody, SectionTitle, fmtEur, fmtPct } from '../components/ui';
import type { FederalState } from '../lib/types';

const stateOptions = (Object.keys(FEDERAL_STATE_NAMES) as FederalState[]).map(k => ({
  value: k,
  label: `${FEDERAL_STATE_NAMES[k]} (${LAND_TRANSFER_TAX[k].rate} %)`,
}));

const TAB_ICONS = [
  <MapPin size={14} />, <Home size={14} />, <Banknote size={14} />, <Receipt size={14} />, <Wrench size={14} />,
];
const TABS = ['Objekt & Lage', 'Mietdaten', 'Finanzierung', 'Steuern & AfA', 'Kosten & Nebenkosten'];

export function InputPage() {
  const { property, rental, financing, tax, additionalCosts, results,
    setProperty, setRental, setFinancing, setTax, setAdditionalCosts } = useStore();
  const [activeTab, setActiveTab] = useState(0);

  const grEStRate = additionalCosts.landTransferTaxOverride > 0
    ? additionalCosts.landTransferTaxOverride
    : LAND_TRANSFER_TAX[property.federalState].rate;
  const grEStNote = LAND_TRANSFER_TAX[property.federalState].note;

  return (
    <div>
      <SectionTitle sub="Alle Eingaben sind editierbar. Defaultwerte sind als Annahme gekennzeichnet.">
        Eingaben
      </SectionTitle>

      {/* Live summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Gesamtinvestition',  val: fmtEur(results.totalInvestment) },
          { label: 'Nettomietrendite',   val: fmtPct(results.netRentalYield) },
          { label: 'CF/Monat (n. Steuern)', val: fmtEur(results.cashflowAfterTax / 12) },
          { label: 'Score',              val: `${results.score}/100` },
        ].map(item => (
          <div key={item.label} className="bg-blue-50 rounded-xl border border-blue-100 px-4 py-3">
            <p className="text-xs text-blue-600 font-medium">{item.label}</p>
            <p className="text-lg font-bold text-blue-800 tabular-nums">{item.val}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-5 overflow-x-auto">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === i
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            {TAB_ICONS[i]}
            {tab}
          </button>
        ))}
      </div>

      {/* Tab 0: Objekt & Lage */}
      {activeTab === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader><CardTitle>Kaufpreis & Grunddaten</CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Kaufpreis"
                type="number"
                suffix="€"
                value={property.purchasePrice}
                onChange={e => setProperty({ purchasePrice: +e.target.value })}
                tooltip="Vereinbarter Kaufpreis ohne Kaufnebenkosten."
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Wohnfläche"
                  type="number"
                  suffix="m²"
                  value={property.livingArea}
                  onChange={e => setProperty({ livingArea: +e.target.value })}
                  tooltip="Wohnfläche lt. Grundbuch / Exposé (ohne Keller, Balkon-Abschlag beachten)."
                />
                <Input
                  label="Zimmer"
                  type="number"
                  step="0.5"
                  value={property.rooms}
                  onChange={e => setProperty({ rooms: +e.target.value })}
                />
              </div>
              <Input
                label="Baujahr / Fertigstellung"
                type="number"
                value={property.constructionYear}
                onChange={e => setProperty({ constructionYear: +e.target.value })}
                tooltip="Das Fertigstellungsjahr bestimmt den linearen AfA-Satz (vor 1925: 2,5 %, 1925–2022: 2,0 %, ab 2023: 3,0 %)."
              />
              <Select
                label="Objektart"
                value={property.propertyType}
                onChange={e => setProperty({ propertyType: e.target.value as typeof property.propertyType })}
                options={[
                  { value: 'ETW', label: 'Eigentumswohnung (ETW)' },
                  { value: 'MFH', label: 'Mehrfamilienhaus (MFH)' },
                  { value: 'Haus', label: 'Einfamilienhaus / DHH' },
                ]}
                tooltip="Maklerprovisionsteilung (§ 656c/d BGB) gilt bei ETW/EFH. MFH hat andere WEG-Regeln."
              />
              <Select
                label="Zustand"
                value={property.condition}
                onChange={e => setProperty({ condition: e.target.value as typeof property.condition })}
                options={[
                  { value: 'Neubau',           label: 'Neubau' },
                  { value: 'KernSaniert',       label: 'Kernsaniert' },
                  { value: 'Saniert',           label: 'Saniert' },
                  { value: 'Gepflegt',          label: 'Gepflegt' },
                  { value: 'Renovierungsbedarf',label: 'Renovierungsbedarf' },
                  { value: 'Sanierungsstau',    label: 'Sanierungsstau (Risiko!)' },
                ]}
              />
              <Input
                label="Adresse / Bezeichnung"
                type="text"
                placeholder="z.B. Musterstraße 12, 50667 Köln"
                value={property.address}
                onChange={e => setProperty({ address: e.target.value })}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Lage & Energie</CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <Select
                label="Bundesland"
                value={property.federalState}
                onChange={e => setProperty({ federalState: e.target.value as FederalState })}
                options={stateOptions}
                tooltip="Das Bundesland bestimmt den Grunderwerbsteuersatz (3,5–6,5 %). Sätze werden versioniert gespeichert."
              />
              {grEStNote && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                  <strong>Hinweis:</strong> {grEStNote}
                </div>
              )}
              <Input
                label="Grundstücksanteil am Kaufpreis"
                type="number"
                suffix="%"
                min={0}
                max={70}
                value={property.landValueShare}
                onChange={e => setProperty({ landValueShare: +e.target.value })}
                tooltip="Anteil des Grundstückswerts am Gesamtkaufpreis. Dieser Anteil ist NICHT AfA-fähig. Richtwert: Bodenrichtwert / Kaufpreis. Bei teuren Lagen oft 20–40 %."
              />
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                <p className="font-medium mb-1">AfA-Bemessungsgrundlage</p>
                <p>Gebäudeanteil ({100 - property.landValueShare} %): <strong>{fmtEur((property.purchasePrice + results.totalPurchaseCosts) * (100 - property.landValueShare) / 100)}</strong></p>
                <p className="text-slate-400 mt-1">Hinweis: Die App verwendet den Gebäudeanteil aus dem Steuertab (gesondert einstellbar).</p>
              </div>
              <Input
                label="Energiekennwert"
                type="number"
                suffix="kWh/m²a"
                value={property.energyValue}
                onChange={e => setProperty({ energyValue: +e.target.value })}
                tooltip="Aus dem Energieausweis. Relevant für GEG-Anforderungen und KfW-Förderung."
              />
              <Select
                label="Heizungsart"
                value={property.heatingType}
                onChange={e => setProperty({ heatingType: e.target.value as typeof property.heatingType })}
                options={[
                  { value: 'Gas',        label: 'Gas-Zentralheizung' },
                  { value: 'Fernwaerme', label: 'Fernwärme' },
                  { value: 'Waermepumpe',label: 'Wärmepumpe' },
                  { value: 'Oel',        label: 'Öl-Heizung' },
                  { value: 'Pellet',     label: 'Pelletheizung' },
                  { value: 'Direktstrom',label: 'Direktstrom' },
                  { value: 'Sonstige',   label: 'Sonstige' },
                ]}
                tooltip="Ölkessel > 30 Jahre alt: 2-Jahres-Austauschpflicht bei Eigentümerwechsel (GEG). Geplante GModG-Reform beachten."
              />
              {(property.heatingType === 'Oel' || property.energyValue > 200) && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                  <strong>GEG-Hinweis 2026:</strong> Alter Ölkessel und/oder hoher Energieverbrauch → mögliche Sanierungspflicht prüfen. Das geplante Gebäude-Modernisierungs-Gesetz (GModG, avisiert Nov. 2026) löst die starre 65-%-Regel ab.
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tab 1: Mietdaten */}
      {activeTab === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader><CardTitle>Mieteinnahmen</CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Ist-Kaltmiete / erzielbare Marktmiete"
                type="number"
                suffix="€/Monat"
                value={rental.monthlyRent}
                onChange={e => setRental({ monthlyRent: +e.target.value })}
                tooltip="Nettokaltmiete ohne Betriebskosten. Tragen Sie die IST-Miete oder realistisch erzielbare Marktmiete ein."
              />
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div>
                  <p className="text-slate-500">Jahreskaltmiete</p>
                  <p className="font-semibold">{fmtEur(rental.monthlyRent * 12)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Bruttomietrendite</p>
                  <p className="font-semibold">{fmtPct(results.grossRentalYield)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Kaufpreisfaktor</p>
                  <p className="font-semibold">{results.purchasePriceFactor.toFixed(1)}x</p>
                </div>
              </div>
              <Input
                label="Erwartete Mietsteigerung p.a."
                type="number"
                step="0.1"
                suffix="%"
                value={rental.rentIncreasePA}
                onChange={e => setRental({ rentIncreasePA: +e.target.value })}
                tooltip="Historischer Bundesdurchschnitt: ca. 2–3 % p.a. Für die Szenariorechnung werden pessimistisch 0 % und optimistisch +1 % verwendet."
              />
              <Input
                label="Leerstands- / Mietausfallquote"
                type="number"
                step="0.1"
                suffix="% der Jahreskaltmiete"
                value={rental.vacancyRate}
                onChange={e => setRental({ vacancyRate: +e.target.value })}
                tooltip="Pauschalansatz für Leerstand und Mietausfälle. Üblicher Richtwert: 2–3 %. Entspricht ca. 1 Monat Leerstand p.a. bei 8 %."
              />
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                <p>Leerstandsverlust p.a.: <strong className="text-red-600">{fmtEur(-results.vacancyLossAnnual)}</strong></p>
                <p>Effektive Jahreskaltmiete: <strong>{fmtEur(results.effectiveAnnualRent)}</strong></p>
              </div>
              <Toggle
                label="Mietpreisbremse / Mietspiegel aktiv"
                checked={rental.mietpreisbremseActive}
                onChange={v => setRental({ mietpreisbremseActive: v })}
                tooltip="In vielen Städten gilt die Mietpreisbremse (10 % über lokalem Mietspiegel). Prüfen Sie die Miethöhe auf Konformität."
              />
              {rental.mietpreisbremseActive && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                  Mietpreisbremse aktiv: Miete max. 10 % über ortsüblicher Vergleichsmiete (§ 556d BGB). Prüfen Sie den lokalen Mietspiegel.
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Mietrecht & Analyse</CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs font-semibold text-slate-700 mb-2">Mietrendite-Einschätzung</p>
                <div className="space-y-1.5 text-xs text-slate-600">
                  {[
                    { range: '> 5 %',    label: 'A-Lage: sehr gut', color: 'text-green-600' },
                    { range: '4–5 %',    label: 'B-Lage: gut',       color: 'text-green-600' },
                    { range: '3–4 %',    label: 'A-Lage: akzeptabel / B-Lage: ok', color: 'text-amber-600' },
                    { range: '2,5–3 %',  label: 'A-Lage: grenzwertig', color: 'text-amber-600' },
                    { range: '< 2,5 %',  label: 'Kritisch – Rendite unter Sollzins', color: 'text-red-600' },
                  ].map(row => (
                    <div key={row.range} className="flex justify-between">
                      <span className={`font-medium ${row.color}`}>{row.range}</span>
                      <span>{row.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-700">Modernisierungsumlage (§ 559 BGB)</p>
                <p>Nach einer Modernisierung können bis zu 8 % der aufgewendeten Kosten p.a. auf die Jahresmiete umgelegt werden (Kappung bei 3 €/m² in 6 Jahren). Diese Gegenposition zu Sanierungskosten sollte in der Planung berücksichtigt werden.</p>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tab 2: Finanzierung */}
      {activeTab === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader><CardTitle>Eigenkapital & Darlehen</CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Eingesetztes Eigenkapital"
                type="number"
                suffix="€"
                value={financing.equity}
                onChange={e => setFinancing({ equity: +e.target.value })}
                tooltip="Eigenes Kapital inkl. Kaufnebenkosten. Idealerweise sollte das EK mindestens die Kaufnebenkosten + 20 % des Kaufpreises decken."
              />
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                <p>Kaufnebenkosten: <strong>{fmtEur(results.totalPurchaseCosts)}</strong></p>
                <p>Benötigtes Darlehen: <strong>{fmtEur(results.loanAmount)}</strong></p>
                <p>Beleihungsauslauf (LTV): <strong className={results.ltv > 90 ? 'text-red-600' : results.ltv > 80 ? 'text-amber-600' : 'text-green-600'}>
                  {fmtPct(results.ltv)}
                </strong></p>
              </div>
              <Input
                label="Darlehensübersteuerung (0 = auto)"
                type="number"
                suffix="€"
                value={financing.loanAmountOverride}
                onChange={e => setFinancing({ loanAmountOverride: +e.target.value })}
                tooltip="Lassen Sie 0 für die automatische Berechnung (Gesamtinvestition minus EK). Nur überschreiben wenn Sie ein anderes Darlehen planen."
              />
              <Input
                label="Sollzins"
                type="number"
                step="0.1"
                suffix="% p.a."
                value={financing.interestRate}
                onChange={e => setFinancing({ interestRate: +e.target.value })}
                tooltip="Nominal-Sollzins des Annuitätendarlehens. Vergleichen Sie mind. 3 Angebote. Beleihungsauslauf beeinflusst den Zins deutlich."
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Zinsbindung"
                  type="number"
                  suffix="Jahre"
                  value={financing.fixedRatePeriod}
                  onChange={e => setFinancing({ fixedRatePeriod: +e.target.value })}
                  tooltip="Dauer der Zinsfestschreibung. Längere Bindung = Planungssicherheit, meist höherer Zins. Nach Ablauf: Anschlussfinanzierungsrisiko!"
                />
                <Input
                  label="Anfangstilgung"
                  type="number"
                  step="0.1"
                  suffix="% p.a."
                  value={financing.initialRepaymentRate}
                  onChange={e => setFinancing({ initialRepaymentRate: +e.target.value })}
                  tooltip="Mindestens 2 % empfohlen. Niedrigere Tilgung erhöht den Cashflow, aber verlängert die Laufzeit und erhöht das Zinsrisiko."
                />
              </div>
              <Input
                label="Sondertilgung p.a."
                type="number"
                suffix="€"
                value={financing.specialRepaymentPA}
                onChange={e => setFinancing({ specialRepaymentPA: +e.target.value })}
                tooltip="Jährliche außerplanmäßige Tilgung. Banken erlauben meist 5–10 % der Darlehenssumme strafrei."
              />
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-slate-700">
                <p className="font-medium mb-1">Monatliche Rate</p>
                <p className="text-2xl font-bold text-blue-700">{fmtEur(results.monthlyPayment)}</p>
                <p className="text-slate-500 mt-0.5">davon Zinsen: {fmtEur(results.annualInterest / 12)} · Tilgung: {fmtEur(results.annualRepayment / 12)}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>KfW-Förderung (optional)</CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <Toggle
                label="KfW-/Förderdarlehen nutzen"
                checked={financing.useKfw}
                onChange={v => setFinancing({ useKfw: v })}
                tooltip="KfW-Programme (z.B. 261, 458) gelten auch für vermietete Objekte. Hinweis 2026: Budgets sind gekürzt, Zusagen zeit-/budgetkritisch."
              />
              {financing.useKfw && (
                <>
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                    <strong>2026-Hinweis:</strong> KfW-Programmbudgets sind stark gekürzt. Förderzusagen sind als zeitkritisch/unsicher einzustufen. Planen Sie das Hauptdarlehen ohne Fördervorbehalt.
                  </div>
                  <Select
                    label="KfW-Programm"
                    value={financing.kfwProgram}
                    onChange={e => setFinancing({ kfwProgram: e.target.value })}
                    options={[
                      { value: '', label: 'Bitte wählen' },
                      { value: '261', label: 'BEG WG 261 (Bundesförderung Effizienzhaus)' },
                      { value: '458', label: 'Wohngebäude 458 (Klimafreundlich)' },
                      { value: '270', label: 'Erneuerbare Energien 270' },
                      { value: 'sonstige', label: 'Sonstiges' },
                    ]}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="KfW-Darlehensbetrag"
                      type="number"
                      suffix="€"
                      value={financing.kfwAmount}
                      onChange={e => setFinancing({ kfwAmount: +e.target.value })}
                    />
                    <Input
                      label="KfW-Zinssatz"
                      type="number"
                      step="0.1"
                      suffix="%"
                      value={financing.kfwInterestRate}
                      onChange={e => setFinancing({ kfwInterestRate: +e.target.value })}
                    />
                  </div>
                  <Input
                    label="Tilgungszuschuss"
                    type="number"
                    step="0.5"
                    suffix="%"
                    value={financing.kfwRepaymentGrant}
                    onChange={e => setFinancing({ kfwRepaymentGrant: +e.target.value })}
                    tooltip="Einmaliger Tilgungszuschuss bei Erfüllung bestimmter Effizienzstandards (z.B. EH40 = bis 25 %)."
                  />
                </>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tab 3: Steuern & AfA */}
      {activeTab === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader><CardTitle>Steuerliche Angaben</CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Persönlicher Grenzsteuersatz"
                type="number"
                step="1"
                suffix="%"
                value={tax.marginalTaxRate}
                onChange={e => setTax({ marginalTaxRate: +e.target.value })}
                tooltip="Ihr persönlicher Einkommensteuersatz auf den letzten verdienten Euro. Üblich: 42 % (Spitzensteuersatz ab ~67.000 € zvE) oder 45 % (Reichensteuer). Solidaritätszuschlag ggf. addieren."
              />
              <Input
                label="Gebäudeanteil am Gesamtwert"
                type="number"
                step="1"
                suffix="% (Gebäude, AfA-fähig)"
                value={tax.buildingShare}
                onChange={e => setTax({ buildingShare: +e.target.value })}
                tooltip="Der Gebäudeanteil des Kaufpreises + Nebenkosten ist AfA-fähig, der Grundstücksanteil nicht. Realistisch ansetzen! (BFH IX R 26/19: BMF-Tool nicht bindend, aber Plausibilität erforderlich). Gutachten bei hochpreisigen Objekten empfohlen."
              />
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                <p>Gebäudewert (AfA-Basis): <strong>{fmtEur(results.buildingValue)}</strong></p>
                <p>AfA-Satz: <strong>{fmtPct(results.afaRate)}</strong></p>
                <p>AfA-Betrag p.a.: <strong className="text-green-700">{fmtEur(results.afaAmount)}</strong></p>
                <p>Steuereffekt p.a.: <strong className={results.taxEffect > 0 ? 'text-green-700' : 'text-red-600'}>
                  {results.taxEffect > 0 ? `+${fmtEur(results.taxEffect)} Steuerersparnis` : `${fmtEur(results.taxEffect)} Steuerlast`}
                </strong></p>
              </div>
              <Input
                label="Kaufvertragsdatum"
                type="date"
                value={tax.purchaseContractDate}
                onChange={e => setTax({ purchaseContractDate: e.target.value })}
                tooltip="Das Kaufvertrags-/Baubeginndatum entscheidet über degressive AfA-Berechtigung (Baubeginn 01.10.2023–30.09.2029) und § 7b Sonder-AfA."
              />
              <Input
                label="Geplante Haltedauer"
                type="number"
                suffix="Jahre"
                value={tax.holdingPeriod}
                onChange={e => setTax({ holdingPeriod: +e.target.value })}
                tooltip="Relevant für: Spekulationssteuer (10-Jahresfrist, § 23 EStG), IRR-Berechnung und Exit-Analyse. Unter 10 Jahren: Veräußerungsgewinn voll steuerpflichtig!"
              />
              <Input
                label="Angenommene Wertsteigerung p.a."
                type="number"
                step="0.1"
                suffix="%"
                value={tax.annualAppreciationRate}
                onChange={e => setTax({ annualAppreciationRate: +e.target.value })}
                tooltip="Vorsichtiger Ansatz: 1–2 % p.a. (real). Diese Annahme dominiert den IRR stark – transparent ausweisen."
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>AfA-Optionen</CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs font-semibold text-slate-700 mb-2">AfA-Systematik (Rechtsstand 2026)</p>
                <div className="space-y-1 text-xs text-slate-600">
                  {[
                    { label: 'Linear Altbau (vor 1925)', rate: '2,5 %', note: '40 Jahre' },
                    { label: 'Linear Standard (1925–2022)', rate: '2,0 %', note: '50 Jahre' },
                    { label: 'Linear Neubau (ab 01.01.2023)', rate: '3,0 %', note: '33 Jahre' },
                    { label: 'Degressiv § 7 Abs. 5a', rate: '5,0 %', note: 'Vom Restwert, Baubeginn 01.10.2023–30.09.2029' },
                    { label: 'Sonder-AfA § 7b', rate: '+5,0 %', note: '4 Jahre zusätzlich, EH40/QNG' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-start gap-2">
                      <span>{row.label}</span>
                      <div className="text-right shrink-0">
                        <span className="font-medium text-blue-700">{row.rate}</span>
                        <span className="block text-slate-400">{row.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Toggle
                label="Degressive AfA 5 % nutzen (§ 7 Abs. 5a)"
                checked={tax.useDegressiveAfa}
                onChange={v => setTax({ useDegressiveAfa: v })}
                tooltip="Nur möglich bei Baubeginn 01.10.2023–30.09.2029. Wechsel zu linear möglich und oft sinnvoll (wenn linearer Satz den degressiven übersteigt)."
              />
              <Toggle
                label="§ 7b Sonder-AfA nutzen (+5 % für 4 Jahre)"
                checked={tax.useSpecialAfa7b}
                onChange={v => setTax({ useSpecialAfa7b: v })}
                tooltip="Zusätzlich zur normalen AfA, 4 Jahre lang +5 %. Voraussetzung: Effizienzhaus EH40 oder QNG-Zertifikat. Baukostengrenzen beachten. Mit degressiver AfA kombinierbar."
              />
              <Input
                label="Kürzere tatsächliche Nutzungsdauer (opt.)"
                type="number"
                suffix="Jahre (0 = nicht nutzen)"
                value={tax.shorterUsefulLife}
                onChange={e => setTax({ shorterUsefulLife: +e.target.value })}
                tooltip="§ 7 Abs. 4 S. 2 EStG: Bei nachgewiesener kürzerer Nutzungsdauer (Gutachten erforderlich) kann ein höherer AfA-Satz angesetzt werden. Beispiel: 40 Jahre → 2,5 %."
              />
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-700">
                <p className="font-medium mb-1">Spekulationsfrist (§ 23 EStG)</p>
                <p>Haltedauer geplant: <strong>{tax.holdingPeriod} Jahre</strong></p>
                {tax.holdingPeriod < 10 ? (
                  <p className="text-red-600 font-medium mt-1">⚠ Unter 10 Jahren: Veräußerungsgewinn voll steuerpflichtig! Spekulationssteuer: {fmtEur(results.speculativeTax)}</p>
                ) : (
                  <p className="text-green-700 font-medium mt-1">Über 10 Jahre: Verkauf steuerfrei (kein gewerblicher Grundstückshandel vorausgesetzt).</p>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tab 4: Kosten & Nebenkosten */}
      {activeTab === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader><CardTitle>Kaufnebenkosten (einmalig)</CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                <p className="font-semibold text-slate-700 mb-1">Grunderwerbsteuer ({property.federalState})</p>
                <p>Satz: <strong>{grEStRate} %</strong> → <strong>{fmtEur(results.landTransferTax)}</strong></p>
                {grEStNote && <p className="text-slate-400 mt-0.5">{grEStNote}</p>}
                <p className="text-slate-400 mt-0.5">Bagatellgrenze: Unter 2.500 € GrESt entfällt die Steuer (§ 3 Nr. 1 GrEStG).</p>
              </div>
              <Input
                label="GrESt-Satz überschreiben (0 = auto)"
                type="number"
                step="0.1"
                suffix="%"
                value={additionalCosts.landTransferTaxOverride}
                onChange={e => setAdditionalCosts({ landTransferTaxOverride: +e.target.value })}
                tooltip="Normalerweise aus dem Bundesland übernommen. Nur überschreiben bei abweichenden Konstellationen (z.B. Inventar-Split)."
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Notar & Grundbuch"
                  type="number"
                  step="0.1"
                  suffix="% des KP"
                  value={additionalCosts.notaryFeePercent}
                  onChange={e => setAdditionalCosts({ notaryFeePercent: +e.target.value })}
                  tooltip="Bundeseinheitlich nach GNotKG: ca. 1,1–1,5 %. Enthält Beurkundung, Grundbucheintrag und Auflassungsvormerkung."
                />
                <Input
                  label="Maklerprovision"
                  type="number"
                  step="0.01"
                  suffix="% des KP"
                  value={additionalCosts.brokerFeePercent}
                  onChange={e => setAdditionalCosts({ brokerFeePercent: +e.target.value })}
                  tooltip="Bei ETW/EFH: hälftige Teilung nach § 656c/d BGB, max. 3,57 % Käuferanteil. Verhandeln! Provisionsfreie Objekte sind günstiger."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Gutachterkosten"
                  type="number"
                  suffix="€"
                  value={additionalCosts.surveyorCost}
                  onChange={e => setAdditionalCosts({ surveyorCost: +e.target.value })}
                  tooltip="Unabhängiger Gutachter oder Sachverständiger. Empfohlen bei älteren Objekten."
                />
                <Input
                  label="Finanzierungsnebenkosten"
                  type="number"
                  suffix="€"
                  value={additionalCosts.financingCost}
                  onChange={e => setAdditionalCosts({ financingCost: +e.target.value })}
                  tooltip="Bereitstellungszinsen, Bearbeitungsgebühren etc."
                />
              </div>
              <Input
                label="Modernisierungsbudget (direkt nach Kauf)"
                type="number"
                suffix="€"
                value={additionalCosts.renovationBudget}
                onChange={e => setAdditionalCosts({ renovationBudget: +e.target.value })}
                tooltip="ACHTUNG 15%-Falle: Modernisierungen in den ersten 3 Jahren über 15 % des Gebäudewerts (netto) sind nur über AfA absetzbar, nicht sofort (§ 6 Abs. 1 Nr. 1a EStG)!"
              />
              {additionalCosts.renovationBudget > 0 && additionalCosts.renovationBudget / results.buildingValue > 0.15 && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  <strong>15%-Warnung:</strong> Das Renovierungsbudget ({fmtEur(additionalCosts.renovationBudget)}) übersteigt 15 % des Gebäudewerts ({fmtEur(results.buildingValue * 0.15)}). Steuerlich nur über AfA absetzbar!
                </div>
              )}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-700 mb-1">Summe Kaufnebenkosten</p>
                <p className="text-xl font-bold text-blue-800">{fmtEur(results.totalPurchaseCosts)}</p>
                <p className="text-xs text-blue-600">= {fmtPct(results.purchaseCostRatio)} des Kaufpreises · Typisch: 10–15 %</p>
                <p className="text-xs text-slate-500 mt-1">Kaufnebenkosten sind "verlorenes Eigenkapital" und fließen in die Renditebasis ein.</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Laufende Kosten (jährlich)</CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Hausverwaltung"
                type="number"
                suffix="€/Monat"
                value={additionalCosts.managementCostMonthly}
                onChange={e => setAdditionalCosts({ managementCostMonthly: +e.target.value })}
                tooltip="WEG-Verwalterhonorar ist nicht umlagefähig auf den Mieter, aber als Werbungskosten steuerlich absetzbar. Typisch: 25–50 €/Monat."
              />
              <Input
                label="Instandhaltungsrücklage (kalkulatorisch)"
                type="number"
                suffix="€/m²/Jahr"
                step="0.5"
                value={additionalCosts.maintenanceCostPerSqm}
                onChange={e => setAdditionalCosts({ maintenanceCostPerSqm: +e.target.value })}
                tooltip="Kalkulatorischer Instandhaltungsbedarf nach Peters'cher Formel (ca. 7–14 €/m²/Jahr je nach Baujahr und Zustand). Für Renditeechheit einzuplanen."
              />
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                <p>Instandhaltung p.a.: <strong>{fmtEur(results.maintenanceCostAnnual)}</strong> ({fmtEur(additionalCosts.maintenanceCostPerSqm)}/m²)</p>
              </div>
              <Input
                label="WEG-Erhaltungsrücklage (Einzahlung)"
                type="number"
                suffix="€/Monat"
                value={additionalCosts.wegMonthlyContribution}
                onChange={e => setAdditionalCosts({ wegMonthlyContribution: +e.target.value })}
                tooltip="WICHTIG (BFH IX R 19/24): Die Einzahlung in die WEG-Rücklage ist Cashflow-Abfluss HEUTE, steuerlich aber erst absetzbar, wenn die WEG das Geld für Erhaltungsmaßnahmen AUSGIBT. Die App unterscheidet Cashflow- und Steuerwirkung."
              />
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                <strong>Doppelte Kostenlogik (BFH IX R 19/24):</strong> WEG-Rücklage: Cashflow-Abfluss = {fmtEur(results.wegReserveAnnual)}/Jahr, aber steuerlich erst bei Verausgabung durch WEG absetzbar.
              </div>
              <Input
                label="Sonstige nicht umlagefähige Kosten"
                type="number"
                suffix="€/Jahr"
                value={additionalCosts.otherNonAllocableCosts}
                onChange={e => setAdditionalCosts({ otherNonAllocableCosts: +e.target.value })}
                tooltip="Nicht auf Mieter umlegbare Betriebskosten, Kontoführungsgebühren, Versicherungsanteile etc."
              />
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs">
                <p className="font-semibold text-blue-700 mb-2">Kostenübersicht p.a.</p>
                {[
                  { label: 'Hausverwaltung',        val: results.managementCostAnnual },
                  { label: 'Instandhaltung',         val: results.maintenanceCostAnnual },
                  { label: 'WEG-Rücklage (CF)',      val: results.wegReserveAnnual },
                  { label: 'Leerstand/Mietausfall',  val: results.vacancyLossAnnual },
                  { label: 'Sonstige',               val: results.otherNonAllocableCostsAnnual },
                  { label: 'Zinsen',                 val: results.annualInterest },
                  { label: 'Tilgung',                val: results.annualRepayment },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-slate-600 py-0.5">
                    <span>{r.label}</span>
                    <span className="font-medium">{fmtEur(r.val)}</span>
                  </div>
                ))}
                <div className="border-t border-blue-200 mt-1 pt-1 flex justify-between font-semibold text-blue-800">
                  <span>Gesamtaufwand</span>
                  <span>{fmtEur(results.totalNonAllocableCosts + results.wegReserveAnnual + results.annualInterest + results.annualRepayment)}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
