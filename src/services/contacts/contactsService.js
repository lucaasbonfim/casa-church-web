import axios from "axios";

import { API_URL } from "@/config/env";

export async function createContact(body) {
  const { data } = await axios.post(`${API_URL}/contact-messages`, body);
  return data;
}