import axios from "axios";

import { API_URL } from "@/config/env";

export async function createComment(body) {
    const { data } = await axios.post(`${API_URL}/comments`, body);
    return data;
}

export async function findAllComments({ page = 1, limit = 10, postId, orderBy = "createdAt", orderDirection = "DESC" } = {}) {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        orderBy,
        orderDirection,
    });

    if (postId) {
        params.append("postId", postId);
    }

    const { data } = await axios.get(`${API_URL}/comments?${params.toString()}`);
    return data;
}

export async function findCommentById(id) {
    const { data } = await axios.get(`${API_URL}/comments/${id}`);
    return data;
}

export async function deleteComment(id) {
    const { data } = await axios.delete(`${API_URL}/comments/${id}`);
    return data;
}