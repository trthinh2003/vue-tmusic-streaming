import axiosInstance from "@/configs/axios";
import { useProfileStore } from "@/stores/useProfile";

let refreshTokenInterval = null;

export async function getProfile() {
  const profileStore = useProfileStore();
  const res = await axiosInstance.get("/auth/me");
  console.log("Roles từ BE:", res.data.role);
  profileStore.setProfile(res.data);
}

export async function login(values) {
  const profileStore = useProfileStore();

  const res = await axiosInstance.post('/auth/login', values);
  await getProfile();

  startRefreshTokenTimer();

  return profileStore.profile.role;
}

export async function refreshToken() {
  try {
    await axiosInstance.post('/auth/refresh-token');
    console.log('Đã refresh token!');
  } catch (error) {
    console.error('Lỗi refresh token:', error);
    clearInterval(refreshTokenInterval);
    throw error;
  }
}

export function startRefreshTokenTimer() {
  console.log('Start refresh token timer...');
  if (refreshTokenInterval) clearInterval(refreshTokenInterval);

  refreshTokenInterval = setInterval(() => {
    refreshToken();
    console.log('Refresh token every 25 minutes!');
  }, 25 * 60 * 1000); // 25 phút gọi lên lấy token duy trì login
}

export async function register(data) {
  return axiosInstance.post('/auth/register', data);
}
