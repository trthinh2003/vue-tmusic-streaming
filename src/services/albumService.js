import axiosInstance from "@/configs/axios";

export async function getAlbums(page = 1, pageSize = 5) {
    return await axiosInstance.get(`/albums?page=${page}&pageSize=${pageSize}`);
}