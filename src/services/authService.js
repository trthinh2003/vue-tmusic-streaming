import axiosInstance from "@/configs/axios";
import { useProfileStore } from "@/stores/useProfile";

let refreshTokenInterval = null;

export async function getProfile() {
  const profileStore = useProfileStore();
  try {
    const res = await axiosInstance.get("/auth/me");
    profileStore.setProfile(res.data);
    
    startRefreshTokenTimer();
    
    return res.data;
  } catch (error) {
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
  stopRefreshTokenTimer();

  refreshTokenInterval = setInterval(() => {
    refreshToken();
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

export async function handlePostLoginRedirect(userRole) {
  const urlParams = new URLSearchParams(window.location.search);
  const intendedUrl = urlParams.get('returnUrl') || '/watch';
  
  window.history.replaceState({}, document.title, window.location.pathname);
  
  if (userRole === 'Admin') {
    return '/admin/dashboards';
  } else {
    return intendedUrl === '/watch' ? '/watch' : intendedUrl;
  }
}

// Social Login Functions - Fixed URLs
export function loginWithGoogle() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5298';
  const frontendReturnUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';
  
  const googleAuthUrl = `${backendUrl}/api/socialauth/google?returnUrl=${encodeURIComponent(frontendReturnUrl)}`;
  
  console.log('Google Auth URL:', googleAuthUrl);
  window.location.href = googleAuthUrl;
}

export function loginWithFacebook() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5298';
  
  const facebookAuthUrl = `${backendUrl}/api/socialauth/facebook`;
  
  console.log('Facebook Auth URL:', facebookAuthUrl);
  
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
    // Sử dụng lowercase cho URL
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

// Xử lý callback từ social auth 
export function handleSocialCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('status');
  const message = urlParams.get('message');
  
  console.log('Social callback:', { status, message });
  
  if (status === 'success') {
    return { success: true, message: decodeURIComponent(message || 'Đăng nhập thành công') };
  } else {
    return { success: false, message: decodeURIComponent(message || 'Đăng nhập thất bại') };
  }
}

// Test function để kiểm tra kết nối
export async function testSocialAuthController() {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5298';
    const testUrl = `${backendUrl}/api/socialauth/test`;
    
    const response = await fetch(testUrl);
    const data = await response.json();
    
    console.log('SocialAuth controller test:', data);
    return data;
  } catch (error) {
    console.error('SocialAuth controller test failed:', error);
    throw error;
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