import axios from "axios";

import { API_URL } from "@/config/env";

export async function login(body) {
  const { data } = await axios.post(`${API_URL}/auth/login`, body);
  return data;
}

export async function confirmEmail(token) {
  const { data } = await axios.post(`${API_URL}/auth/confirm-email`, { token });
  return data;
}

export async function resendConfirmationEmail(email) {
  const { data } = await axios.post(`${API_URL}/auth/resend-confirmation`, {
    email,
  });
  return data;
}

export async function forgotPassword(email) {
  const { data } = await axios.post(`${API_URL}/auth/forgot-password`, {
    email,
  });
  return data;
}

export async function resetPassword(token, password) {
  const { data } = await axios.post(`${API_URL}/auth/reset-password`, {
    token,
    password,
  });
  return data;
}
