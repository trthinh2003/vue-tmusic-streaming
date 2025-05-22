import axiosInstance from "@/configs/axios";

export async function getAlbums(page = 1, pageSize = 5) {
    return await axiosInstance.get(`/albums?page=${page}&pageSize=${pageSize}`);
}

export const searchAlbums = (page = 1, pageSize = 5, query) => {
    return axiosInstance.get(`/albums?page=${page}&pageSize=${pageSize}&query=${query}`, {
        params: {
            page,
            pageSize,
            query
        }
    });
};

export const createAlbum = (formData) => {
    return axiosInstance.post('/albums', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};