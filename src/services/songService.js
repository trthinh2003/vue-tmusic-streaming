import axiosInstance from "@/configs/axios";

export async function getSongs(page = 1, pageSize = 10, query = '') {
    return await axiosInstance.get(`/songs?page=${page}&pageSize=${pageSize}&query=${query}`);
}

export async function getRandomSongs(page=1, pageSize=10, count) {
    return await axiosInstance.get(`/songs/random-songs?page=${page}&pageSize=${pageSize}&count=${count}`);
}

export async function getSongById(id) {
    return await axiosInstance.get(`/songs/get-song-by-id/${id}`);
}

export async function getSharedSong(shareToken) {
    return await axiosInstance.get(`/songs/shared/${shareToken}`);
}

export async function createShareLink(songId, expireInMinutes = 60) {
    return await axiosInstance.post(`/songs/share/${songId}?expireInMinutes=${expireInMinutes}`);
}

export async function getSong(slug) {
    return await axiosInstance.get(`/songs/${slug}`);
}

export async function getSongByPlaylist(playlistId) {
    return await axiosInstance.get(`/songs/by-playlist/${playlistId}`);
}

export const searchSongs = (page = 1, pageSize = 5, query) => {
    return axiosInstance.get(`/songs?page=${page}&pageSize=${pageSize}&query=${query}`);
};

export async function createSong(formData) {
    return await axiosInstance.post('/songs', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
}

export async function updateSong(id, formData) {
    return await axiosInstance.put(`/songs/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
}