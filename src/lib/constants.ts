import type { FederalState } from './types';

export const LAND_TRANSFER_TAX: Record<FederalState, { rate: number; since: string; note?: string }> = {
  BW: { rate: 5.0,  since: '2011-11-05' },
  BY: { rate: 3.5,  since: '1997-01-01', note: 'Niedrigster Satz bundesweit' },
  BE: { rate: 6.0,  since: '2014-01-01' },
  BB: { rate: 6.5,  since: '2015-07-01' },
  HB: { rate: 5.5,  since: '2025-07-01', note: 'Seit 01.07.2025 (zuvor 5,0 %)' },
  HH: { rate: 5.5,  since: '2009-01-01' },
  HE: { rate: 6.0,  since: '2013-08-01' },
  MV: { rate: 6.0,  since: '2019-07-01' },
  NI: { rate: 5.0,  since: '2014-01-01' },
  NW: { rate: 6.5,  since: '2015-01-01' },
  RP: { rate: 5.0,  since: '2012-03-01' },
  SL: { rate: 6.5,  since: '2015-01-01' },
  SN: { rate: 5.5,  since: '2023-01-01', note: 'Seit 01.01.2023 (zuvor 3,5 %)' },
  ST: { rate: 5.0,  since: '2012-03-01' },
  SH: { rate: 6.5,  since: '2014-01-01' },
  TH: { rate: 5.0,  since: '2024-01-01', note: 'Seit 01.01.2024 gesenkt (von 6,5 %)' },
};

export const FEDERAL_STATE_NAMES: Record<FederalState, string> = {
  BW: 'Baden-Württemberg',
  BY: 'Bayern',
  BE: 'Berlin',
  BB: 'Brandenburg',
  HB: 'Bremen',
  HH: 'Hamburg',
  HE: 'Hessen',
  MV: 'Mecklenburg-Vorpommern',
  NI: 'Niedersachsen',
  NW: 'Nordrhein-Westfalen',
  RP: 'Rheinland-Pfalz',
  SL: 'Saarland',
  SN: 'Sachsen',
  ST: 'Sachsen-Anhalt',
  SH: 'Schleswig-Holstein',
  TH: 'Thüringen',
};

export const AFA = {
  LINEAR_ALTBAU:  0.025,  // < 1925
  LINEAR_STANDARD: 0.020, // 1925-2022
  LINEAR_NEUBAU:  0.030,  // >= 2023
  DEGRESSIVE:     0.050,  // § 7 Abs. 5a, Baubeginn 01.10.2023–30.09.2029
  SPECIAL_7B:     0.050,  // § 7b, 4 Jahre zusätzlich
};

export const SPEKULATIONSFRIST_YEARS = 10;

export const LAND_TRANSFER_TAX_BAGATELL = 2500; // § 3 Nr. 1 GrEStG

// ─── Demo-Objekt: ETW Chemnitz – attraktive B-Lage, positiver Cashflow ───────
// Kaufpreisfaktor ~15x, Nettomietrendite ~4,8 %, DSCR >1,3, CF nach Steuer positiv
export const DEFAULT_PROPERTY = {
  purchasePrice: 110000,
  livingArea: 75,
  rooms: 3,
  constructionYear: 1995,
  propertyType: 'ETW' as const,
  condition: 'Saniert' as const,
  federalState: 'SN' as const,   // Sachsen: 5,5 % GrESt (günstiger als NRW)
  landValueShare: 15,             // niedriger Bodenanteil in Chemnitz
  energyValue: 90,
  heatingType: 'Fernwaerme' as const,
  address: 'Musterstraße 12, 09111 Chemnitz',
};

export const DEFAULT_RENTAL = {
  monthlyRent: 600,              // 8 €/m² – marktüblich für Chemnitz
  rentIncreasePA: 2.0,
  vacancyRate: 2.0,
  mietpreisbremseActive: false,
};

export const DEFAULT_FINANCING = {
  equity: 40000,                 // ~33 % EK → LTV ~73 %  → gute Zinskonditionen
  loanAmountOverride: 0,
  interestRate: 3.3,             // gute Kondition dank niedrigem LTV
  fixedRatePeriod: 15,
  initialRepaymentRate: 2.0,
  specialRepaymentPA: 0,
  useKfw: false,
  kfwProgram: '',
  kfwAmount: 0,
  kfwInterestRate: 2.5,
  kfwRepaymentGrant: 0,
};

export const DEFAULT_TAX = {
  marginalTaxRate: 42,
  buildingShare: 80,
  purchaseContractDate: '2024-03-01',
  useDegressiveAfa: false,
  useSpecialAfa7b: false,
  shorterUsefulLife: 0,
  holdingPeriod: 20,
  annualAppreciationRate: 2.0,   // Chemnitz: Aufwertungstrend
};

export const DEFAULT_ADDITIONAL_COSTS = {
  landTransferTaxOverride: 0,
  notaryFeePercent: 1.5,
  brokerFeePercent: 1.5,         // verhandelter Maklersatz (nicht 3,57 %)
  surveyorCost: 500,             // Gutachter empfohlen
  financingCost: 0,
  renovationBudget: 0,
  managementCostMonthly: 25,
  maintenanceCostPerSqm: 11,
  wegMonthlyContribution: 40,
  otherNonAllocableCosts: 150,
};
