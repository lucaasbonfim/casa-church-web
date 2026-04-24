import axios from "axios";

import { API_URL } from "@/config/env";

export async function create(body) {
  const { data } = await axios.post(`${API_URL}/users`, body);
  return data;
}

export async function findAllUsers({ page = 1, limit = 10, role, active } = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (role) params.append("role", role);
  if (active !== undefined) params.append("active", active);

  const { data } = await axios.get(`${API_URL}/users?${params.toString()}`);
  return data;
}

export async function findUserById(id) {
  const { data } = await axios.get(`${API_URL}/users/${id}`);
  return data;
}

export async function updateUser(id, body) {
  const { data } = await axios.patch(`${API_URL}/users/${id}`, body);
  return data?.user ?? data;
}

export async function deleteUser(id) {
  const { data } = await axios.delete(`${API_URL}/users/${id}`);
  return data;
}
