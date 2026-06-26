import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { CalculationResults, PropertyInput } from './types';
import { FEDERAL_STATE_NAMES } from './constants';

const fmt = (n: number, decimals = 0) =>
  n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const fmtEur = (n: number) => `${fmt(n)} €`;
const fmtPct = (n: number) => `${fmt(n, 1)} %`;

export function exportPDF(
  results: CalculationResults,
  property: PropertyInput,
  objectName: string,
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const today = new Date().toLocaleDateString('de-DE');

  // Header
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ImmoKalkulator', 14, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${objectName} · Rechtsstand: ${today}`, 14, 20);
  doc.text(`Bundesland: ${FEDERAL_STATE_NAMES[property.federalState]}`, 14, 25);

  // Disclaimer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(7);
  doc.text('Keine Steuer- oder Anlageberatung. Alle Angaben ohne Gewähr. Stand: ' + today, 14, 32);

  doc.setTextColor(0, 0, 0);

  // Recommendation
  const recColor: [number, number, number] =
    results.recommendation === 'kaufen' ? [22, 163, 74]
    : results.recommendation === 'bedingt' ? [217, 119, 6]
    : [220, 38, 38];
  const recText =
    results.recommendation === 'kaufen' ? 'KAUFEN'
    : results.recommendation === 'bedingt' ? 'BEDINGT'
    : 'NICHT KAUFEN';

  doc.setFillColor(...recColor);
  doc.roundedRect(14, 36, 60, 14, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`${recText}  (${results.score}/100)`, 44, 45, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(results.recommendationText, 80, 42, { maxWidth: 120 });

  // Kennzahlen table
  autoTable(doc, {
    startY: 56,
    head: [['Kennzahl', 'Wert']],
    body: [
      ['Kaufpreis', fmtEur(property.purchasePrice)],
      ['Gesamtinvestition', fmtEur(results.totalInvestment)],
      ['Kaufnebenkosten', `${fmtEur(results.totalPurchaseCosts)} (${fmtPct(results.purchaseCostRatio)})`],
      ['Darlehen', fmtEur(results.loanAmount)],
      ['Beleihungsauslauf', fmtPct(results.ltv)],
      ['Bruttomietrendite', fmtPct(results.grossRentalYield)],
      ['Nettomietrendite', fmtPct(results.netRentalYield)],
      ['Kaufpreisfaktor', `${fmt(results.purchasePriceFactor, 1)}x`],
      ['Cap Rate', fmtPct(results.capRate)],
      ['DSCR', fmt(results.dscr, 2)],
      ['Cashflow/Monat (nach Steuer)', fmtEur(results.cashflowAfterTax / 12)],
      ['Eigenkapitalrendite (ROE)', fmtPct(results.roe)],
      ['IRR (über Haltedauer)', fmtPct(results.irr)],
      ['Steuereffekt p.a.', fmtEur(results.taxEffect)],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 138] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
  });

  // Annual cashflow table
  const y2 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Jährlicher Cashflow (Jahr 1)', 14, y2);

  autoTable(doc, {
    startY: y2 + 3,
    head: [['Position', 'Betrag p.a.']],
    body: [
      ['Kaltmiete (brutto)', fmtEur(results.annualRent)],
      ['− Leerstandsverlust', fmtEur(-results.vacancyLossAnnual)],
      ['− Hausverwaltung', fmtEur(-results.managementCostAnnual)],
      ['− Instandhaltung', fmtEur(-results.maintenanceCostAnnual)],
      ['− WEG-Rücklage (Cashflow)', fmtEur(-results.wegReserveAnnual)],
      ['− Sonstige nicht umlagefähige Kosten', fmtEur(-results.otherNonAllocableCostsAnnual)],
      ['− Zinsen', fmtEur(-results.annualInterest)],
      ['− Tilgung', fmtEur(-results.annualRepayment)],
      ['= Cashflow vor Steuern', fmtEur(results.cashflowBeforeTax)],
      ['± Steuereffekt (AfA, Zinsen, Werbungskosten)', fmtEur(results.taxEffect)],
      ['= Cashflow nach Steuern', fmtEur(results.cashflowAfterTax)],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 138] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
  });

  // Exit
  const y3 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  doc.setFont('helvetica', 'bold');
  doc.text(`Exit-Analyse (Haltedauer: ${results.cashflowProjection.length} Jahre)`, 14, y3);

  autoTable(doc, {
    startY: y3 + 3,
    head: [['Position', 'Wert']],
    body: [
      ['Progn. Verkaufspreis', fmtEur(results.projectedSalePrice)],
      ['− Verkaufsnebenkosten (ca. 3,5 %)', fmtEur(-results.saleCosts)],
      ['− Spekulationssteuer', fmtEur(-results.speculativeTax)],
      ['− Restschuld', fmtEur(-(results.projectedSalePrice - results.equityAtExit - results.saleCosts - results.speculativeTax - results.netExitProceeds))],
      ['= Nettoveräußerungserlös', fmtEur(results.netExitProceeds)],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 138] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
  });

  doc.save(`ImmoKalkulator_${objectName.replace(/\s/g, '_')}_${today}.pdf`);
}

export function exportExcel(
  results: CalculationResults,
  property: PropertyInput,
  objectName: string,
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Kennzahlen
  const kpiData = [
    ['ImmoKalkulator – ' + objectName, ''],
    ['Stand', new Date().toLocaleDateString('de-DE')],
    ['', ''],
    ['KENNZAHLEN', ''],
    ['Kaufpreis', property.purchasePrice],
    ['Gesamtinvestition', results.totalInvestment],
    ['Kaufnebenkosten (€)', results.totalPurchaseCosts],
    ['Kaufnebenkosten (%)', results.purchaseCostRatio / 100],
    ['Eigenkapital', property.purchasePrice], // will be overridden
    ['Darlehen', results.loanAmount],
    ['Beleihungsauslauf', results.ltv / 100],
    ['Bruttomietrendite', results.grossRentalYield / 100],
    ['Nettomietrendite', results.netRentalYield / 100],
    ['Kaufpreisfaktor', results.purchasePriceFactor],
    ['Cap Rate', results.capRate / 100],
    ['DSCR', results.dscr],
    ['Cashflow p.a. (nach Steuer)', results.cashflowAfterTax],
    ['Cashflow/Monat (nach Steuer)', results.cashflowAfterTax / 12],
    ['ROE', results.roe / 100],
    ['IRR', results.irr / 100],
    ['Empfehlung', results.recommendation],
    ['Score', results.score],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(kpiData);
  ws1['!cols'] = [{ wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Kennzahlen');

  // Sheet 2: Cashflow-Projektion
  const cfHeader = ['Jahr', 'Effektive Miete', 'Bewirtschaftung', 'Kapitaldienst', 'Steuereffekt', 'CF nach Steuer', 'CF kumuliert', 'Immobilienwert', 'Restschuld', 'Eigenkapital'];
  const cfRows = results.cashflowProjection.map(r => [
    r.year, r.rent, -r.operatingCosts, -r.debtService, r.taxEffect,
    r.cashflowAfterTax, r.cumulativeCashflow, r.propertyValue, r.remainingLoan, r.totalEquity,
  ]);
  const ws2 = XLSX.utils.aoa_to_sheet([cfHeader, ...cfRows]);
  XLSX.utils.book_append_sheet(wb, ws2, 'Cashflow-Projektion');

  // Sheet 3: Tilgungsplan
  const amoHeader = ['Jahr', 'Schuldenstand Beginn', 'Zinsen', 'Tilgung', 'Rate gesamt', 'Schuldenstand Ende'];
  const amoRows = results.amortizationSchedule.slice(0, 35).map(r => [
    r.year, r.startBalance, r.interestPayment, r.repaymentPayment, r.totalPayment, r.endBalance,
  ]);
  const ws3 = XLSX.utils.aoa_to_sheet([amoHeader, ...amoRows]);
  XLSX.utils.book_append_sheet(wb, ws3, 'Tilgungsplan');

  // Sheet 4: Szenarien
  const scData = [
    ['', 'Pessimistisch', 'Realistisch', 'Optimistisch'],
    ['Mietsteigerung p.a.', results.scenarios.pessimistic.rentIncreasePA + '%', results.scenarios.realistic.rentIncreasePA + '%', results.scenarios.optimistic.rentIncreasePA + '%'],
    ['Leerstandsquote', results.scenarios.pessimistic.vacancyRate + '%', results.scenarios.realistic.vacancyRate + '%', results.scenarios.optimistic.vacancyRate + '%'],
    ['Anschlusszins', results.scenarios.pessimistic.interestRateAtRefinancing + '%', results.scenarios.realistic.interestRateAtRefinancing + '%', results.scenarios.optimistic.interestRateAtRefinancing + '%'],
    ['Wertsteigerung p.a.', results.scenarios.pessimistic.appreciationRate + '%', results.scenarios.realistic.appreciationRate + '%', results.scenarios.optimistic.appreciationRate + '%'],
    ['Nettomietrendite', fmtPct(results.scenarios.pessimistic.netRentalYield), fmtPct(results.scenarios.realistic.netRentalYield), fmtPct(results.scenarios.optimistic.netRentalYield)],
    ['CF p.a. Jahr 1', fmtEur(results.scenarios.pessimistic.cashflowAfterTaxY1), fmtEur(results.scenarios.realistic.cashflowAfterTaxY1), fmtEur(results.scenarios.optimistic.cashflowAfterTaxY1)],
    ['IRR', fmtPct(results.scenarios.pessimistic.irr), fmtPct(results.scenarios.realistic.irr), fmtPct(results.scenarios.optimistic.irr)],
    ['Score', results.scenarios.pessimistic.score, results.scenarios.realistic.score, results.scenarios.optimistic.score],
  ];
  const ws4 = XLSX.utils.aoa_to_sheet(scData);
  XLSX.utils.book_append_sheet(wb, ws4, 'Szenarien');

  const today = new Date().toLocaleDateString('de-DE').replace(/\./g, '-');
  XLSX.writeFile(wb, `ImmoKalkulator_${objectName.replace(/\s/g, '_')}_${today}.xlsx`);
}
