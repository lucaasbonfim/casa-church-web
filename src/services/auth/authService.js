import axios from "axios";

import { API_URL } from "@/config/env";


export async function login(body) {
  const { data } = await axios.post(`${API_URL}/auth/login`, body);
  return data;
}
