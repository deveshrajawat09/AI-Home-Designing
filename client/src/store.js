import { create } from "zustand";

export const usePlanStore = create((set) => ({
  plan: null,
  loading: false,
  error: null,
  saved: [],
  setPlan: (plan) => set({ plan }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSaved: (saved) => set({ saved })
}));
