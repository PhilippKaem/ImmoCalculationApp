import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronRight, AlertTriangle, MapPin, Building, Scale, Users, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody, SectionTitle } from '../components/ui';

interface CheckItem {
  id: string;
  label: string;
  detail: string;
  warning?: string;
}

interface CheckCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  items: CheckItem[];
}

const CATEGORIES: CheckCategory[] = [
  {
    id: 'lage',
    label: 'Lage (Makro & Mikro)',
    icon: <MapPin size={15} />,
    color: 'text-blue-600',
    items: [
      { id: 'wirtschaft',    label: 'Wirtschaft & Arbeitsmarkt',       detail: 'Wirtschaftsstruktur der Region, Arbeitslosenquote, große Arbeitgeber, Pendlerströme.' },
      { id: 'demografie',    label: 'Bevölkerungsentwicklung',          detail: 'Bevölkerungsprognose (mind. 10 Jahre), Wanderungssaldo, Altersstruktur.' },
      { id: 'infrastruktur', label: 'Infrastruktur (Makrolage)',       detail: 'Autobahnanbindung, ICE/Bahnhof, Flughafen-Nähe, regionale Bedeutung.' },
      { id: 'oepnv',         label: 'ÖPNV-Anbindung (Mikrolage)',     detail: 'Entfernung zu Bus/U-Bahn/S-Bahn-Haltestelle. Ideale Gehzeit: < 5 Min.', warning: 'Schlechte ÖPNV-Anbindung senkt die erzielbaren Mieten.' },
      { id: 'laerm',         label: 'Lärmbelastung & Emissionen',     detail: 'Lärmkartierung prüfen (Straße, Schiene, Gewerbe). Flugroute beachten.' },
      { id: 'versorgung',    label: 'Nahversorgung',                   detail: 'Supermarkt, Arzt, Apotheke, Schule in Gehweite.' },
      { id: 'entwicklung',   label: 'Stadtentwicklungsplanung',        detail: 'B-Pläne, Bebauungspläne, geplante Straßenprojekte prüfen.' },
    ],
  },
  {
    id: 'bausubstanz',
    label: 'Bausubstanz & Zustand',
    icon: <Building size={15} />,
    color: 'text-orange-600',
    items: [
      { id: 'dach',         label: 'Dach & Dachstuhl',              detail: 'Alter, Zustand, letzte Sanierung, Restwert schätzen. Flachdach besonders kritisch.' },
      { id: 'fassade',      label: 'Fassade & Außenwand',           detail: 'WDVS vorhanden? Risse, Feuchtigkeit, Putz? GEG-Relevanz (Dämmung).' },
      { id: 'leitungen',    label: 'Rohrleitungen & Elektrik',      detail: 'Alter der Leitungen, Kupfer oder Blei? Elektrik auf aktuellem Stand (FI-Schutz)?' },
      { id: 'fenster',      label: 'Fenster & Türen',              detail: 'Zweifach/Dreifachverglasung, Alter, Dichtigkeit, Schallschutz.' },
      { id: 'heizung',      label: 'Heizungsanlage',               detail: 'Alter, Typ, Wirkungsgrad. Ölkessel > 30 J.: Austauschpflicht bei Eigentümerwechsel (GEG 2026).', warning: 'Alter Ölkessel: 2-Jahres-Austauschpflicht nach Eigentümerwechsel!' },
      { id: 'keller',       label: 'Keller & Feuchtigkeitsschäden', detail: 'Kellerfeuchte, Schimmel, Altlasten im Boden prüfen (Bodenanalyse).', warning: 'Schimmel und Feuchtigkeitsschäden können teuer werden.' },
      { id: 'sanierungsstau', label: 'Sanierungsstau bewerten',     detail: 'Liste aller erkennbaren Mängel erstellen und grob kalkulieren. Einfluss auf Kaufpreis verhandeln.' },
    ],
  },
  {
    id: 'rechtlich',
    label: 'Rechtliche Prüfung',
    icon: <Scale size={15} />,
    color: 'text-purple-600',
    items: [
      { id: 'grundbuch-abt2', label: 'Grundbuch Abt. II (Lasten)',      detail: 'Wegerechte, Leitungsrechte, Vorkaufsrechte, Reallast, Erbbaurecht prüfen. Alle Einträge klären!' },
      { id: 'grundbuch-abt3', label: 'Grundbuch Abt. III (Hypotheken)', detail: 'Bestehende Grundschulden/Hypotheken müssen im Kaufvertrag zur Löschung gebracht werden.' },
      { id: 'baulasten',     label: 'Baulastenverzeichnis',              detail: 'Beim Bauordnungsamt anfragen. Abstandsflächenübernahmen, Geh-/Fahrt-/Leitungsrechte.' },
      { id: 'teilungserklaerung', label: 'Teilungserklärung (ETW)',      detail: 'Sondereigentum und Gemeinschaftseigentum genau abgrenzen. Stellplatz/Keller zugeordnet?' },
      { id: 'weg-protokolle',  label: 'WEG-Protokolle (mind. 3 Jahre)', detail: 'Beschlüsse, Streitigkeiten, beschlossene/geplante Sonderumlagen, Zustand der Gemeinschaft.', warning: 'Beschlossene Sonderumlagen werden vom Käufer übernommen!' },
      { id: 'mietvertrag',   label: 'Bestehender Mietvertrag prüfen',   detail: 'Miethöhe vs. Markt, Laufzeit, Kündigung, Zustand Mietverhältnis, Mieterbonität, Kaution.' },
      { id: 'eigenbedarfskuendigung', label: 'Eigenbedarfskündigung',   detail: 'Verkauf inklusive Mieter: 3 Jahre Kündigungsschutz bei sofortigem Eigennutzungswillen (§ 577a BGB). Macht Eigennutzung schwerer.' },
    ],
  },
  {
    id: 'weg-finanzen',
    label: 'WEG-Finanzen',
    icon: <Users size={15} />,
    color: 'text-green-600',
    items: [
      { id: 'erhaltungsruecklage', label: 'Erhaltungsrücklage (Höhe & Entwicklung)', detail: 'Aktueller Stand der Erhaltungsrücklage, monatliche Einzahlung, Entwicklung der letzten 3 Jahre. Niedrige Rücklage = Sonderumlagen-Risiko.', warning: 'Zu niedrige Rücklage → Sonderumlagenrisiko.' },
      { id: 'sonderumlagen',  label: 'Beschlossene Sonderumlagen',        detail: 'Im WEG-Protokoll und Wirtschaftsplan nachschauen. Beschlossene Umlagen gehen auf Käufer über!' },
      { id: 'hausgeld',       label: 'Hausgeld-Entwicklung',              detail: 'Wie hat sich das Hausgeld in den letzten 5 Jahren entwickelt? Stark steigendes Hausgeld = Warnsignal.' },
      { id: 'verwalterqualitaet', label: 'Qualität der WEG-Verwaltung', detail: 'Erreichbarkeit, Reaktionszeiten, professionelles Auftreten im Protokoll.' },
    ],
  },
  {
    id: 'energie',
    label: 'Energie & GEG 2026',
    icon: <Zap size={15} />,
    color: 'text-yellow-600',
    items: [
      { id: 'energieausweis', label: 'Energieausweis prüfen',            detail: 'Verbrauchsausweis (weniger aussagekräftig) oder Bedarfsausweis? Energieklasse, Primärenergiebedarf.' },
      { id: 'geg-pflichten',  label: 'GEG-Bestandspflichten 2026',       detail: 'Dämmung der obersten Geschossdecke und zugänglichen Rohre (§ 47–48 GEG). 2-Jahres-Frist für alte Konstanttemperaturkessel bei Eigentümerwechsel (§ 72 GEG).', warning: 'Heizungstausch-Pflicht: Bei Eigentümerwechsel 2 Jahre Frist für alte Konstanttemperaturkessel!' },
      { id: 'gmodg',          label: 'GModG Reform (avisiert Nov. 2026)', detail: 'Das geplante Gebäude-Modernisierungs-Gesetz ersetzt die starre 65-%-Regel. Kommunale Wärmeplanung beachten. App-Hinweis: Stand kann sich ändern!', warning: 'Reform noch nicht in Kraft – Stand beobachten!' },
      { id: 'warmepflicht',   label: 'Kommunale Wärmeplanung',           detail: 'Viele Gemeinden erstellen Wärmeplanung. Für das Objekt relevante Infrastruktur (Fernwärme-Ausbau) prüfen.' },
      { id: 'sanierungspflicht', label: 'Absehbare Sanierungspflichten', detail: 'EU-Gebäuderichtlinie (EPBD): mögliche Mindestenergieklassen für Bestandsgebäude. Timing und Kosten abschätzen.' },
    ],
  },
];

export function DueDiligencePage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CATEGORIES.map(c => [c.id, true]))
  );
  const [notes, setNotes] = useState<Record<string, string>>({});

  const toggle = (id: string) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleCat = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const totalItems = CATEGORIES.reduce((s, c) => s + c.items.length, 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress = Math.round((checkedCount / totalItems) * 100);

  return (
    <div className="space-y-5">
      <SectionTitle sub="Qualitative Prüfpunkte vor dem Kauf. Jeder Punkt ist mit Erklärung und Warnhinweisen versehen.">
        Due Diligence Checkliste
      </SectionTitle>

      {/* Progress */}
      <Card>
        <CardBody className="py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Fortschritt: {checkedCount}/{totalItems} Punkte geprüft</span>
                <span>{progress} %</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="text-lg font-bold text-slate-700 shrink-0">{progress} %</div>
          </div>
        </CardBody>
      </Card>

      {/* Disclaimer */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
        <strong>Wichtig:</strong> Diese Checkliste dient der strukturierten Prüfung, ersetzt aber kein unabhängiges Sachverständigengutachten. Beauftragen Sie vor dem Kauf einen qualifizierten Gutachter.
      </div>

      {/* Categories */}
      {CATEGORIES.map(cat => {
        const catChecked = cat.items.filter(i => checked[i.id]).length;
        const isExpanded = expanded[cat.id];
        return (
          <Card key={cat.id}>
            <CardHeader>
              <button
                onClick={() => toggleCat(cat.id)}
                className="w-full flex items-center gap-3 text-left"
              >
                <span className={cat.color}>{cat.icon}</span>
                <CardTitle className="flex-1">{cat.label}</CardTitle>
                <span className="text-xs text-slate-400">{catChecked}/{cat.items.length}</span>
                <span className="text-slate-400">{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
              </button>
            </CardHeader>
            {isExpanded && (
              <CardBody className="space-y-2">
                {cat.items.map(item => (
                  <div key={item.id} className="border border-slate-100 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggle(item.id)}
                        className="mt-0.5 shrink-0 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {checked[item.id]
                          ? <CheckCircle2 size={18} className="text-green-500" />
                          : <Circle size={18} />
                        }
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${checked[item.id] ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                        {item.warning && (
                          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                            <AlertTriangle size={11} className="shrink-0" />
                            {item.warning}
                          </div>
                        )}
                        <textarea
                          placeholder="Notizen..."
                          value={notes[item.id] ?? ''}
                          onChange={e => setNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                          className="mt-2 w-full text-xs border border-slate-200 rounded px-2 py-1.5 text-slate-600 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardBody>
            )}
          </Card>
        );
      })}
    </div>
  );
}
