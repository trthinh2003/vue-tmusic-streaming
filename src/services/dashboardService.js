import axiosInstance from "@/configs/axios";

export async function getDashboardSummary() {
    return await axiosInstance.get("/dashboard/summary");
}

export async function getTopSongsByPlays(params) {
    return await axiosInstance.get("/dashboard/songs/top-plays", { params });
}

export async function getTopSongsByDownloads(params) {
    return await axiosInstance.get("/dashboard/songs/top-downloads", { params });
}

export async function getSongCountByGenre(params) {
    return await axiosInstance.get("/dashboard/songs/genre-distribution", { params });
}

export async function getNewUsersTrend(params) {
    return await axiosInstance.get("/dashboard/trends/new-users", { params });
}

export async function getNewSongsTrend(params) {
    return await axiosInstance.get("/dashboard/trends/new-songs", { params });
}

export async function getTotalPlaysTrend(params) {
    return await axiosInstance.get("/dashboard/trends/total-plays", { params });
}

export const getCloudinaryUsage = () => {
    return axiosInstance.get('/dashboard/cloudinary-usage');
};

export async function exportDashboardPdf(params) {
    return await axiosInstance.get("/dashboard/export/pdf", { params, responseType: 'blob' }); // 'blob' cho file download
}

export async function exportDashboardExcel(params) {
    return await axiosInstance.get("/dashboard/export/excel", { params, responseType: 'blob' }); 
}