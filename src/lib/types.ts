export type PropertyType = 'ETW' | 'MFH' | 'Haus';
export type PropertyCondition =
  | 'Neubau'
  | 'KernSaniert'
  | 'Saniert'
  | 'Gepflegt'
  | 'Renovierungsbedarf'
  | 'Sanierungsstau';
export type HeatingType =
  | 'Fernwaerme'
  | 'Gas'
  | 'Waermepumpe'
  | 'Oel'
  | 'Pellet'
  | 'Direktstrom'
  | 'Sonstige';

export type FederalState =
  | 'BW' | 'BY' | 'BE' | 'BB' | 'HB' | 'HH'
  | 'HE' | 'MV' | 'NI' | 'NW' | 'RP' | 'SL'
  | 'SN' | 'ST' | 'SH' | 'TH';

export interface PropertyInput {
  purchasePrice: number;
  livingArea: number;
  rooms: number;
  constructionYear: number;
  propertyType: PropertyType;
  condition: PropertyCondition;
  federalState: FederalState;
  landValueShare: number;     // % of total value that is land (not building)
  energyValue: number;        // kWh/m²a
  heatingType: HeatingType;
  address: string;
}

export interface RentalInput {
  monthlyRent: number;
  rentIncreasePA: number;     // % per year
  vacancyRate: number;        // % of annual rent
  mietpreisbremseActive: boolean;
}

export interface FinancingInput {
  equity: number;
  loanAmountOverride: number; // 0 = auto-calculated
  interestRate: number;       // %
  fixedRatePeriod: number;    // years
  initialRepaymentRate: number; // %
  specialRepaymentPA: number; // €/year
  useKfw: boolean;
  kfwProgram: string;
  kfwAmount: number;
  kfwInterestRate: number;
  kfwRepaymentGrant: number;  // %
}

export interface TaxInput {
  marginalTaxRate: number;    // %
  buildingShare: number;      // % of total investment that is building
  purchaseContractDate: string; // ISO date, determines AfA type
  useDegressiveAfa: boolean;
  useSpecialAfa7b: boolean;
  shorterUsefulLife: number;  // years, 0 = not used
  holdingPeriod: number;      // years
  annualAppreciationRate: number; // % for exit / value calc
}

export interface AdditionalCostsInput {
  landTransferTaxOverride: number; // 0 = auto from state
  notaryFeePercent: number;   // 1.0–1.5 %
  brokerFeePercent: number;   // 0–3.57 %
  surveyorCost: number;       // €
  financingCost: number;      // €
  renovationBudget: number;   // €
  managementCostMonthly: number; // €/month
  maintenanceCostPerSqm: number; // €/m²/year
  wegMonthlyContribution: number; // €/month into reserve
  otherNonAllocableCosts: number; // €/year
}

export interface AmortizationEntry {
  year: number;
  startBalance: number;
  interestPayment: number;
  repaymentPayment: number;
  totalPayment: number;
  endBalance: number;
}

export interface ScenarioResult {
  name: string;
  rentIncreasePA: number;
  vacancyRate: number;
  interestRateAtRefinancing: number;
  appreciationRate: number;
  grossRentalYield: number;
  netRentalYield: number;
  cashflowAfterTaxY1: number;
  cashflowAfterTaxY10: number;
  roe: number;
  irr: number;
  netExitProceeds: number;
  score: number;
  recommendation: 'kaufen' | 'bedingt' | 'nicht-kaufen';
}

export type RiskFlagSeverity = 'warning' | 'critical';

export interface RiskFlag {
  id: string;
  title: string;
  description: string;
  severity: RiskFlagSeverity;
}

export interface CashflowProjectionEntry {
  year: number;
  rent: number;
  operatingCosts: number;
  debtService: number;
  taxEffect: number;
  cashflowAfterTax: number;
  cumulativeCashflow: number;
  propertyValue: number;
  remainingLoan: number;
  totalEquity: number;
}

export interface CalculationResults {
  // Purchase costs
  landTransferTax: number;
  notaryFees: number;
  brokerFee: number;
  surveyorCost: number;
  financingCost: number;
  renovationBudget: number;
  totalPurchaseCosts: number;
  totalInvestment: number;
  purchaseCostRatio: number;

  // Loan
  loanAmount: number;
  ltv: number;
  monthlyPayment: number;
  annualPayment: number;

  // Annual (Year 1)
  annualRent: number;
  effectiveAnnualRent: number;
  managementCostAnnual: number;
  maintenanceCostAnnual: number;
  wegReserveAnnual: number;
  vacancyLossAnnual: number;
  otherNonAllocableCostsAnnual: number;
  totalNonAllocableCosts: number;
  noi: number;
  annualInterest: number;
  annualRepayment: number;
  cashflowBeforeTax: number;

  // Tax
  afaRate: number;
  buildingValue: number;
  afaAmount: number;
  taxableIncome: number;
  taxEffect: number;
  cashflowAfterTax: number;
  annualTaxSavingsOrBurden: number;

  // Key metrics
  grossRentalYield: number;
  netRentalYield: number;
  purchasePriceFactor: number;
  capRate: number;
  dscr: number;
  roe: number;
  irr: number;

  // Break-even
  breakEvenMonthlyRent: number;
  breakEvenInterestRate: number;

  // Exit
  projectedSalePrice: number;
  totalAfaTaken: number;
  reducedBookValue: number;
  capitalGain: number;
  speculativeTax: number;
  saleCosts: number;
  netExitProceeds: number;
  equityAtExit: number;

  // Derived
  amortizationSchedule: AmortizationEntry[];
  cashflowProjection: CashflowProjectionEntry[];
  scenarios: {
    pessimistic: ScenarioResult;
    realistic: ScenarioResult;
    optimistic: ScenarioResult;
  };

  // Recommendation
  score: number;
  recommendation: 'kaufen' | 'bedingt' | 'nicht-kaufen';
  recommendationText: string;
  topLeverages: string[];
  riskFlags: RiskFlag[];
}

export interface SavedObject {
  id: string;
  name: string;
  createdAt: string;
  property: PropertyInput;
  rental: RentalInput;
  financing: FinancingInput;
  tax: TaxInput;
  additionalCosts: AdditionalCostsInput;
  results: CalculationResults;
}

export type ActivePage =
  | 'overview'
  | 'inputs'
  | 'scenarios'
  | 'duediligence'
  | 'savings'
  | 'comparison';
