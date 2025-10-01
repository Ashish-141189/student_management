// src/services/api.js
import axios from "axios";
import { getToken, clearAuth } from "../utils/auth";

const API = axios.create({
  baseURL: import.meta.env.REACT_APP_API_BASE || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // token expired or invalid — clear auth and send to login
      clearAuth();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
