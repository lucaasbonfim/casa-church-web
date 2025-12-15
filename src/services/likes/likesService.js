import axios from "axios";

import { API_URL } from "@/config/env";

export async function createLike(body) {
    const { data } = await axios.post(`${API_URL}/likes`, body);
    return data;
}

export async function findAllLikes({ page = 1, limit = 10, postId, orderBy = "createdAt", orderDirection = "DESC" } = {}) {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        orderBy,
        orderDirection,
    });

    if (postId) {
        params.append("postId", postId);
    }

    const { data } = await axios.get(`${API_URL}/likes?${params.toString()}`);
    return data;
}

export async function findLikeById(id) {
    const { data } = await axios.get(`${API_URL}/likes/${id}`);
    return data;
}

export async function deleteLike(id) {
    const { data } = await axios.delete(`${API_URL}/likes/${id}`);
    return data;
}