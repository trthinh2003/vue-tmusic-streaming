<template>
    <nav class="admin-nav">
        <div class="sidebar-header">
            <h2 class="logo">TMusic<span>Admin</span></h2>
            <button class="sidebar-close" @click="closeSidebar">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <div class="sidebar-content">
            <!-- Dashboard Section -->
            <div class="menu-section">
                <div class="section-title" @click="toggleSection('dashboard')">
                    <span>Tổng quan</span>
                    <i class="fas" :class="openSections.dashboard ? 'fa-angle-up' : 'fa-angle-down'"></i>
                </div>
                <ul class="sidebar-menu" v-show="openSections.dashboard">
                    <li class="menu-item" :class="{ 'active': $route.path === '/admin/dashboards' }">
                        <router-link to="/admin/dashboards">
                            <i class="fas fa-tachometer-alt"></i>
                            <span>Bảng điều khiển</span>
                        </router-link>
                    </li>
                </ul>
            </div>

            <!-- Content Management Section -->
            <div class="menu-section">
                <div class="section-title" @click="toggleSection('content')">
                    <span>Quản lý nội dung</span>
                    <i class="fas" :class="openSections.content ? 'fa-angle-up' : 'fa-angle-down'"></i>
                </div>
                <ul class="sidebar-menu" v-show="openSections.content">
                    <li class="menu-item" :class="{ 'active': $route.path.startsWith('/admin/artists') }">
                        <router-link to="/admin/artists">
                            <i class="fas fa-users"></i>
                            <span>Nghệ sĩ</span>
                        </router-link>
                    </li>
                    <li class="menu-item" :class="{ 'active': $route.path.startsWith('/admin/songs') }">
                        <router-link to="/admin/songs">
                            <i class="fas fa-music"></i>
                            <span>Bài hát</span>
                        </router-link>
                    </li>
                    <li class="menu-item" :class="{ 'active': $route.path.startsWith('/admin/albums') }">
                        <router-link to="/admin/albums">
                            <i class="fas fa-compact-disc"></i>
                            <span>Albums</span>
                        </router-link>
                    </li>
                    <li class="menu-item" :class="{ 'active': $route.path.startsWith('/admin/genres') }">
                        <router-link to="/admin/genres">
                            <i class="fas fa-tags"></i>
                            <span>Thể loại</span>
                        </router-link>
                    </li>
                </ul>
            </div>

            <!-- Statistics Section -->
            <!-- <div class="menu-section">
                <div class="section-title" @click="toggleSection('stats')">
                    <span>Thống kê</span>
                    <i class="fas" :class="openSections.stats ? 'fa-angle-up' : 'fa-angle-down'"></i>
                </div>
                <ul class="sidebar-menu" v-show="openSections.stats">
                    <li class="menu-item" :class="{ 'active': $route.path.startsWith('/admin/listen-stats') }">
                        <router-link to="/admin/listen-stats">
                            <i class="fas fa-chart-line"></i>
                            <span>Lượt nghe</span>
                        </router-link>
                    </li>
                    <li class="menu-item" :class="{ 'active': $route.path.startsWith('/admin/user-stats') }">
                        <router-link to="/admin/user-stats">
                            <i class="fa-solid fa-user"></i>
                            <span>Người dùng</span>
                        </router-link>
                    </li>
                </ul>
            </div> -->

            <!-- Community Section -->
            <div class="menu-section">
                <div class="section-title" @click="toggleSection('community')">
                    <span>Cộng đồng</span>
                    <i class="fas" :class="openSections.community ? 'fa-angle-up' : 'fa-angle-down'"></i>
                </div>
                <ul class="sidebar-menu" v-show="openSections.community">
                    <li class="menu-item" :class="{ 'active': $route.path.startsWith('/admin/comments') }">
                        <router-link to="/admin/comments">
                            <i class="fas fa-comments"></i>
                            <span>Bình luận</span>
                        </router-link>
                    </li>
                    <li class="menu-item" :class="{ 'active': $route.path.startsWith('/admin/playlists') }">
                        <router-link to="/admin/playlists">
                            <i class="fas fa-list-ol"></i>
                            <span>Playlist</span>
                        </router-link>
                    </li>
                </ul>
            </div>

            <!-- System Section -->
            <div class="menu-section">
                <div class="section-title" @click="toggleSection('system')">
                    <span>Hệ thống</span>
                    <i class="fas" :class="openSections.system ? 'fa-angle-up' : 'fa-angle-down'"></i>
                </div>
                <ul class="sidebar-menu" v-show="openSections.system">
                    <li class="menu-item" :class="{ 'active': $route.path.startsWith('/admin/users') }">
                        <router-link to="/admin/users">
                            <i class="fas fa-user-cog"></i>
                            <span>Tài khoản</span>
                        </router-link>
                    </li>
                    <!-- <li class="menu-item" :class="{ 'active': $route.path.startsWith('/admin/settings') }">
                        <router-link to="/admin/settings">
                            <i class="fas fa-cog"></i>
                            <span>Cài đặt</span>
                        </router-link>
                    </li> -->
                </ul>
            </div>
        </div>

        <div class="sidebar-footer">
            <button class="logout-btn" @click="handleLogout" :disabled="loading">
                <span v-if="!loading">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Đăng xuất</span>
                </span>
                <span v-else>
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Đang đăng xuất...</span>
                </span>
            </button>
        </div>
    </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axiosInstance from '@/configs/axios';
import { useRouter } from 'vue-router';

const route = useRoute();
const emit = defineEmits(['close']);
const loading = ref(false);
const router = useRouter();

const openSections = ref({
    dashboard: true,
    content: true,
    stats: true,
    community: true,
    system: true
});

const toggleSection = (section) => {
    openSections.value[section] = !openSections.value[section];
};

// Đóng sidebar cho mobile
const closeSidebar = () => {
    emit('close');
};

const handleLogout = async() => {
    console.log('Logging out...');
    try {
        loading.value = true;
        const response = await axiosInstance.get('/auth/logout');
        console.log(response.data.message);
        setTimeout(() => { 
            router.push({ name: 'login' }); 
        }, 1000);
    } catch (error) {
        console.error("Logout error:", error);
    } finally {
        loading.value = true;
    }
};

onMounted(() => {
    const path = route.path;
    if (path.startsWith('/admin/artists') || path.startsWith('/admin/songs') ||
        path.startsWith('/admin/albums') || path.startsWith('/admin/genres')) {
        openSections.value.content = true;
    } else if (path.startsWith('/admin/listen-stats') || path.startsWith('/admin/user-stats')) {
        openSections.value.stats = true;
    } else if (path.startsWith('/admin/comments') || path.startsWith('/admin/playlists')) {
        openSections.value.community = true;
    } else if (path.startsWith('/admin/users') || path.startsWith('/admin/settings')) {
        openSections.value.system = true;
    }
});
</script>

<style scoped src="@/assets/admin/css/sidebar.css"></style>