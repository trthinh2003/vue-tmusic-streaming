<template>
    <div class="sidebar d-none d-sm-flex flex-sm-column flex-row">
      <div class="d-none d-sm-block">
        <h1 class=""><span class="text-white">TMusic</span>Streaming</h1>
        <div class="search p-3">
          <a-input-search
            v-model:value="searchQuery"
            placeholder="Tìm kiếm bài hát..."
            @search="$emit('search')"
            enter-button
          />
        </div>
      </div>
      <div class="advance-filter d-flex align-items-center justify-content-center">
        <a-button 
          type="text" 
          class="advance-filter-btn p-1 w-75"
          style="background-color: #444;"
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
        @select-song="$emit('select-song', $event)"
        class="d-none d-sm-block"
      />
    </div>
  </template>
  
  <script setup>
  defineProps({
    searchQuery: String,
    songs: Array,
    currentSong: Object
  })
  
  defineEmits(['search', 'show-filter-modal', 'select-song'])
  </script>