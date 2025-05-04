import axiosInstance from "@/configs/axios";

export async function getArtists(page = 1, pageSize = 5) {
    return await axiosInstance.get(`/artists?page=${page}&pageSize=${pageSize}`);
}

export const searchArtists = (page = 1, pageSize = 5, query) => {
    return axiosInstance.get(`/artists?page=${page}&pageSize=${pageSize}&query=${query}`, {
        params: {
            page,
            pageSize,
            query
        }
    });
};

export async function createArtist(formData) {
    return await axiosInstance.post('/artists', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
}

export async function updateArtist(id, formData) {
    return await axiosInstance.put(`/artists/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
}