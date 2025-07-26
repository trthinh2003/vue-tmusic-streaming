<template>
  <div class="callback-container">
    <div class="callback-content">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Đang xử lý đăng nhập...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { handleSocialCallback, checkAuthStatus } from '@/services/authService';

const router = useRouter();

onMounted(async () => {
  try {
    // Xử lý callback từ URL
    const result = handleSocialCallback();
    
    if (result.success) {
      message.success(result.message);
      
      // Kiểm tra trạng thái đăng nhập và chuyển hướng
      setTimeout(async () => {
        try {
          const user = await checkAuthStatus();
          const redirectRoute = user.role === 'User' ? 'client' : 'admin-dashboards';
          
          // Thông báo thành công cho parent window nếu đây là popup
          if (window.opener) {
            window.opener.postMessage({
              type: 'SOCIAL_AUTH_SUCCESS',
              user: user
            }, window.location.origin);
            window.close();
          } else {
            // Redirect nếu không phải popup
            await router.push({ name: redirectRoute });
            window.location.reload();
          }
        } catch (error) {
          console.error('Error after social login:', error);
          
          if (window.opener) {
            window.opener.postMessage({
              type: 'SOCIAL_AUTH_ERROR',
              message: 'Không thể lấy thông tin người dùng'
            }, window.location.origin);
            window.close();
          } else {
            message.error('Không thể lấy thông tin người dùng');
            router.push({ name: 'login' });
          }
        }
      }, 1000);
    } else {
      message.error(result.message);
      
      if (window.opener) {
        window.opener.postMessage({
          type: 'SOCIAL_AUTH_ERROR',
          message: result.message
        }, window.location.origin);
        window.close();
      } else {
        setTimeout(() => {
          router.push({ name: 'login' });
        }, 2000);
      }
    }
  } catch (error) {
    console.error('Callback processing error:', error);
    message.error('Đã xảy ra lỗi trong quá trình xử lý');
    
    if (window.opener) {
      window.opener.postMessage({
        type: 'SOCIAL_AUTH_ERROR',
        message: 'Đã xảy ra lỗi trong quá trình xử lý'
      }, window.location.origin);
      window.close();
    } else {
      setTimeout(() => {
        router.push({ name: 'login' });
      }, 2000);
    }
  }
});
</script>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.callback-content {
  text-align: center;
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.loading-spinner i {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

p {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}
</style>