import axiosInstance from "@/configs/axios";

export async function getSongs(page = 1, pageSize = 10) {
    return await axiosInstance.get(`/songs?page=${page}&pageSize=${pageSize}`);
}

export async function getSong(slug) {
    return await axiosInstance.get(`/songs/${slug}`);
}

export async function getSongByPlaylist(playlistId) {
    return await axiosInstance.get(`/songs/by-playlist/${playlistId}`);
}

export async function createSong(formData) {
    return await axiosInstance.post('/songs', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
}

export async function updateSong(id, formData) {
    return await axiosInstance.put(`/songs/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
}