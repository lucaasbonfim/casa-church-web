import axios from "axios";

import { API_URL } from "@/config/env";

export async function createLocation(body) {
    const { data } = await axios.post(`${API_URL}/locations`, body);
    return data;
}

export async function findAllLocations({ page = 1, limit = 10 } = {}) {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    const { data } = await axios.get(`${API_URL}/locations?${params.toString()}`);
    return data;
}

export async function findLocationById(id) {
    const { data } = await axios.get(`${API_URL}/locations/${id}`);
    return data;
}

export async function updateLocation(id, body) {
    const { data } = await axios.patch(`${API_URL}/locations/${id}`, body);
    return data;
}

export async function deleteLocation(id) {
    const { data } = await axios.delete(`${API_URL}/locations/${id}`);
    return data;
}