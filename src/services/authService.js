import axiosInstance from "@/configs/axios";
import { useProfileStore } from "@/stores/useProfile";

let refreshTokenInterval = null;

export async function getProfile() {
  const profileStore = useProfileStore();
  try {
    const res = await axiosInstance.get("/auth/me");
    console.log("Roles từ BE:", res.data.role);
    profileStore.setProfile(res.data);
    
    // Khởi động timer sau khi get profile thành công
    startRefreshTokenTimer();
    
    return res.data;
  } catch (error) {
    console.error("Get profile error:", error);
    profileStore.clearProfile(); // Xóa profile cũ
    throw error;
  }
}

export async function login(values) {
  const profileStore = useProfileStore();

  const res = await axiosInstance.post('/auth/login', values);
  await getProfile();

  return profileStore.profile.role;
}

export async function refreshToken() {
  try {
    await axiosInstance.post('/auth/refresh-token');
    console.log('Đã refresh token!');
  } catch (error) {
    console.error('Lỗi refresh token:', error);
    stopRefreshTokenTimer();
    throw error;
  }
}

export function startRefreshTokenTimer() {
  console.log('Start refresh token timer...');
  stopRefreshTokenTimer(); // Clear timer cũ trước

  refreshTokenInterval = setInterval(() => {
    refreshToken();
    console.log('Refresh token every 25 minutes!');
  }, 25 * 60 * 1000);
}

export function stopRefreshTokenTimer() {
  if (refreshTokenInterval) {
    clearInterval(refreshTokenInterval);
    refreshTokenInterval = null;
  }
}

export async function register(data) {
  return axiosInstance.post('/auth/register', data);
}