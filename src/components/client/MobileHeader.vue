<template>
    <div class="mobile-header d-flex d-sm-none align-items-center justify-content-between p-3">
      <a-button type="text" @click="$emit('show-drawer')">
        <i class="fa-solid fa-bars"></i>
      </a-button>
      <div class="ms-4">
        <i class="fa-solid fa-music me-1"></i>
        <p class="d-inline"><span class="text-white">TMusic</span>Streaming</p>
      </div>
      <a-button 
        type="text" 
        class="logout-btn"
        @click="$emit('logout')"
        style="text-align: end;"
      >
        <template #icon>
          <i class="fa-solid fa-right-from-bracket me-1"></i>
        </template>
        <span>Đăng xuất</span>
      </a-button>
    </div>
  </template>
  
  <script setup>
  defineEmits(['show-drawer', 'logout'])
  </script>