import axiosInstance from "@/configs/axios";

export async function getArtists(page = 1, pageSize = 5) {
    return await axiosInstance.get(`/artists?page=${page}&pageSize=${pageSize}`);
}

export async function getMyArtistsWithSongs(page = 1, pageSize = 5, query = '') {
    return await axiosInstance.get(`/artists/with-songs/me?page=${page}&pageSize=${pageSize}&query=${query}`);
}

export async function followArtist(artistId) {
    return await axiosInstance.post(`/artists/follow/${artistId}`);
}

export async function unfollowArtist(artistId) {
    return await axiosInstance.delete(`/artists/unfollow/${artistId}`);
}

export async function getFollowedArtists(page = 1, pageSize = 10) {
    return await axiosInstance.get(`/artists/followed?page=${page}&pageSize=${pageSize}`);
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