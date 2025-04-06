<template>
    <header class="admin-header">
        <div class="header-left">
            <button class="sidebar-toggle" @click="emit('toggle-sidebar')">
                <i class="fas fa-bars"></i>
            </button>
            <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="header-right">
            <div class="user-profile">
                <img src="" alt="User" class="user-avatar">
                <span class="user-name">Admin User</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <button class="notification-btn">
                <i class="fas fa-bell"></i>
                <span class="notification-badge">3</span>
            </button>
        </div>
    </header>
</template>

<script setup>
import { ref } from 'vue';

const pageTitle = ref('Dashboard');
const emit = defineEmits(['toggle-sidebar']);
</script>

<style src="@/assets/admin/css/header.css"></style>