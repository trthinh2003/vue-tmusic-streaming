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
                <img src="@/assets/img/admin-logo.png" alt="User" class="user-avatar">
                <span class="user-name">Admin</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <button class="notification-btn">
                <i class="fas fa-bell"></i>
                <span class="notification-badge">0</span>
            </button>
        </div>
    </header>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const emit = defineEmits(['toggle-sidebar']);
const route = useRoute();

const pageTitle = ref('');

function updateTitle(routeName) {
  if (!routeName) return;
  const parts = routeName.split('-');
  if (parts.length > 1) {
    pageTitle.value = (parts[1].charAt(0).toUpperCase() + parts[1].slice(1)).slice(0, -1);
  } else {
    pageTitle.value = routeName.charAt(0).toUpperCase() + routeName.slice(1).slice(0, -1);
  }
}

watch(() => route.name, (newName) => {
  updateTitle(newName);
}, { immediate: true });
</script>

<style src="@/assets/admin/css/header.css"></style>