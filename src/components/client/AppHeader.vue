<template>
    <div class="main-header d-none d-sm-flex flex-row justify-content-between align-items-center w-100 py-4">
      <h1><span class="text-white">TMusic</span>Streaming</h1>
      <a-button 
        type="text" 
        class="logout-btn"
        @click="$emit('logout')"
      >
        <template #icon>
          <i class="fa-solid fa-right-from-bracket me-1"></i>
        </template>
        <span>Đăng xuất</span>
      </a-button>
    </div>
  </template>
  
  <script setup>
  defineEmits(['logout'])
  </script>