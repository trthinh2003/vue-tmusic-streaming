import axiosInstance from "@/configs/axios";

export const checkFavorite = async (songId) => {
    try {
        const response = await axiosInstance.get(`/favorite/check/${songId}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi kiểm tra favorite:', error);
        throw error;
    }
};

// Lấy danh sách bài hát yêu thích của user
export const getMyFavorites = async (page = 1, pageSize = 20) => {
    try {
        const response = await axiosInstance.get(`/favorite/my-favorites?page=${page}&pageSize=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách favorite:', error);
        throw error;
    }
};

// Lấy số lượng bài hát yêu thích
export const getFavoriteCount = async () => {
    try {
        const response = await axiosInstance.get('/favorite/count');
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy số lượng favorite:', error);
        throw error;
    }
};

// Lấy danh sách ID của các bài hát yêu thích
export const getFavoriteSongIds = async () => {
    try {
        const response = await axiosInstance.get('/favorite/song-ids');
        return response.data.SongIds || [];
    } catch (error) {
        console.error('Lỗi khi lấy danh sách song IDs:', error);
        throw error;
    }
};

// Thêm bài hát vào danh sách yêu thích
export const addToFavorite = async (songId) => {
    try {
        const response = await axiosInstance.post('/favorite/add', { songId });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi thêm favorite:', error);
        throw error;
    }
};

// Xóa bài hát khỏi danh sách yêu thích
export const removeFromFavorite = async (songId) => {
    try {
        const response = await axiosInstance.delete('/favorite/remove', { 
            data: { songId } 
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi xóa favorite:', error);
        throw error;
    }
};

export const toggleFavorite = async (songId) => {
    try {
        const response = await axiosInstance.post(`/favorite/toggle/${songId}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi toggle favorite:', error);
        throw error;
    }
};