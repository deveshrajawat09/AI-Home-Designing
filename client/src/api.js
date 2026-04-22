import axios from "axios";

// ── Axios Instance with Auth Interceptor ─────────────────────
const api = axios.create({ baseURL: "" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401 (expired/invalid token)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────
export const login = async (email, password) => {
  const { data } = await api.post("/api/login", { email, password });
  return data;
};

export const signup = async (email, password) => {
  const { data } = await api.post("/api/signup", { email, password });
  return data;
};

// ── Floor Plan Generation ─────────────────────────────────────
export const generatePlan = async (payload) => {
  const { data } = await api.post("/generate-plan", payload);
  return { plan: data.plan, warning: data.warning || null };
};

// ── Saved Plans ───────────────────────────────────────────────
export const listPlans = async () => {
  const { data } = await api.get("/plans");
  return data.plans || [];
};

export const savePlan = async (body) => {
  const { data } = await api.post("/plans", body);
  return data.saved;
};

export const deletePlan = async (id) => {
  const { data } = await api.delete(`/plans/${id}`);
  return data.ok;
};

// ── Health Check ──────────────────────────────────────────────
export const checkHealth = async () => {
  const { data } = await api.get("/api/health");
  return data;
};
