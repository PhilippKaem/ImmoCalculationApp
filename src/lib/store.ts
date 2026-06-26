import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PropertyInput, RentalInput, FinancingInput, TaxInput,
  AdditionalCostsInput, CalculationResults, SavedObject, ActivePage,
} from './types';
import {
  DEFAULT_PROPERTY, DEFAULT_RENTAL, DEFAULT_FINANCING,
  DEFAULT_TAX, DEFAULT_ADDITIONAL_COSTS,
} from './constants';
import { calculateResults } from './calculations';

interface AppState {
  // Inputs
  property: PropertyInput;
  rental: RentalInput;
  financing: FinancingInput;
  tax: TaxInput;
  additionalCosts: AdditionalCostsInput;

  // Computed
  results: CalculationResults;

  // Saved objects
  savedObjects: SavedObject[];

  // UI
  activePage: ActivePage;
  currentObjectName: string;
  currentObjectId: string | null;

  // Actions
  setProperty: (p: Partial<PropertyInput>) => void;
  setRental: (r: Partial<RentalInput>) => void;
  setFinancing: (f: Partial<FinancingInput>) => void;
  setTax: (t: Partial<TaxInput>) => void;
  setAdditionalCosts: (c: Partial<AdditionalCostsInput>) => void;
  setActivePage: (page: ActivePage) => void;
  setCurrentObjectName: (name: string) => void;

  saveCurrentObject: () => void;
  loadObject: (id: string) => void;
  deleteObject: (id: string) => void;
  resetToDefaults: () => void;
  newObject: () => void;
}

function recalc(state: Omit<AppState, 'results' | 'savedObjects' | 'activePage' | 'currentObjectName' | 'currentObjectId' | keyof { setProperty: unknown; setRental: unknown; setFinancing: unknown; setTax: unknown; setAdditionalCosts: unknown; setActivePage: unknown; setCurrentObjectName: unknown; saveCurrentObject: unknown; loadObject: unknown; deleteObject: unknown; resetToDefaults: unknown }>): CalculationResults {
  return calculateResults(
    state.property,
    state.rental,
    state.financing,
    state.tax,
    state.additionalCosts,
  );
}

const initialResults = calculateResults(
  DEFAULT_PROPERTY,
  DEFAULT_RENTAL,
  DEFAULT_FINANCING,
  DEFAULT_TAX,
  DEFAULT_ADDITIONAL_COSTS,
);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      property: { ...DEFAULT_PROPERTY },
      rental: { ...DEFAULT_RENTAL },
      financing: { ...DEFAULT_FINANCING },
      tax: { ...DEFAULT_TAX },
      additionalCosts: { ...DEFAULT_ADDITIONAL_COSTS },
      results: initialResults,
      savedObjects: [],
      activePage: 'overview',
      currentObjectName: 'ETW Chemnitz – Demo',
      currentObjectId: null,

      setProperty: (p) => set((s) => {
        const property = { ...s.property, ...p };
        return { property, results: calculateResults(property, s.rental, s.financing, s.tax, s.additionalCosts) };
      }),

      setRental: (r) => set((s) => {
        const rental = { ...s.rental, ...r };
        return { rental, results: calculateResults(s.property, rental, s.financing, s.tax, s.additionalCosts) };
      }),

      setFinancing: (f) => set((s) => {
        const financing = { ...s.financing, ...f };
        return { financing, results: calculateResults(s.property, s.rental, financing, s.tax, s.additionalCosts) };
      }),

      setTax: (t) => set((s) => {
        const tax = { ...s.tax, ...t };
        return { tax, results: calculateResults(s.property, s.rental, s.financing, tax, s.additionalCosts) };
      }),

      setAdditionalCosts: (c) => set((s) => {
        const additionalCosts = { ...s.additionalCosts, ...c };
        return { additionalCosts, results: calculateResults(s.property, s.rental, s.financing, s.tax, additionalCosts) };
      }),

      setActivePage: (page) => set({ activePage: page }),
      setCurrentObjectName: (name) => set({ currentObjectName: name }),

      saveCurrentObject: () => {
        const s = get();
        const id = s.currentObjectId ?? `obj_${Date.now()}`;
        const newObj: SavedObject = {
          id,
          name: s.currentObjectName,
          createdAt: new Date().toISOString(),
          property: s.property,
          rental: s.rental,
          financing: s.financing,
          tax: s.tax,
          additionalCosts: s.additionalCosts,
          results: s.results,
        };
        set((state) => ({
          currentObjectId: id,
          savedObjects: state.savedObjects.some(o => o.id === id)
            ? state.savedObjects.map(o => o.id === id ? newObj : o)
            : [...state.savedObjects, newObj],
        }));
      },

      loadObject: (id) => {
        const obj = get().savedObjects.find(o => o.id === id);
        if (!obj) return;
        const results = calculateResults(obj.property, obj.rental, obj.financing, obj.tax, obj.additionalCosts);
        set({
          property: obj.property,
          rental: obj.rental,
          financing: obj.financing,
          tax: obj.tax,
          additionalCosts: obj.additionalCosts,
          results,
          currentObjectName: obj.name,
          currentObjectId: obj.id,
        });
      },

      deleteObject: (id) => set((s) => ({
        savedObjects: s.savedObjects.filter(o => o.id !== id),
        currentObjectId: s.currentObjectId === id ? null : s.currentObjectId,
      })),

      resetToDefaults: () => set({
        property: { ...DEFAULT_PROPERTY },
        rental: { ...DEFAULT_RENTAL },
        financing: { ...DEFAULT_FINANCING },
        tax: { ...DEFAULT_TAX },
        additionalCosts: { ...DEFAULT_ADDITIONAL_COSTS },
        results: initialResults,
        currentObjectName: 'ETW Chemnitz – Demo',
        currentObjectId: null,
      }),

      newObject: () => {
        const today = new Date().toISOString().slice(0, 10);
        const year  = new Date().getFullYear();
        const blank = calculateResults(
          { purchasePrice: 0, livingArea: 0, rooms: 0, constructionYear: year, propertyType: 'ETW', condition: 'Gepflegt', federalState: 'NW', landValueShare: 20, energyValue: 0, heatingType: 'Gas', address: '' },
          { monthlyRent: 0, rentIncreasePA: 2.0, vacancyRate: 3.0, mietpreisbremseActive: false },
          { equity: 0, loanAmountOverride: 0, interestRate: 3.5, fixedRatePeriod: 15, initialRepaymentRate: 2.0, specialRepaymentPA: 0, useKfw: false, kfwProgram: '', kfwAmount: 0, kfwInterestRate: 2.5, kfwRepaymentGrant: 0 },
          { marginalTaxRate: 42, buildingShare: 80, purchaseContractDate: today, useDegressiveAfa: false, useSpecialAfa7b: false, shorterUsefulLife: 0, holdingPeriod: 15, annualAppreciationRate: 1.5 },
          { landTransferTaxOverride: 0, notaryFeePercent: 1.5, brokerFeePercent: 3.57, surveyorCost: 0, financingCost: 0, renovationBudget: 0, managementCostMonthly: 30, maintenanceCostPerSqm: 10, wegMonthlyContribution: 40, otherNonAllocableCosts: 200 },
        );
        set({
          property:        { purchasePrice: 0, livingArea: 0, rooms: 0, constructionYear: year, propertyType: 'ETW', condition: 'Gepflegt', federalState: 'NW', landValueShare: 20, energyValue: 0, heatingType: 'Gas', address: '' },
          rental:          { monthlyRent: 0, rentIncreasePA: 2.0, vacancyRate: 3.0, mietpreisbremseActive: false },
          financing:       { equity: 0, loanAmountOverride: 0, interestRate: 3.5, fixedRatePeriod: 15, initialRepaymentRate: 2.0, specialRepaymentPA: 0, useKfw: false, kfwProgram: '', kfwAmount: 0, kfwInterestRate: 2.5, kfwRepaymentGrant: 0 },
          tax:             { marginalTaxRate: 42, buildingShare: 80, purchaseContractDate: today, useDegressiveAfa: false, useSpecialAfa7b: false, shorterUsefulLife: 0, holdingPeriod: 15, annualAppreciationRate: 1.5 },
          additionalCosts: { landTransferTaxOverride: 0, notaryFeePercent: 1.5, brokerFeePercent: 3.57, surveyorCost: 0, financingCost: 0, renovationBudget: 0, managementCostMonthly: 30, maintenanceCostPerSqm: 10, wegMonthlyContribution: 40, otherNonAllocableCosts: 200 },
          results:         blank,
          currentObjectName: 'Neues Objekt',
          currentObjectId:   null,
          activePage:        'inputs',
        });
      },
    }),
    {
      name: 'immo-kalkulator-v1',
      partialize: (state) => ({
        property: state.property,
        rental: state.rental,
        financing: state.financing,
        tax: state.tax,
        additionalCosts: state.additionalCosts,
        savedObjects: state.savedObjects,
        currentObjectName: state.currentObjectName,
        currentObjectId: state.currentObjectId,
      }),
    },
  ),
);
