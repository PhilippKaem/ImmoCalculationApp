import {
  PropertyInput, RentalInput, FinancingInput, TaxInput, AdditionalCostsInput,
  CalculationResults, AmortizationEntry, CashflowProjectionEntry,
  ScenarioResult, RiskFlag,
} from './types';
import { LAND_TRANSFER_TAX, AFA, SPEKULATIONSFRIST_YEARS, LAND_TRANSFER_TAX_BAGATELL } from './constants';

function calculateIRR(cashflows: number[]): number {
  if (cashflows.length < 2) return 0;
  let rate = 0.08;
  for (let i = 0; i < 2000; i++) {
    let npv = 0, dnpv = 0;
    for (let t = 0; t < cashflows.length; t++) {
      const disc = Math.pow(1 + rate, t);
      npv  += cashflows[t] / disc;
      dnpv -= (t * cashflows[t]) / (disc * (1 + rate));
    }
    if (Math.abs(dnpv) < 1e-12) break;
    const next = rate - npv / dnpv;
    if (Math.abs(next - rate) < 1e-9) return next * 100;
    rate = Math.max(-0.99, Math.min(99, next));
  }
  return rate * 100;
}

function buildAmortizationSchedule(
  principal: number,
  annualInterestRate: number,
  initialRepaymentRate: number,
  years: number,
): AmortizationEntry[] {
  const monthlyRate = annualInterestRate / 100 / 12;
  const monthlyPayment = (principal > 0)
    ? principal * (annualInterestRate / 100 + initialRepaymentRate / 100) / 12
    : 0;

  const entries: AmortizationEntry[] = [];
  let balance = principal;

  for (let yr = 1; yr <= years && balance > 0.01; yr++) {
    let yearInterest = 0, yearRepayment = 0;
    const startBalance = balance;
    for (let m = 0; m < 12; m++) {
      const interest = balance * monthlyRate;
      const repayment = Math.min(Math.max(monthlyPayment - interest, 0), balance);
      yearInterest   += interest;
      yearRepayment  += repayment;
      balance        -= repayment;
      if (balance < 0.01) { balance = 0; break; }
    }
    entries.push({
      year: yr,
      startBalance,
      interestPayment: yearInterest,
      repaymentPayment: yearRepayment,
      totalPayment: yearInterest + yearRepayment,
      endBalance: balance,
    });
  }
  return entries;
}

function getAfaRate(
  constructionYear: number,
  useDegressiveAfa: boolean,
  shorterUsefulLife: number,
): { rate: number; label: string } {
  if (shorterUsefulLife > 0) {
    return { rate: 1 / shorterUsefulLife, label: `Kürzere ND (${shorterUsefulLife} J.)` };
  }
  if (useDegressiveAfa) {
    return { rate: AFA.DEGRESSIVE, label: 'Degressiv 5 % (§ 7 Abs. 5a)' };
  }
  if (constructionYear < 1925) {
    return { rate: AFA.LINEAR_ALTBAU, label: 'Linear 2,5 % (Altbau vor 1925)' };
  }
  if (constructionYear < 2023) {
    return { rate: AFA.LINEAR_STANDARD, label: 'Linear 2,0 % (Standard)' };
  }
  return { rate: AFA.LINEAR_NEUBAU, label: 'Linear 3,0 % (Neubau ab 2023)' };
}

interface ScenarioOverrides {
  rentIncreasePA: number;
  vacancyRate: number;
  appreciationRate: number;
  interestRateAtRefinancing: number;
}

function scoreAndRecommend(
  netRentalYield: number,
  cashflowAfterTaxY1: number,
  cashflowBeforeTax: number,
  dscr: number,
  purchasePriceFactor: number,
  riskFlags: RiskFlag[],
): { score: number; recommendation: 'kaufen' | 'bedingt' | 'nicht-kaufen' } {
  let score = 100;

  if (netRentalYield < 4.5) score -= 8;
  if (netRentalYield < 3.5) score -= 8;
  if (netRentalYield < 2.5) score -= 12;
  if (netRentalYield < 1.5) score -= 12;

  if (cashflowAfterTaxY1 < 0) score -= 8;
  if (cashflowAfterTaxY1 < -1200) score -= 8;
  if (cashflowAfterTaxY1 < -3000) score -= 8;

  if (cashflowBeforeTax < 0) score -= 15;

  if (dscr < 1.2) score -= 5;
  if (dscr < 1.1) score -= 8;
  if (dscr < 1.0) score -= 12;

  if (purchasePriceFactor > 25) score -= 5;
  if (purchasePriceFactor > 30) score -= 8;
  if (purchasePriceFactor > 35) score -= 8;

  riskFlags.forEach(f => { score -= f.severity === 'critical' ? 10 : 5; });

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    recommendation: score >= 65 ? 'kaufen' : score >= 40 ? 'bedingt' : 'nicht-kaufen',
  };
}

function computeCore(
  property: PropertyInput,
  rental: RentalInput,
  financing: FinancingInput,
  tax: TaxInput,
  additionalCosts: AdditionalCostsInput,
  scenarioOverrides?: ScenarioOverrides,
) {
  const rent     = scenarioOverrides ? { ...rental,   rentIncreasePA: scenarioOverrides.rentIncreasePA, vacancyRate: scenarioOverrides.vacancyRate } : rental;
  const taxLocal = scenarioOverrides ? { ...tax,      annualAppreciationRate: scenarioOverrides.appreciationRate } : tax;

  // --- Purchase costs ---
  const rawGrEStRate = additionalCosts.landTransferTaxOverride > 0
    ? additionalCosts.landTransferTaxOverride
    : LAND_TRANSFER_TAX[property.federalState].rate;
  const rawGrEStAmount = property.purchasePrice * rawGrEStRate / 100;
  const landTransferTax = rawGrEStAmount < LAND_TRANSFER_TAX_BAGATELL ? 0 : rawGrEStAmount;

  const notaryFees    = property.purchasePrice * additionalCosts.notaryFeePercent   / 100;
  const brokerFee     = property.purchasePrice * additionalCosts.brokerFeePercent    / 100;
  const totalPurchaseCosts =
    landTransferTax + notaryFees + brokerFee +
    additionalCosts.surveyorCost + additionalCosts.financingCost +
    additionalCosts.renovationBudget;
  const totalInvestment    = property.purchasePrice + totalPurchaseCosts;
  const purchaseCostRatio  = (totalPurchaseCosts / property.purchasePrice) * 100;

  // --- Loan ---
  const loanAmount = financing.loanAmountOverride > 0
    ? financing.loanAmountOverride
    : Math.max(0, totalInvestment - financing.equity);
  const ltv            = (loanAmount / property.purchasePrice) * 100;
  const annualInterestRate = financing.interestRate / 100;
  const monthlyPayment = loanAmount > 0
    ? loanAmount * (financing.interestRate / 100 + financing.initialRepaymentRate / 100) / 12
    : 0;
  const annualPayment  = monthlyPayment * 12;
  const annualInterestY1   = loanAmount * annualInterestRate;
  const annualRepaymentY1  = annualPayment - annualInterestY1;

  // --- Annual figures Y1 ---
  const annualRent          = rent.monthlyRent * 12;
  const vacancyLossAnnual   = annualRent * rent.vacancyRate / 100;
  const effectiveAnnualRent = annualRent - vacancyLossAnnual;

  const managementCostAnnual  = additionalCosts.managementCostMonthly * 12;
  const maintenanceCostAnnual = property.livingArea * additionalCosts.maintenanceCostPerSqm;
  const wegReserveAnnual      = additionalCosts.wegMonthlyContribution * 12;

  const totalNonAllocableCosts =
    managementCostAnnual + maintenanceCostAnnual +
    additionalCosts.otherNonAllocableCosts + vacancyLossAnnual;

  const noi             = effectiveAnnualRent - managementCostAnnual - maintenanceCostAnnual - additionalCosts.otherNonAllocableCosts;
  const cashflowBeforeTax = effectiveAnnualRent - totalNonAllocableCosts - wegReserveAnnual - annualPayment;

  // --- AfA ---
  const buildingValue  = totalInvestment * (taxLocal.buildingShare / 100);
  const { rate: afaRateRaw } = getAfaRate(
    property.constructionYear,
    taxLocal.useDegressiveAfa,
    taxLocal.shorterUsefulLife,
  );
  let afaAmountY1 = buildingValue * afaRateRaw;
  if (taxLocal.useSpecialAfa7b) afaAmountY1 += buildingValue * AFA.SPECIAL_7B;

  // --- Tax Y1 ---
  // Deductible: AfA + interest + management + maintenance + other (NOT WEG reserve until spent)
  const totalDeductible = afaAmountY1 + annualInterestY1 + managementCostAnnual + maintenanceCostAnnual + additionalCosts.otherNonAllocableCosts;
  const taxableIncome   = effectiveAnnualRent - totalDeductible;
  const taxEffect       = -(taxableIncome * taxLocal.marginalTaxRate / 100); // + = savings, - = burden
  const cashflowAfterTax = cashflowBeforeTax + taxEffect;

  // --- Key metrics ---
  const grossRentalYield  = (annualRent / property.purchasePrice) * 100;
  const netRentalYield    = totalInvestment > 0 ? ((annualRent - totalNonAllocableCosts) / totalInvestment) * 100 : 0;
  const purchasePriceFactor = annualRent > 0 ? property.purchasePrice / annualRent : 0;
  const capRate           = property.purchasePrice > 0 ? (noi / property.purchasePrice) * 100 : 0;
  const dscr              = annualPayment > 0 ? noi / annualPayment : 99;
  const totalEquityInvested = financing.equity + totalPurchaseCosts;

  // --- Break-even ---
  const breakEvenMonthlyRent = annualPayment > 0
    ? (totalNonAllocableCosts + wegReserveAnnual + annualPayment) / 12 / (1 - rent.vacancyRate / 100)
    : (totalNonAllocableCosts + wegReserveAnnual) / 12 / (1 - rent.vacancyRate / 100);
  const breakEvenInterestRate = loanAmount > 0
    ? ((effectiveAnnualRent - totalNonAllocableCosts - wegReserveAnnual) / loanAmount - financing.initialRepaymentRate / 100) * 100
    : 0;

  // --- Amortization schedule ---
  const amortizationSchedule = buildAmortizationSchedule(
    loanAmount,
    financing.interestRate,
    financing.initialRepaymentRate,
    Math.max(taxLocal.holdingPeriod, 30),
  );

  // --- Exit analysis ---
  const projectedSalePrice = property.purchasePrice * Math.pow(1 + taxLocal.annualAppreciationRate / 100, taxLocal.holdingPeriod);
  const saleCosts          = projectedSalePrice * 0.035;
  const maxAfaYears        = afaRateRaw > 0 ? Math.floor(1 / afaRateRaw) : 50;
  const actualAfaYears     = Math.min(taxLocal.holdingPeriod, maxAfaYears);
  let totalAfaTaken = 0;
  if (taxLocal.useDegressiveAfa) {
    // Degressive: AfA on residual value each year
    let residual = buildingValue;
    for (let y = 0; y < actualAfaYears; y++) {
      totalAfaTaken += residual * AFA.DEGRESSIVE;
      residual      -= residual * AFA.DEGRESSIVE;
    }
  } else {
    totalAfaTaken = afaAmountY1 * actualAfaYears;
  }
  const reducedBookValue = Math.max(0, totalInvestment - totalAfaTaken);
  const capitalGain      = projectedSalePrice - reducedBookValue - saleCosts;
  const speculativeTax   = taxLocal.holdingPeriod < SPEKULATIONSFRIST_YEARS
    ? Math.max(0, capitalGain) * taxLocal.marginalTaxRate / 100
    : 0;
  const lastAmoEntry     = amortizationSchedule[taxLocal.holdingPeriod - 1];
  const remainingLoanAtExit = lastAmoEntry?.endBalance ?? 0;
  const netExitProceeds  = projectedSalePrice - saleCosts - speculativeTax - remainingLoanAtExit;
  const equityAtExit     = projectedSalePrice - remainingLoanAtExit;

  // --- Cashflow projection ---
  const cashflowProjection: CashflowProjectionEntry[] = [];
  const irrCashflows: number[] = [-(financing.equity + totalPurchaseCosts)];
  let cumCashflow = 0;
  let degressiveResidual = buildingValue;

  for (let yr = 1; yr <= taxLocal.holdingPeriod; yr++) {
    const rentGrowth        = Math.pow(1 + rent.rentIncreasePA / 100, yr - 1);
    const yearRent          = annualRent * rentGrowth;
    const yearVacancyLoss   = yearRent * rent.vacancyRate / 100;
    const yearEffectiveRent = yearRent - yearVacancyLoss;

    const yearOpCosts = managementCostAnnual + maintenanceCostAnnual + additionalCosts.otherNonAllocableCosts + yearVacancyLoss;
    const yearWeg     = wegReserveAnnual;

    const sched   = amortizationSchedule[yr - 1];
    const yearInt = sched?.interestPayment   ?? 0;
    const yearRep = sched?.repaymentPayment  ?? 0;
    const yearDs  = yearInt + yearRep;

    let yearAfa = 0;
    if (taxLocal.useDegressiveAfa) {
      yearAfa          = degressiveResidual * AFA.DEGRESSIVE;
      degressiveResidual -= yearAfa;
    } else {
      yearAfa = yr <= maxAfaYears ? afaAmountY1 : 0;
    }
    if (taxLocal.useSpecialAfa7b && yr <= 4) yearAfa += buildingValue * AFA.SPECIAL_7B;

    const yearDeductible    = yearAfa + yearInt + managementCostAnnual + maintenanceCostAnnual + additionalCosts.otherNonAllocableCosts;
    const yearTaxableIncome = yearEffectiveRent - yearDeductible;
    const yearTaxEffect     = -(yearTaxableIncome * taxLocal.marginalTaxRate / 100);

    const yearCfBT = yearEffectiveRent - yearOpCosts - yearWeg - yearDs;
    const yearCfAT = yearCfBT + yearTaxEffect;
    cumCashflow   += yearCfAT;

    const yearPropertyValue = property.purchasePrice * Math.pow(1 + taxLocal.annualAppreciationRate / 100, yr);
    const yearRemLoan       = sched?.endBalance ?? 0;

    cashflowProjection.push({
      year: yr,
      rent: yearEffectiveRent,
      operatingCosts: yearOpCosts + yearWeg,
      debtService: yearDs,
      taxEffect: yearTaxEffect,
      cashflowAfterTax: yearCfAT,
      cumulativeCashflow: cumCashflow,
      propertyValue: yearPropertyValue,
      remainingLoan: yearRemLoan,
      totalEquity: yearPropertyValue - yearRemLoan,
    });

    irrCashflows.push(yr === taxLocal.holdingPeriod ? yearCfAT + netExitProceeds : yearCfAT);
  }

  const irr = calculateIRR(irrCashflows);

  const yearlyAppreciation = property.purchasePrice * (taxLocal.annualAppreciationRate / 100);
  const roe = totalEquityInvested > 0
    ? ((cashflowAfterTax + annualRepaymentY1 + yearlyAppreciation) / totalEquityInvested) * 100
    : 0;

  return {
    landTransferTax, notaryFees, brokerFee,
    surveyorCost: additionalCosts.surveyorCost,
    financingCost: additionalCosts.financingCost,
    renovationBudget: additionalCosts.renovationBudget,
    totalPurchaseCosts, totalInvestment, purchaseCostRatio,
    loanAmount, ltv, monthlyPayment, annualPayment,
    annualRent, effectiveAnnualRent,
    managementCostAnnual, maintenanceCostAnnual, wegReserveAnnual,
    vacancyLossAnnual, otherNonAllocableCostsAnnual: additionalCosts.otherNonAllocableCosts,
    totalNonAllocableCosts, noi, annualInterest: annualInterestY1,
    annualRepayment: annualRepaymentY1,
    cashflowBeforeTax,
    afaRate: afaRateRaw * 100,
    buildingValue, afaAmount: afaAmountY1, taxableIncome, taxEffect, cashflowAfterTax,
    annualTaxSavingsOrBurden: taxEffect,
    grossRentalYield, netRentalYield, purchasePriceFactor, capRate, dscr, roe, irr,
    breakEvenMonthlyRent, breakEvenInterestRate,
    projectedSalePrice, totalAfaTaken, reducedBookValue,
    capitalGain, speculativeTax, saleCosts, netExitProceeds, equityAtExit,
    amortizationSchedule, cashflowProjection, totalEquityInvested,
  };
}

export function calculateResults(
  property: PropertyInput,
  rental: RentalInput,
  financing: FinancingInput,
  tax: TaxInput,
  additionalCosts: AdditionalCostsInput,
): CalculationResults {
  const core = computeCore(property, rental, financing, tax, additionalCosts);

  // --- Risk flags ---
  const riskFlags: RiskFlag[] = [];

  if (core.cashflowBeforeTax < 0) {
    riskFlags.push({
      id: 'neg-cf-before-repayment',
      title: 'Negativer Cashflow vor Tilgung',
      description: 'Der Cashflow ist negativ, selbst ohne Tilgung. Das Objekt kostet Sie jeden Monat Geld, unabhängig vom Vermögensaufbau durch Tilgung.',
      severity: 'critical',
    });
  }

  if (core.purchasePriceFactor > 30) {
    riskFlags.push({
      id: 'high-price-factor',
      title: `Hoher Kaufpreisfaktor (${core.purchasePriceFactor.toFixed(1)}x)`,
      description: 'Ein Faktor über 30 deutet auf eine Überbewertung hin. Die Anfangsrendite ist sehr gering und das Aufholrisiko bei steigenden Zinsen hoch.',
      severity: 'warning',
    });
  }

  if (core.dscr < 1.1 && core.loanAmount > 0) {
    riskFlags.push({
      id: 'low-dscr',
      title: `Niedriger DSCR (${core.dscr.toFixed(2)})`,
      description: 'Der Debt Service Coverage Ratio liegt unter dem Bankstandard von 1,1. Das NOI reicht kaum aus, um den Kapitaldienst zu decken.',
      severity: core.dscr < 1.0 ? 'critical' : 'warning',
    });
  }

  if (core.ltv > 90 && core.loanAmount > 0) {
    riskFlags.push({
      id: 'high-ltv',
      title: `Hoher Beleihungsauslauf (${core.ltv.toFixed(0)} %)`,
      description: 'Bei über 90 % LTV sind schlechtere Zinsen oder eine Kreditablehnung wahrscheinlich. Planen Sie mehr Eigenkapital ein.',
      severity: 'warning',
    });
  }

  if (core.netRentalYield < 2.5 && core.loanAmount > 0) {
    riskFlags.push({
      id: 'low-net-yield',
      title: `Niedrige Nettomietrendite (${core.netRentalYield.toFixed(1)} %)`,
      description: 'Die Nettomietrendite liegt deutlich unter dem Sollzins. Der Leverage-Effekt wirkt negativ – der Kredit kostet mehr als das Objekt einbringt.',
      severity: 'warning',
    });
  }

  if (additionalCosts.renovationBudget > 0) {
    const buildingVal = (property.purchasePrice + core.totalPurchaseCosts) * (tax.buildingShare / 100);
    if (additionalCosts.renovationBudget / buildingVal > 0.15) {
      riskFlags.push({
        id: 'anschaffungsnaher-aufwand',
        title: '15%-Falle: Anschaffungsnaher Herstellungsaufwand',
        description: 'Modernisierungen in den ersten 3 Jahren über 15 % des Gebäudewerts (netto) gelten steuerlich als Herstellungsaufwand – nur über AfA absetzbar, nicht sofort (§ 6 Abs. 1 Nr. 1a EStG).',
        severity: 'warning',
      });
    }
  }

  const { score, recommendation } = scoreAndRecommend(
    core.netRentalYield,
    core.cashflowAfterTax,
    core.cashflowBeforeTax,
    core.dscr,
    core.purchasePriceFactor,
    riskFlags,
  );

  let recommendationText = '';
  if (recommendation === 'kaufen') {
    recommendationText = `Score ${score}/100 – Die Kennzahlen sind solide. Nettomietrendite und Cashflow sprechen für den Kauf. Prüfen Sie die qualitativen Punkte (Due Diligence) und holen Sie ein unabhängiges Gutachten ein.`;
  } else if (recommendation === 'bedingt') {
    recommendationText = `Score ${score}/100 – Das Objekt ist bedingt empfehlenswert. Verhandeln Sie den Kaufpreis nach unten oder optimieren Sie die Finanzierungsstruktur. Prüfen Sie die Sparhebel.`;
  } else {
    recommendationText = `Score ${score}/100 – Die Rendite-Risiko-Relation ist ungünstig. Hoher Kaufpreis und/oder niedrige Miete lassen keinen soliden Cashflow zu. Suchen Sie ein alternatives Objekt.`;
  }

  const topLeverages = [
    { key: 'Kaufpreis verhandeln',         score: core.purchasePriceFactor > 25 ? 3 : 0 },
    { key: 'Mietpotenzial prüfen',          score: core.grossRentalYield < 4 ? 3 : 1 },
    { key: 'Zins / Beleihungsauslauf opt.', score: core.ltv > 80 ? 2 : 0 },
    { key: 'Bewirtschaftungskosten senken', score: core.totalNonAllocableCosts > core.annualRent * 0.4 ? 2 : 0 },
    { key: 'AfA-Basis optimieren',          score: 1 },
    { key: 'Förderprogramme prüfen (KfW)',  score: !financing.useKfw ? 1 : 0 },
  ].sort((a, b) => b.score - a.score).slice(0, 3).map(l => l.key);

  // --- Scenarios ---
  const buildScenario = (
    name: string,
    overrides: ScenarioOverrides,
  ): ScenarioResult => {
    const s = computeCore(property, rental, financing, tax, additionalCosts, overrides);
    const sf: RiskFlag[] = [];
    if (s.cashflowBeforeTax < 0) sf.push({ id: 'x', title: '', description: '', severity: 'critical' });
    const { score: sc, recommendation: rec } = scoreAndRecommend(
      s.netRentalYield, s.cashflowAfterTax, s.cashflowBeforeTax, s.dscr, s.purchasePriceFactor, sf,
    );
    const cfY10 = s.cashflowProjection[9]?.cashflowAfterTax ?? 0;
    return {
      name,
      rentIncreasePA: overrides.rentIncreasePA,
      vacancyRate: overrides.vacancyRate,
      interestRateAtRefinancing: overrides.interestRateAtRefinancing,
      appreciationRate: overrides.appreciationRate,
      grossRentalYield: s.grossRentalYield,
      netRentalYield: s.netRentalYield,
      cashflowAfterTaxY1: s.cashflowAfterTax,
      cashflowAfterTaxY10: cfY10,
      roe: s.roe,
      irr: s.irr,
      netExitProceeds: s.netExitProceeds,
      score: sc,
      recommendation: rec,
    };
  };

  const scenarios = {
    pessimistic: buildScenario('Pessimistisch', {
      rentIncreasePA: 0,
      vacancyRate: Math.min(rental.vacancyRate + 3, 8),
      appreciationRate: 0,
      interestRateAtRefinancing: financing.interestRate + 2,
    }),
    realistic: buildScenario('Realistisch', {
      rentIncreasePA: rental.rentIncreasePA,
      vacancyRate: rental.vacancyRate,
      appreciationRate: tax.annualAppreciationRate,
      interestRateAtRefinancing: financing.interestRate,
    }),
    optimistic: buildScenario('Optimistisch', {
      rentIncreasePA: Math.min(rental.rentIncreasePA + 1, 4),
      vacancyRate: Math.max(rental.vacancyRate - 1, 0),
      appreciationRate: tax.annualAppreciationRate + 1.5,
      interestRateAtRefinancing: Math.max(financing.interestRate - 0.5, 0.5),
    }),
  };

  return {
    ...core,
    riskFlags,
    score,
    recommendation,
    recommendationText,
    topLeverages,
    scenarios,
  };
}
