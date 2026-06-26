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

export const DEFAULT_PROPERTY = {
  purchasePrice: 220000,
  livingArea: 68,
  rooms: 2.5,
  constructionYear: 1995,
  propertyType: 'ETW' as const,
  condition: 'Gepflegt' as const,
  federalState: 'NW' as const,
  landValueShare: 20,
  energyValue: 120,
  heatingType: 'Gas' as const,
  address: '',
};

export const DEFAULT_RENTAL = {
  monthlyRent: 780,
  rentIncreasePA: 2.0,
  vacancyRate: 2.0,
  mietpreisbremseActive: false,
};

export const DEFAULT_FINANCING = {
  equity: 55000,
  loanAmountOverride: 0,
  interestRate: 3.8,
  fixedRatePeriod: 10,
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
  purchaseContractDate: '2024-01-01',
  useDegressiveAfa: false,
  useSpecialAfa7b: false,
  shorterUsefulLife: 0,
  holdingPeriod: 20,
  annualAppreciationRate: 1.5,
};

export const DEFAULT_ADDITIONAL_COSTS = {
  landTransferTaxOverride: 0,
  notaryFeePercent: 1.5,
  brokerFeePercent: 3.57,
  surveyorCost: 0,
  financingCost: 0,
  renovationBudget: 0,
  managementCostMonthly: 30,
  maintenanceCostPerSqm: 10,
  wegMonthlyContribution: 50,
  otherNonAllocableCosts: 200,
};
