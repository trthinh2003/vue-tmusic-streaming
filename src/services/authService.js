// authService.js - Updated version
import axiosInstance from "@/configs/axios";
import { useProfileStore } from "@/stores/useProfile";

let refreshTokenInterval = null;
const BE_URL = 'https://tmusic-streaming-net.onrender.com'

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
    profileStore.clearProfile();
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
  stopRefreshTokenTimer();

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

// Social Login Functions
export function loginWithGoogle() {
  const backendUrl = BE_URL || 'http://localhost:5298';
  const googleAuthUrl = `${backendUrl}/api/socialauth/google`;
  
  // Mở popup window cho Google OAuth
  const popup = window.open(
    googleAuthUrl,
    'google-login',
    'width=500,height=600,scrollbars=yes,resizable=yes,left=' + 
    (window.screen.width / 2 - 250) + ',top=' + (window.screen.height / 2 - 300)
  );

  return new Promise((resolve, reject) => {
    // Lắng nghe message từ popup
    const messageListener = (event) => {
      // Kiểm tra origin để bảo mật
      if (event.origin !== backendUrl.replace('/api', '')) {
        return;
      }
      
      if (event.data.type === 'SOCIAL_AUTH_SUCCESS') {
        window.removeEventListener('message', messageListener);
        popup.close();
        checkAuthStatus()
          .then(resolve)
          .catch(reject);
      } else if (event.data.type === 'SOCIAL_AUTH_ERROR') {
        window.removeEventListener('message', messageListener);
        popup.close();
        reject(new Error(event.data.message || 'Đăng nhập Google thất bại'));
      }
    };

    window.addEventListener('message', messageListener);

    // Lắng nghe khi popup đóng
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        // Kiểm tra xem đăng nhập có thành công hay không
        checkAuthStatus()
          .then(resolve)
          .catch(() => reject(new Error('Đăng nhập Google bị hủy')));
      }
    }, 1000);

    // Timeout sau 5 phút
    setTimeout(() => {
      if (!popup.closed) {
        popup.close();
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        reject(new Error('Đăng nhập Google bị timeout'));
      }
    }, 5 * 60 * 1000);
  });
}

export function loginWithFacebook() {
  const backendUrl = BE_URL || 'http://localhost:5298';
  const facebookAuthUrl = `${backendUrl}/api/socialauth/facebook`;
  
  const popup = window.open(
    facebookAuthUrl,
    'facebook-login',
    'width=500,height=600,scrollbars=yes,resizable=yes,left=' + 
    (window.screen.width / 2 - 250) + ',top=' + (window.screen.height / 2 - 300)
  );

  return new Promise((resolve, reject) => {
    const messageListener = (event) => {
      if (event.origin !== backendUrl.replace('/api', '')) {
        return;
      }
      
      if (event.data.type === 'SOCIAL_AUTH_SUCCESS') {
        window.removeEventListener('message', messageListener);
        popup.close();
        checkAuthStatus()
          .then(resolve)
          .catch(reject);
      } else if (event.data.type === 'SOCIAL_AUTH_ERROR') {
        window.removeEventListener('message', messageListener);
        popup.close();
        reject(new Error(event.data.message || 'Đăng nhập Facebook thất bại'));
      }
    };

    window.addEventListener('message', messageListener);

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        checkAuthStatus()
          .then(resolve)
          .catch(() => reject(new Error('Đăng nhập Facebook bị hủy')));
      }
    }, 1000);

    setTimeout(() => {
      if (!popup.closed) {
        popup.close();
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        reject(new Error('Đăng nhập Facebook bị timeout'));
      }
    }, 5 * 60 * 1000);
  });
}

// Kiểm tra trạng thái đăng nhập
export async function checkAuthStatus() {
  try {
    const res = await axiosInstance.get('/socialauth/check-auth');
    
    if (res.data.isAuthenticated) {
      const profileStore = useProfileStore();
      profileStore.setProfile(res.data.user);
      startRefreshTokenTimer();
      return res.data.user;
    } else {
      throw new Error('Chưa đăng nhập');
    }
  } catch (error) {
    console.error('Check auth status error:', error);
    throw error;
  }
}

// Xử lý callback từ social auth (nếu không dùng popup)
export function handleSocialCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('status');
  const message = urlParams.get('message');
  
  if (status === 'success') {
    return { success: true, message: decodeURIComponent(message || 'Đăng nhập thành công') };
  } else {
    return { success: false, message: decodeURIComponent(message || 'Đăng nhập thất bại') };
  }
}

export async function logout() {
  try {
    await axiosInstance.get('/auth/logout');
    const profileStore = useProfileStore();
    profileStore.clearProfile();
    stopRefreshTokenTimer();
  } catch (error) {
    console.error('Logout error:', error);
  }
}