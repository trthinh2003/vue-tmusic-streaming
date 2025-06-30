import axiosInstance from "@/configs/axios";

export async function getGenres() {
    return await axiosInstance.get("/genres");
}

export async function getGenresForFilter(query = '') {
    return await axiosInstance.get(`/genres/for-filter?query=${query}`);
}