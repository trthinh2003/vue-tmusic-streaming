<template>
    <div class="login-container">
        <div class="login-box">
            <div class="logo-area">
                <img src="@/assets/img/logo.png" alt="Music Admin Logo" class="logo">
                <h2 class="logo-title">TMusic<span>Streaming</span></h2>
            </div>

            <form @submit.prevent="handleLogin" class="login-form">
                <div class="form-group">
                    <label class="ms-1 fw-bold" for="email">Email</label>
                    <input v-model="email" type="email" id="email" placeholder="Nhập email" required>
                    <span class="error-text">{{ errors.email }}</span>
                    <i class="fas fa-user input-icon"></i>
                </div>

                <div class="form-group">
                    <label class="ms-1 fw-bold" for="password">Mật khẩu</label>
                    <input v-model="password" type="password" id="password" placeholder="Nhập mật khẩu" required>
                    <span class="error-text">{{ errors.password }}</span>
                    <i class="fas fa-lock input-icon"></i>
                </div>

                <div class="form-options">
                    <label class="remember-me">
                        <input type="checkbox">
                        <span>Ghi nhớ đăng nhập</span>
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

            <div class="social-login">
                <p>Hoặc đăng nhập bằng</p>
                <div class="social-icons">
                    <button class="social-btn google">
                        <i class="fab fa-google"></i>
                    </button>
                    <button class="social-btn facebook">
                        <i class="fab fa-facebook-f"></i>
                    </button>
                    <button class="social-btn apple">
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
import { ref } from 'vue';
import axiosInstance from '@/configs/axios.js';
import { useRouter } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';
import { message } from 'ant-design-vue';
import { getProfile } from '@/services/authService';
import { useProfileStore } from '@/stores/useProfile.js';

const profileStore = useProfileStore();

const schema = yup.object({
    email: yup.string().email("Vui lòng nhập đúng định dạng email.").required("Vui lòng nhập email."),
    password: yup.string().required("Vui lòng nhập mật khẩu.").min(6, "Mật khẩu phải có ít nhất 6 ký tự.")
});

const { handleSubmit, errors } = useForm({ validationSchema: schema });
const { value: email } = useField('email');
const { value: password } = useField('password');

const loading = ref(false);
const router = useRouter();

const handleLogin = handleSubmit(async (values) => {
    try {
        // console.log(values);
        loading.value = true;
        const response = await axiosInstance.post('/auth/login', values);
        message.success(response.data.message);
        await getProfile();
        console.log(profileStore.profile.role);
        if (profileStore.profile.role === 'User') {
            setTimeout(() => { router.push({ name: 'client' }); }, 500);
        }
        else {
            setTimeout(() => { router.push({ name: 'admin-dashboard' }); }, 500);
        }
    } catch (error) {
        console.error("Login error:", error);
        const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi!";
        message.error(errorMessage);
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped src="@/assets/admin/css/login.css"></style>
