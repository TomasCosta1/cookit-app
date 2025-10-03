import axios from "axios";

const API = process.env.REACT_APP_API_URL;

export const register = (data) => axios.post(`${API}/auth/register`, data);

export const googleLogin = (token) =>
  axios.post(`${API}/auth/google-login`, { token });
