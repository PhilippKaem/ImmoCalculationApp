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
