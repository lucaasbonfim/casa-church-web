import axios from "axios";
import { API_URL } from "@/config/env";

export async function createChurchHouse(body) {
  const { data } = await axios.post(`${API_URL}/church-houses`, body);
  return data?.churchHouse ?? data;
}

export async function findAllChurchHouses({
  page = 1,
  limit = 10,
  name,
  city,
  uf,
  active,
  orderBy = "createdAt",
  orderDirection = "DESC",
} = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    orderBy,
    orderDirection,
  });

  if (name) params.append("name", name);
  if (city) params.append("city", city);
  if (uf) params.append("uf", uf);
  if (active !== undefined) params.append("active", String(active));

  const { data } = await axios.get(
    `${API_URL}/church-houses?${params.toString()}`
  );
  return data;
}

export async function findChurchHouseById(id) {
  const { data } = await axios.get(`${API_URL}/church-houses/${id}`);
  return data;
}

export async function updateChurchHouse(id, body) {
  const { data } = await axios.patch(`${API_URL}/church-houses/${id}`, body);
  return data?.churchHouse ?? data;
}

export async function deleteChurchHouse(id) {
  const { data } = await axios.delete(`${API_URL}/church-houses/${id}`);
  return data;
}
