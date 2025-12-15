import axios from "axios";

import { API_URL } from "@/config/env";


export async function createLessonProgress({ userId, lessonId }) {
    const { data } = await axios.post(`${API_URL}/lesson-progress`, {
        userId,
        lessonId,
    });

    return data;
}


export async function getLessonProgressByLessonId(lessonId) {
    const { data } = await axios.get(`${API_URL}/lesson-progress`, {
        params: {
            lessonId,
        },
    });

    return data;
}

export async function getLessonProgress(params = {}) {
    const { data } = await axios.get(`${API_URL}/lesson-progress`, {
        params,
    });

    return data;
}