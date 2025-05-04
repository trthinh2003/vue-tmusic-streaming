import axiosInstance from "@/configs/axios";

export async function getGenres() {
    return await axiosInstance.get("/genres");
}