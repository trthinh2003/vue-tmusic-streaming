<template>
    <div class="login-container">
        <div class="login-box">
            <div class="logo-area">
                <img src="@/assets/img/logo.png" alt="TMusic Streaming Logo" class="logo">
                <h2 class="logo-title">TMusic<span>Streaming</span></h2>
            </div>

            <form @submit.prevent="handleLogin" class="login-form">
                <div class="form-group">
                    <label class="ms-1 fw-bold" for="email">Email</label>
                    <input v-model="email" type="email" id="email" placeholder="Nhập email" autocomplete="email" required>
                    <span class="error-text">{{ errors.email }}</span>
                    <i class="fas fa-user input-icon"></i>
                </div>

                <div class="form-group">
                    <label class="ms-1 fw-bold" for="password">Mật khẩu</label>
                    <input v-model="password" type="password" id="password" placeholder="Nhập mật khẩu" autocomplete="new-password" required>
                    <span class="error-text">{{ errors.password }}</span>
                    <i class="fas fa-lock input-icon"></i>
                </div>

                <div class="form-options">
                    <label class="remember-me">
                        <input type="checkbox">
                        <span class="text-dark">Ghi nhớ đăng nhập</span>
                    </label>
                    <a href="#" class="forgot-password">Quên mật khẩu?</a>
                </div>

                <button type="submit" class="login-btn" :disabled="loading">
                    <span v-if="!loading">Đăng nhập</span>
                    <span v-else class="loading">
                        <i class="fas fa-spinner fa-spin"></i> Đang xử lý...
                    </span>
                </button>
            </form>

            <div class="register-link text-center">
                <p class="text-dark">Chưa có tài khoản? <router-link :to="{ name: 'register' }">Đăng ký</router-link></p>
            </div>

            <div class="social-login">
                <p>Hoặc đăng nhập bằng</p>
                <div class="social-icons">
                    <button 
                        class="social-btn google" 
                        @click="handleSocialLogin('google')"
                        :disabled="socialLoading"
                    >
                        <i class="fab fa-google"></i>
                        <span v-if="socialLoading === 'google'">
                            <i class="fas fa-spinner fa-spin"></i>
                        </span>
                    </button>
                    <button 
                        class="social-btn facebook" 
                        @click="handleSocialLogin('facebook')"
                        :disabled="socialLoading"
                    >
                        <i class="fab fa-facebook-f"></i>
                        <span v-if="socialLoading === 'facebook'">
                            <i class="fas fa-spinner fa-spin"></i>
                        </span>
                    </button>
                    <button class="social-btn apple" disabled>
                        <i class="fab fa-apple"></i>
                    </button>
                </div>
            </div>
        </div>

        <div class="login-footer">
            <p>©2025 TMusicStreaming. Bản quyền thuộc về Công ty TMusic.</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';
import { message } from 'ant-design-vue';
import { login, loginWithGoogle, loginWithFacebook, handleSocialCallback, getProfile } from '@/services/authService';

const schema = yup.object({
    email: yup.string().email("Vui lòng nhập đúng định dạng email.").required("Vui lòng nhập email."),
    password: yup.string().required("Vui lòng nhập mật khẩu.").min(6, "Mật khẩu phải có ít nhất 6 ký tự.")
});

const { handleSubmit, errors } = useForm({ validationSchema: schema });
const { value: email } = useField('email');
const { value: password } = useField('password');

const loading = ref(false);
const socialLoading = ref(null);
const router = useRouter();
const route = useRoute();

const handleLogin = handleSubmit(async (values) => {
    try {
        loading.value = true;
        const role = await login(values);
        await nextGo(role === 'User' ? 'client' : 'admin-dashboards');
    } catch (error) {
        console.error("Login error:", error);
        const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi!";
        message.error(errorMessage);
    } finally {
        loading.value = false;
    }
});

const handleSocialLogin = async (platform) => {
    try {
        socialLoading.value = platform;
        
        let user;
        if (platform === 'google') {
            user = await loginWithGoogle();
        } else if (platform === 'facebook') {
            user = await loginWithFacebook();
        }
        
        if (user) {
            message.success('Đăng nhập thành công!');
            await nextGo(user.role === 'User' ? 'client' : 'admin-dashboards');
        }
    } catch (error) {
        console.error(`${platform} login error:`, error);
        message.error(`Đăng nhập bằng ${platform} thất bại: ${error.message}`);
    } finally {
        socialLoading.value = null;
    }
};

const nextGo = async (name) => {
    const hide = message.loading('Đang chuyển trang...', 5000);
    await router.push({ name });
    hide();
    window.location.reload();
};

// Xử lý callback từ social auth nếu có
onMounted(() => {
    // Kiểm tra nếu đang ở callback route
    if (route.path === '/auth/callback') {
        const result = handleSocialCallback();
        if (result.success) {
            message.success(result.message);
            // Redirect về trang chính sau khi đăng nhập thành công
            setTimeout(async () => {
                try {
                    const user = await getProfile();
                    await nextGo(user.role === 'User' ? 'client' : 'admin-dashboards');
                } catch (error) {
                    console.error('Error getting profile after social callback:', error);
                    router.push({ name: 'login' });
                }
            }, 1000);
        } else {
            message.error(result.message);
            router.push({ name: 'login' });
        }
    }
});
</script>

<style scoped src="@/assets/admin/css/login.css"></style>