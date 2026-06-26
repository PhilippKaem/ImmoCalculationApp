# Anforderungskatalog – Immobilien-Kalkulationsapp

**Version 2.0 (final, nach unabhängigem Review)**  
**Erstellt am: 26. Juni 2026**  
**Markt: Deutschland · Vermietung**

---

## Über dieses Dokument

Dieser Anforderungskatalog spezifiziert eine Anwendung, die für eine vermietete Immobilie (Kapitalanlage in Deutschland) sämtliche Anschaffungs- und laufenden Kosten transparent berechnet, jede Position verständlich erklärt und am Ende eine nachvollziehbare Kauf-Empfehlung ausspricht.

**Entstehung:** Der Katalog wurde in zwei Stufen erstellt. Zunächst entstand auf Basis einer Marktrecherche ein Entwurf (v1). Dieser wurde anschließend von einem unabhängigen Fachgutachter mit eigener Recherche kritisch geprüft. Die vorliegende Version 2.0 enthält alle bestätigten Anforderungen sowie die fachlich korrigierten und ergänzten Punkte. Wesentliche Änderungen sind in Kapitel 10 (Änderungsprotokoll) zusammengefasst.

> **Hinweis:** Dieses Dokument ist eine fachliche Spezifikation, keine Steuer- oder Anlageberatung. Steuersätze, Förderprogramme und gesetzliche Pflichten ändern sich häufig; die App muss diese mit Stichtag pflegen.

---

## 1. Grundprinzipien der App

- **AF-1.1 Transparenz:** Jede Kennzahl und jeder Kostenpunkt wird mit Formel, Annahme und Quelle erklärt (Kurz-Tooltip plus ausführliche Erklärseite).
- **AF-1.2 Nachvollziehbarkeit:** Alle Eingaben sind editierbar; Default-Werte (z. B. Bewirtschaftungskosten) sind als Annahme gekennzeichnet und überschreibbar.
- **AF-1.3 Szenarien:** Mindestens drei parallele Szenarien (pessimistisch / realistisch / optimistisch) für Zins, Mietsteigerung, Wertentwicklung und Mietausfall. Inflations- bzw. Realzinsannahme als eigener Szenarioparameter (reale Entwertung der Restschuld als Pluspunkt).
- **AF-1.4 Empfehlung:** Klares Ampel-Ergebnis (Kaufen / Bedingt / Nicht kaufen) mit Begründung und den wichtigsten Stellhebeln.
- **AF-1.5 Speicherbarkeit & Vergleich:** Objekte speichern, side-by-side vergleichen und exportieren (PDF/Excel).
- **AF-1.6 Rechtsstand-Versionierung:** Jede Berechnung dokumentiert den zugrunde gelegten Steuer- und Förderstand (Stichtag) und gibt ihn im Export aus (Nachvollziehbarkeit/Haftung).

---

## 2. Eingabedaten (Inputs)

### 2.1 Objekt- & Stammdaten

- **AF-2.1.1 Kaufpreis:** Kaufpreis in Euro.
- **AF-2.1.2 Objektkennzahlen:** Wohnfläche (m²), Zimmeranzahl, Fertigstellungsjahr.
- **AF-2.1.3 Objektart & Lage:** Objektart (ETW / MFH / Haus), Zustand, Bundesland (steuert Grunderwerbsteuersatz).
- **AF-2.1.4 Grundstücksanteil:** Bodenrichtwert / Grundstücksanteil für die Aufteilung Gebäude vs. Grund und Boden (AfA-Bemessung).
- **AF-2.1.5 Energie/GEG:** Energiekennwert, Heizungsart, Sanierungsstand (GEG-Relevanz, vgl. AF-7.5).

### 2.2 Mietdaten

- **AF-2.2.1 Miete:** Ist-Kaltmiete bzw. erzielbare Marktmiete (€/Monat).
- **AF-2.2.2 Mietrecht:** Hinweisfeld Mietpreisbremse / örtlicher Mietspiegel.
- **AF-2.2.3 Mietsteigerung:** Erwartete Mietsteigerung p. a. (%).
- **AF-2.2.4 Mietausfall:** Leerstands-/Mietausfallquote (% der Jahresmiete).

### 2.3 Finanzierung

- **AF-2.3.1 Eigenkapital:** Eingesetztes Eigenkapital (€).
- **AF-2.3.2 Darlehen:** Darlehenssumme, Sollzins (%), Zinsbindung (Jahre).
- **AF-2.3.3 Tilgung:** Anfänglicher Tilgungssatz (%), Sondertilgungsoption (€/% p. a.).
- **AF-2.3.4 Beleihungsauslauf:** Darlehen / Kaufpreis – beeinflusst die Zinskondition.
- **AF-2.3.5 Förderung:** Optionale KfW-/Förderdarlehen (Programm, Zinssatz, Tilgungszuschuss); Förderzusagen als zeitkritisch/unsicher flaggen (vgl. AF-8.3).

### 2.4 Steuerliche Angaben

- **AF-2.4.1 Grenzsteuersatz:** Persönlicher Grenzsteuersatz (%) bzw. zu versteuerndes Einkommen.
- **AF-2.4.2 AfA-Grunddaten:** Fertigstellungsjahr UND Anschaffungs-/Kaufvertragsdatum (das Kaufvertrags- bzw. Baubeginndatum entscheidet über degressive AfA, vgl. AF-5.6) sowie Gebäudeanteil am Kaufpreis.
- **AF-2.4.3 Kürzere Nutzungsdauer:** Optionale Eingabe einer per Gutachten nachgewiesenen kürzeren tatsächlichen Nutzungsdauer (§ 7 Abs. 4 S. 2 EStG) für einen höheren AfA-Satz.
- **AF-2.4.4 Haltedauer:** Geplante Haltedauer (Jahre) – relevant für Spekulationsfrist (10 Jahre, § 23 EStG) und Exit-Rechnung (vgl. AF-5.9).

---

## 3. Kaufnebenkosten (einmalig)

- **AF-3.1 Grunderwerbsteuer:** Automatisch nach Bundesland (3,5 % – 6,5 %) aus einem versionierten Register mit Gültigkeitsdatum (Sätze ändern sich häufig).

| Bundesland | Satz | Hinweis |
|---|---|---|
| Bayern | 3,5 % | Niedrigster Satz |
| Sachsen | 5,5 % | Seit 01.01.2023 (zuvor 3,5 %) |
| Thüringen | 5,0 % | Seit 01.01.2024 gesenkt (von 6,5 %) |
| Bremen | 5,5 % | Seit 01.07.2025 (zuvor 5,0 %) |
| NRW / Brandenburg / SH | 6,5 % | Höchstsätze |

- **AF-3.2 Notar & Grundbuch:** ca. 1,1 – 1,5 % vom Kaufpreis (bundeseinheitlich nach GNotKG).
- **AF-3.3 Maklerprovision:** Einstellbar (0 – 3,57 % inkl. USt Käuferanteil); bei ETW/EFH i. d. R. hälftige Teilung nach § 656c/d BGB. Als verhandelbar markieren.
- **AF-3.4 Weitere Nebenkosten:** Gutachter/Sachverständiger, Finanzierungs-/Bereitstellungskosten, ggf. Modernisierungsbudget direkt nach Kauf.
- **AF-3.5 Summe & Faustregel:** Gesamt-Kaufnebenkosten als % anzeigen (typisch 10 – 15 %) und mit Faustregel vergleichen. Kaufnebenkosten sind „verlorenes Eigenkapital" und fließen in die Renditebasis ein.
- **AF-3.6 Freibetrag:** Grunderwerbsteuer-Bagatellgrenze 2.500 € (§ 3 Nr. 1 GrEStG) berücksichtigen.
- **AF-3.7 Anschaffungsnaher Aufwand:** Warnung: Modernisierung innerhalb der ersten drei Jahre kann als anschaffungsnaher Herstellungsaufwand gelten (15 %-Netto-Grenze, § 6 Abs. 1 Nr. 1a EStG) und ist dann nicht sofort, sondern nur über die AfA absetzbar (Verknüpfung mit AF-8.4).

---

## 4. Laufende Kosten (jährlich)

### 4.1 Nicht umlagefähige Bewirtschaftungskosten

- **AF-4.1.1 Hausverwaltung:** WEG-Verwalterhonorar (gegenüber Mieter nicht umlagefähig, beim Vermieter aber als Werbungskosten abziehbar – beide Dimensionen getrennt führen, vgl. AF-4.4).
- **AF-4.1.2 Instandhaltung – Realkosten:** Kalkulatorischer Instandhaltungsbedarf (z. B. nach Peters'cher Formel, €/m²/Jahr) für die Renditeechtheit.
- **AF-4.1.3 WEG-Erhaltungsrücklage – steuerlich getrennt:** Die Zahlung in die WEG-Erhaltungsrücklage ist im Cashflow ein Abfluss heute, steuerlich aber erst als Werbungskosten abziehbar, wenn die WEG das Geld tatsächlich für Erhaltungsmaßnahmen verausgabt (BFH, Urteil v. 14.01.2025, IX R 19/24). Die App muss Cashflow-Wirkung und Steuerwirkung dieser Position daher unterschiedlich behandeln.
- **AF-4.1.4 Mietausfallwagnis:** Pauschaler Ansatz (% der Jahresmiete) zusätzlich zur konkreten Leerstandsannahme.
- **AF-4.1.5 Sonstiges:** Nicht umlagefähige Betriebskosten, Kontoführung, Versicherungsanteile.
- **AF-4.1.6 Sonderumlage-Risiko:** Hinweis auf beschlossene/absehbare Sonderumlagen aus Protokollen der Eigentümerversammlung.

### 4.2 Umlagefähige Kosten (Hinweis)

- **AF-4.2.1 Umlagefähige Betriebskosten:** Grundsteuer, Müll, Wasser, Hausmeister etc. – auf Mieter umlegbar, aber bei Leerstand trägt der Eigentümer das Risiko.

### 4.3 Kapitaldienst

- **AF-4.3.1 Annuität & Tilgungsplan:** Annuität (Zins + Tilgung) mit Aufteilung Zins-/Tilgungsanteil über die Zeit.
- **AF-4.3.2 Restschuld & Anschluss:** Restschuld am Ende der Zinsbindung plus Anschlussfinanzierungs-Risiko (Zinsänderungsszenarien).

### 4.4 Doppelte Kostenlogik

- **AF-4.4.1 Umlagefähig vs. steuerlich abziehbar:** Jede Kostenposition wird auf zwei Achsen geführt: (a) umlagefähig auf den Mieter ja/nein und (b) steuerlich als Werbungskosten abziehbar ja/nein. Beides ist nicht deckungsgleich (Beispiel Verwalterkosten).

---

## 5. Kennzahlen & Berechnungslogik

- **AF-5.1 Bruttomietrendite:** Jahreskaltmiete / Kaufpreis.
- **AF-5.2 Nettomietrendite:** (Jahreskaltmiete − nicht umlagefähige Kosten) / (Kaufpreis + Kaufnebenkosten).
- **AF-5.3 Kaufpreisfaktor:** Kaufpreis / Jahreskaltmiete (Vervielfältiger).
- **AF-5.4 Cap Rate:** Net Operating Income (NOI) / Kaufpreis – internationaler Bewertungsstandard, zusätzlich zur Nettomietrendite.
- **AF-5.5 Cashflow (vor & nach Steuern):** Mieteinnahmen − Bewirtschaftung − Kapitaldienst (− Steuer). Cashflow nach Steuern als eigenständige Hauptkennzahl.
- **AF-5.6 DSCR:** Debt Service Coverage Ratio = NOI / Kapitaldienst (Banken-/Risikokennzahl; Zielwert ≥ 1,1 – 1,2).
- **AF-5.7 Eigenkapitalrendite (ROE):** (Cashflow nach Steuern + Tilgungsanteil + ggf. Wertänderung) / eingesetztes Eigenkapital, wobei eingesetztes EK = EK + Kaufnebenkosten. Bestandteile (Tilgung, Wertsteigerung) transparent ausweisen, da sie die Kennzahl stark verändern.
- **AF-5.8 Steuerberechnung & AfA:** AfA, Schuldzinsen und Werbungskosten gegen Mieteinnahmen; Steuerersparnis/-last zum Grenzsteuersatz. AfA-Logik:

| AfA-Art | Satz | Voraussetzung / Hinweis |
|---|---|---|
| Linear Altbau | 2,5 % | Wohngebäude Fertigstellung vor 1925 (40 Jahre) |
| Linear Standard | 2,0 % | Fertigstellung 1925 – 2022 (50 Jahre) |
| Linear Neubau | 3,0 % | Fertigstellung ab 01.01.2023 (33,3 Jahre) |
| Degressiv | 5,0 % | Vom Restwert, § 7 Abs. 5a EStG; Baubeginn 01.10.2023 – 30.09.2029; Wechsel zu linear möglich |
| Sonder-AfA Neubau | +5,0 % | § 7b EStG, 4 Jahre zusätzlich; Effizienz EH40/QNG, Baukostengrenzen; mit degressiv kombinierbar |
| Kürzere ND | individuell | § 7 Abs. 4 S. 2 EStG bei nachgewiesener kürzerer Nutzungsdauer (Gutachten) |

- **AF-5.9 Exit-Rechnung mit Spekulationssteuer:** Verkaufsszenario am Ende der Haltedauer: bei Verkauf innerhalb von 10 Jahren (§ 23 EStG) ist der Veräußerungsgewinn zum Grenzsteuersatz steuerpflichtig, danach steuerfrei. Wichtig: Die in Anspruch genommene AfA mindert die Anschaffungskosten und erhöht damit den steuerpflichtigen Veräußerungsgewinn. Verkaufsnebenkosten einrechnen.
- **AF-5.10 Gesamtrendite / IRR:** Interner Zinsfuß über die Haltedauer inkl. laufender Cashflows, Tilgungsgewinn und Exit. Verkaufswert mit und ohne Wertsteigerung getrennt ausweisen (die Wertannahme dominiert das Ergebnis). Vergleich zur Alternativanlage nach Steuern (z. B. ETF).
- **AF-5.11 Break-even & Stresstests:** Break-even-Miete und Break-even-Zins: ab welchem Wert kippt der Cashflow ins Negative.

---

## 6. Bewertungs- & Empfehlungslogik

- **AF-6.1 Schwellenwerte (lageabhängig):** Konfigurierbare Zielwerte mit lageabhängigen Default-Bandbreiten statt fester KO-Zahlen (z. B. Nettomietrendite in A-Lagen 2,5 – 3 %, in B/C-Lagen 4 – 5 %+; Faktor; DSCR ≥ 1,1).
- **AF-6.2 Scoring:** Gewichtetes Punktesystem über Rendite, Cashflow, Lage, Zustand und Risiko.
- **AF-6.3 Cashflow differenziert:** Negativer Cashflow VOR Tilgung ist ein echtes Warnsignal. Negativer Cashflow nur aufgrund hoher Tilgung (Vermögensaufbau) wird differenziert dargestellt und nicht hart als KO gewertet.
- **AF-6.4 Leverage-Risiko:** Die App modelliert explizit: der Hebel erhöht die EK-Rendite nur, solange Objektrendite > Sollzins (positiver Leverage). Bei Zins > Objektrendite kehrt sich der Effekt um – Warnung vor „schöngerechneter" EK-Rendite durch hohen Hebel.
- **AF-6.5 Risiko-Flags:** Negativer Cashflow vor Tilgung, hoher Faktor, Sanierungsstau, Anschlussfinanzierungsrisiko, Klumpenrisiko, Drei-Objekt-Grenze (vgl. AF-8.6).
- **AF-6.6 Ampel-Empfehlung:** Kaufen / Bedingt / Nicht kaufen mit Textbegründung und den Top-3-Stellhebeln.
- **AF-6.7 Sensitivität:** Zeigt, welche Eingabe das Ergebnis am stärksten verändert.

---

## 7. Qualitative Prüfpunkte (Due Diligence)

- **AF-7.1 Lage:** Makrolage (Wirtschaft, Demografie, Infrastruktur) und Mikrolage (ÖPNV, Lärm, Nahversorgung).
- **AF-7.2 Bausubstanz:** Dach, Fassade, Leitungen, Fenster, Heizung; Sanierungsstau bewerten.
- **AF-7.3 Rechtliches:** Grundbuch (Abt. II/III), Baulasten, Wegerechte, Teilungserklärung, WEG-Protokolle.
- **AF-7.4 WEG-Finanzen:** Höhe der Erhaltungsrücklage, beschlossene Sonderumlagen, Hausgeldhistorie.
- **AF-7.5 Energie/GEG (Stand 2026):** Energetischer Zustand und absehbare Pflichten. Achtung Aktualität: Die geplante GEG-Reform (Gebäude-Modernisierungs-Gesetz, Inkrafttreten avisiert Nov. 2026) soll die starre 65-%-Regel ablösen; Bestandspflichten (Dämmung oberste Geschossdecke/Rohre, Austausch alter Konstanttemperaturkessel > 30 J., 2-Jahres-Frist bei Eigentümerwechsel) und die kommunale Wärmeplanung bleiben relevant. Die App darf die 65-%-Pflicht nicht als Dauerzustand darstellen.
- **AF-7.6 Mietverhältnis:** Bestehender Mietvertrag, Miethöhe vs. Markt, Mieterbonität; Modernisierungsumlage nach § 559 BGB (8 % p. a., Kappung) als Gegenposition zu Sanierungskosten.

---

## 8. Sparhebel

- **AF-8.1 Grunderwerbsteuer / Inventar:** Bewegliches Inventar (Einbauküche, Möbel) separat im Kaufvertrag ausweisen, da es nicht der Grunderwerbsteuer unterliegt. Grenzen: bis ca. 15 % des Kaufpreises prüft das Finanzamt i. d. R. nicht detailliert; ab ~50.000 € bzw. > 15 % drohen Nachweispflicht und Korrektur. Werte müssen realen Marktwerten entsprechen. Zielkonflikt transparent machen: Inventar mindert die AfA-Basis des Gebäudes.
- **AF-8.2 Maklerprovision:** Verhandeln bzw. provisionsfreie Objekte bevorzugen.
- **AF-8.3 Finanzierung & Förderung:** Konditionsvergleich, Beleihungsauslauf optimieren, Sondertilgungsrechte. KfW-Programme (z. B. 261, 458) gelten auch für vermietete Objekte; Hinweis 2026: gekürzte Budgets, Förderzusagen zeit-/budgetkritisch flaggen.
- **AF-8.4 Steuer / AfA:** Gebäudeanteil realistisch und belegbar ansetzen (Gutachten statt reinem BMF-Aufteilungstool bei hochpreisigen/sanierten Lagen; BFH IX R 26/19: BMF-Tool nicht bindend, aber Plausibilität erforderlich). Kürzere Nutzungsdauer per Gutachten nutzen. Erhaltungsaufwand vs. Herstellungskosten beachten (15 %-Falle, vgl. AF-3.7). Werbungskosten vollständig erfassen.
- **AF-8.5 Bewirtschaftung:** Verwalter- und Versicherungskosten vergleichen; Instandhaltung vorausschauend planen.
- **AF-8.6 Drei-Objekt-Grenze (Warnung):** Mehr als drei Objektverkäufe innerhalb von fünf Jahren begründen i. d. R. gewerblichen Grundstückshandel: die 10-Jahres-Steuerfreiheit entfällt und es fällt zusätzlich Gewerbesteuer an. Als KO-Risiko-Flag für Mehrfach-Investoren abbilden.

---

## 9. Nicht-funktionale Anforderungen

- **AF-9.1 Plattform:** Web/Mobile, responsive.
- **AF-9.2 Datenaktualität:** Steuersätze und Förderprogramme zentral pflegbar mit Stichtag (häufige Änderungen bei GrESt, AfA, Förderung).
- **AF-9.3 Disclaimer:** Keine Steuer-/Anlageberatung; Hinweis auf Fachberatung.
- **AF-9.4 Export:** PDF-Report und Excel-Export inkl. zugrunde gelegtem Rechtsstand (vgl. AF-1.6).
- **AF-9.5 Datenschutz:** Lokale Speicherung / DSGVO-Konformität.

---

## 10. Änderungsprotokoll (v1 → v2 nach unabhängigem Review)

| Bereich | Änderung | Begründung |
|---|---|---|
| AfA (AF-5.8) | Sätze korrekt zugeordnet + degressive AfA 5 % und Sonder-AfA § 7b ergänzt | v1 mischte Kategorien, degressive AfA fehlte ganz |
| Erhaltungsrücklage (AF-4.1.3) | Cashflow- und Steuerwirkung getrennt | BFH IX R 19/24: Abzug erst bei Verausgabung |
| Exit (AF-5.9) | Spekulationssteuer inkl. AfA-Rückrechnung neu | Wesentlich für Gesamtrendite, fehlte |
| GrESt (AF-3.1) | Versioniertes Register, datierte Länderwerte | Sätze ändern sich häufig (z. B. Sachsen, Bremen) |
| Kennzahlen (AF-5.4/5.6) | Cap Rate, DSCR, After-Tax-KPI ergänzt | Wichtige Risiko-/Bewertungskennzahlen fehlten |
| Sparhebel (AF-8.4) | „Gebäudeanteil realistisch/belegbar" statt „so hoch wie möglich" | BFH IX R 26/19; Rechtsrisiko entschärft |
| GEG (AF-7.5) | Auf Stand 2026 aktualisiert (GModG, 65-%-Regel) | v1-Aussage veraltet |
| Drei-Objekt-Grenze (AF-8.6) | Neues Risiko-Flag | Gewerblicher Grundstückshandel als KO-Risiko |
| Empfehlung (AF-6.3/6.4) | Negativ-Cashflow differenziert, Leverage-Risiko | Vermeidung von Fehlschlüssen |
| Inventar (AF-8.1) | Aufgriffsgrenze ~15 %/50.000 € + AfA-Zielkonflikt | Legalität/Plausibilität absichern |
