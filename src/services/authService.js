import axiosInstance from "@/configs/axios";
import { useProfileStore } from "@/stores/useProfile";

export async function getProfile() {
  const profileStore = useProfileStore();
  
  const res = await axiosInstance.get("/auth/me");
  console.log("Roles từ BE:", res.data.role);
  
  profileStore.setProfile(res.data);
}