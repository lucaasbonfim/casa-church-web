import axios from "axios";

import { API_URL } from "@/config/env";

export async function findGalleryFolders() {
  const { data } = await axios.get(`${API_URL}/gallery/folders`);
  return data;
}

export async function findGalleryPhotos({
  folder,
  orderDirection = "DESC",
  limit = 24,
  nextCursor,
} = {}) {
  const params = new URLSearchParams({
    orderDirection,
    limit: String(limit),
  });

  if (folder) params.append("folder", folder);
  if (nextCursor) params.append("nextCursor", nextCursor);

  const { data } = await axios.get(`${API_URL}/gallery/photos?${params.toString()}`);
  return data;
}

export async function uploadGalleryPhoto({ file, folder }) {
  const formData = new FormData();
  formData.append("file", file);

  if (folder) {
    formData.append("folder", folder);
  }

  const { data } = await axios.post(`${API_URL}/gallery/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
}

export async function deleteGalleryPhoto(publicId) {
  const { data } = await axios.delete(`${API_URL}/gallery/photos`, {
    params: { publicId },
  });

  return data;
}

export async function deleteGalleryFolder(folder) {
  const { data } = await axios.delete(`${API_URL}/gallery/folders`, {
    params: { folder },
  });

  return data;
}
