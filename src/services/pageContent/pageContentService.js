import axios from "axios";
import { API_URL } from "@/config/env";

export async function findPageContent(slug) {
  const { data } = await axios.get(`${API_URL}/page-content/${slug}`);
  return data?.content ?? data;
}

export async function updatePageContent(slug, content) {
  const { data } = await axios.patch(`${API_URL}/page-content/${slug}`, {
    content,
  });
  return data?.pageContent?.content ?? data?.content ?? content;
}
