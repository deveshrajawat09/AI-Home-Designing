import axios from "axios";

export const generatePlan = async (payload) => {
  const { data } = await axios.post("/generate-plan", payload);
  return data.plan;
};

export const listPlans = async () => {
  const { data } = await axios.get("/plans");
  return data.plans;
};

export const savePlan = async (body) => {
  const { data } = await axios.post("/plans", body);
  return data.saved;
};

export const deletePlan = async (id) => {
  const { data } = await axios.delete(`/plans/${id}`);
  return data.ok;
};
