import axios from "axios";

import { API_URL } from "@/config/env";

export async function createLesson(body) {
    const { data } = await axios.post(`${API_URL}/lessons`, body);
    return data;
}

export async function findAllLessons({ page = 1, limit = 10, sermonId, orderBy = "ordem", orderDirection = "ASC" } = {}) {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        orderBy,
        orderDirection,
    });

    if (sermonId) {
        params.append("sermonId", sermonId);
    }

    const { data } = await axios.get(`${API_URL}/lessons?${params.toString()}`);
    return data;
}

export async function findLessonById(id) {
    const { data } = await axios.get(`${API_URL}/lessons/${id}`);
    return data;
}

export async function updateLesson(id, body) {
    const { data } = await axios.patch(`${API_URL}/lessons/${id}`, body);
    return data;
}

export async function deleteLesson(id) {
    const { data } = await axios.delete(`${API_URL}/lessons/${id}`);
    return data;
}