import axiosInstance from "@/configs/axios";

export async function getGenres() {
    return await axiosInstance.get("/genres");
}

export async function getGenre(id) {
    return await axiosInstance.get(`/genres/${id}`);
}

export async function getGenresForFilter(query = '') {
    return await axiosInstance.get(`/genres/for-filter?query=${query}`);
}

export async function createGenre(genreData) {
    return await axiosInstance.post("/genres", genreData);
}

export async function updateGenre(id, genreData) {
    return await axiosInstance.put(`/genres/${id}`, genreData);
}

export async function deleteGenre(id) {
    return await axiosInstance.delete(`/genres/${id}`);
}