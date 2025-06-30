import axiosInstance from "@/configs/axios";

export const getRecommendSongs = (limit) => axiosInstance.get(`/recommendation/for-you?limit=${limit}`);