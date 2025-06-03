import axiosInstance from "@/configs/axios";

export async function getDashboard() {
    return await axiosInstance.get("/dashboard");
}

export const getCloudinaryUsage = () => {
  return axiosInstance.get('/dashboard/cloudinary-usage');
};