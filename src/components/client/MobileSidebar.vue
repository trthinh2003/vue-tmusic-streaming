<template>
    <a-drawer 
      v-model:open="visible"
      placement="left"
      class="mobile-drawer"
      :width="300"
      :body-style="{ padding: 0 }"
    >
      <div class="sidebar h-100">
        <h1><span class="text-white">TMusic</span>Streaming</h1>
        <div class="search p-3">
          <a-input-search
            v-model:value="searchQuery"
            placeholder="Tìm kiếm bài hát..."
            @search="$emit('search')"
          />
        </div>
        <div class="advance-filter d-flex align-items-center justify-content-center">
          <a-button 
            type="text" 
            class="advance-filter-btn p-1"
            style="background-color: #444; width: 50%;"
            @click="$emit('show-filter-modal')"
          >
            <template #icon>
              <i class="fa-solid fa-filter me-1"></i> Lọc nâng cao
            </template>
          </a-button>
        </div>
        <playlist 
          :songs="songs" 
          :current-song="currentSong"
          @select-song="handleSelectSong"
        />
      </div>
    </a-drawer>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const visible = ref(false)
  
  defineProps({
    searchQuery: String,
    songs: Array,
    currentSong: Object
  })
  
  defineEmits(['search', 'show-filter-modal', 'select-song'])
  
  const handleSelectSong = (song) => {
    visible.value = false
    emit('select-song', song)
  }
  
  defineExpose({
    showDrawer: () => { visible.value = true }
  })
  </script>