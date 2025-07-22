import axiosInstance from "@/configs/axios";

export const getRecommendSongs = (limit) => axiosInstance.get(`/recommendation/for-you?limit=${limit}`);
export const getRecommendedArtists = (limit) => axiosInstance.get(`/recommendation/artists?limit=${limit}`);
export const getRecommendedPlaylists = (limit) => axiosInstance.get(`/recommendation/playlists?limit=${limit}`);