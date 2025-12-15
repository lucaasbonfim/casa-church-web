import axios from "axios";

import { API_URL } from "@/config/env";

export async function findAllEvents(params = {}) {
  const { data } = await axios.get(`${API_URL}/events`, { params });

  return data;
}

export async function findEventById(eventId) {
  const { data } = await axios.get(`${API_URL}/events/${eventId}`);

  return data;
}

export async function createEvent(body) {
  const { data } = await axios.post(`${API_URL}/events`, body);

  return data;
}

export async function updateEvent(id, body) {
  const { data } = await axios.patch(`${API_URL}/events/${id}`, body);

  return data;
}

export async function deleteEvent(id) {
  const { data } = await axios.delete(`${API_URL}/events/${id}`);

  return data;
}
