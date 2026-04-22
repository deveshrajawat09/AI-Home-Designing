import { create } from "zustand";

export const usePlanStore = create((set) => ({
  plan: null,
  loading: false,
  error: null,
  saved: [],
  user: null,
  token: null,

  setPlan: (plan) => set({ plan }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSaved: (saved) => set({ saved: Array.isArray(saved) ? saved : [] }),
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, token: null, plan: null, saved: [], error: null }),
}));
