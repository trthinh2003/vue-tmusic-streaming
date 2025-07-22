import axiosInstance from "@/configs/axios";

export async function getAlbums(page = 1, pageSize = 5) {
    return await axiosInstance.get(`/albums?page=${page}&pageSize=${pageSize}`);
}

export const getAlbumById = (id) => {
    return axiosInstance.get(`/albums/${id}`);
};

export async function getAlbumsForCreateSong(page = 1, pageSize = 5) {
    return await axiosInstance.get(`/albums/get-albums-for-create-song?page=${page}&pageSize=${pageSize}`);
}

export const getAlbumWithSongs = async (page = 1, pageSize = 6, query = '') => {
  const response = await axiosInstance.get('/albums/get-albums-with-songs', {
    params: { page, pageSize, query }
  });
  return response;
};

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
    return axiosInstance.post('/albums', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
    });
};

export const updateAlbum = (id, formData) => {
    return axiosInstance.put(`/albums/${id}`, formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
    });
};

export const deleteAlbum = (id) => {
    return axiosInstance.delete(`/albums/${id}`);
};