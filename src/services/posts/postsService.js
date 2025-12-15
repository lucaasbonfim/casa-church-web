import axios from "axios";

import { API_URL } from "@/config/env";

export async function createPost(body) {
    const { data } = await axios.post(`${API_URL}/posts`, body);
    return data;
}

export async function findAllPosts({ page = 1, limit = 10, orderBy = "createdAt", orderDirection = "DESC", userId } = {}) {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        orderBy,
        orderDirection,
    });

    if (userId) {
        params.append("userId", userId);
    }

    const { data } = await axios.get(`${API_URL}/posts?${params.toString()}`);
    return data;
}

export async function findPostById(id) {
    const { data } = await axios.get(`${API_URL}/posts/${id}`);
    return data;
}

export async function deletePost(id) {
    const { data } = await axios.delete(`${API_URL}/posts/${id}`);
    return data;
}