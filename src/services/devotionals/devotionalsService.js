import axios from "axios";
import { API_URL } from "@/config/env";

export async function findAllDevotionals(params = {}) {
  const { data } = await axios.get(`${API_URL}/devotionals`, { params });
  return data;
}

export async function findDevotionalByDate(date) {
  const { data } = await axios.get(`${API_URL}/devotionals`, {
    params: { date, devotionalDate: date, limit: 1 },
  });

  if (Array.isArray(data)) return data[0] || null;
  if (Array.isArray(data?.devotionals)) return data.devotionals[0] || null;
  return data?.devotional ?? data ?? null;
}

export async function createDevotional(body) {
  const { data } = await axios.post(`${API_URL}/devotionals`, body);
  return data?.devotional ?? data;
}

export async function updateDevotional(id, body) {
  const { data } = await axios.patch(`${API_URL}/devotionals/${id}`, body);
  return data?.devotional ?? data;
}

export async function deleteDevotional(id) {
  const { data } = await axios.delete(`${API_URL}/devotionals/${id}`);
  return data;
}
