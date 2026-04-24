import axios from "axios";

import { API_URL } from "@/config/env";

export async function createContact(body) {
  const { data } = await axios.post(`${API_URL}/contact-messages`, body);
  return data;
}

export async function findAllContacts(params = {}) {
  const { data } = await axios.get(`${API_URL}/contact-messages`, { params });
  return data;
}

export async function deleteContact(id) {
  const { data } = await axios.delete(`${API_URL}/contact-messages/${id}`);
  return data;
}
