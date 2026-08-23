import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

export const getDashboardSummary = async () => {
  const res = await axios.get(`${API_BASE}/dashboard-summary`);
  return res.data;
};

export const getTransactions = async () => {
  const res = await axios.get(`${API_BASE}/transactions`);
  return res.data;
};

export const getTransactionById = async (id) => {
  const res = await axios.get(`${API_BASE}/transactions/${id}`);
  return res.data;
};

export const uploadCSV = async (formData) => {
  const res = await axios.post(`${API_BASE}/analyze`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
export const clearTransactions = async () => {
  const res = await axios.delete(`${API_BASE}/transactions`);
  return res.data;
};
