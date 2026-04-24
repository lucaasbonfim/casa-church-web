import axios from "axios";
import { API_URL } from "@/config/env";

export async function findHomeContent() {
  const { data } = await axios.get(`${API_URL}/home-content`);
  return data;
}

export async function updateHomeContent(body) {
  const { data } = await axios.patch(`${API_URL}/home-content`, body);
  return data?.homeContent ?? data;
}
