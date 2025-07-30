import axiosInstance from "@/configs/axios";

export async function getGenres() {
    return await axiosInstance.get("/genres");
}

// Thêm method mới cho pagination
export async function getGenresPaginate(page = 1, pageSize = 10) {
    return await axiosInstance.get(`/genres/paginate?page=${page}&pageSize=${pageSize}`);
}

export async function getGenre(id) {
    return await axiosInstance.get(`/genres/${id}`);
}

export async function getGenresForFilter(query = '') {
    return await axiosInstance.get(`/genres/for-filter?query=${query}`);
}

// Cập nhật để gửi FormData thay vì JSON
export async function createGenre(genreData) {
    const formData = new FormData();
    formData.append('name', genreData.name);
    if (genreData.image) {
        formData.append('image', genreData.image);
    }
    
    return await axiosInstance.post("/genres", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

export async function updateGenre(id, genreData) {
    const formData = new FormData();
    formData.append('name', genreData.name);
    if (genreData.image) {
        formData.append('image', genreData.image);
    }
    
    return await axiosInstance.put(`/genres/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

export async function deleteGenre(id) {
    return await axiosInstance.delete(`/genres/${id}`);
}