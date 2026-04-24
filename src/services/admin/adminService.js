import axios from "axios";

import { API_URL } from "@/config/env";

export async function getAdminStats() {
    const { data } = await axios.get(`${API_URL}/users/stats`);
    return data;
}

// eslint-disable-next-line no-unused-vars
export async function getRecentActivities({ page = 1, limit = 5 } = {}) {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    const { data } = await axios.get(`${API_URL}/user-activity?${params.toString()}`);
    return data;
}

export async function findUserActivities({
    page = 1,
    limit = 20,
    userId,
    action,
} = {}) {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    if (userId) params.append("userId", userId);
    if (action) params.append("action", action);

    const { data } = await axios.get(`${API_URL}/user-activity?${params.toString()}`);
    return data;
}

export async function getUpcomingEvents({ page = 1, limit = 5 } = {}) {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: "100", // Busca muitos eventos para filtrar
        orderBy: "startDate",
        orderDirection: "ASC",
    });

    const { data } = await axios.get(`${API_URL}/events?${params.toString()}`);

    // Filtra apenas eventos futuros (que ainda não começaram)
    const today = new Date();

    const upcomingEvents = data.events?.filter(event => {
        const eventStartDate = new Date(event.startDate);
        return eventStartDate >= today;
    }) || [];

    return {
        ...data,
        events: upcomingEvents.slice(0, limit)
    };
}
