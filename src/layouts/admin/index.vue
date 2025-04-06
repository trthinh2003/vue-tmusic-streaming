<template>
  <div class="admin-container">
    <div class="admin-layout">
      <!-- Mobile Sidebar Overlay -->
      <div class="sidebar-overlay" v-if="isMobile && showSidebar" @click="closeSidebar"></div>

      <!-- Sidebar -->
      <aside class="admin-sidebar" :class="{
        'collapsed': isSidebarCollapsed && !isMobile,
        'mobile-open': isMobile && showSidebar
      }">
        <Sidebar @close="closeSidebar" />
      </aside>

      <!-- Main Content -->
      <div class="admin-main">
        <Header @toggle-sidebar="toggleSidebar" :sidebar-collapsed="isSidebarCollapsed" :is-mobile="isMobile" />
        <main class="admin-content">
          <router-view></router-view>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Header from "@/components/admin/Header.vue";
import Sidebar from "@/components/admin/Sidebar.vue";

const isSidebarCollapsed = ref(false);
const showSidebar = ref(false);
const isMobile = ref(false);

const checkIfMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

const toggleSidebar = () => {
  if (isMobile.value) {
    showSidebar.value = !showSidebar.value;
  } else {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
    localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.value);
  }
};

const closeSidebar = () => {
  if (isMobile.value) {
    showSidebar.value = false;
  }
};

const savedState = localStorage.getItem('sidebarCollapsed');
if (savedState !== null) {
  isSidebarCollapsed.value = savedState === 'true';
}

onMounted(() => {
  checkIfMobile();
  window.addEventListener('resize', checkIfMobile);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIfMobile);
});
</script>

<style scoped src="@/assets/admin/css/main.css"></style>