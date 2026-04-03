import axios from "axios";

const api = axios.create({
  baseURL: ""
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email, password) => {
  const { data } = await api.post("/api/login", { email, password });
  return data;
};

export const signup = async (email, password) => {
  const { data } = await api.post("/api/signup", { email, password });
  return data;
};

export const generatePlan = async (payload) => {
  const { data } = await api.post("/generate-plan", payload);
  return data.plan;
};

export const listPlans = async () => {
  const { data } = await api.get("/plans");
  return data.plans;
};

export const savePlan = async (body) => {
  const { data } = await api.post("/plans", body);
  return data.saved;
};

export const deletePlan = async (id) => {
  const { data } = await api.delete(`/plans/${id}`);
  return data.ok;
};
