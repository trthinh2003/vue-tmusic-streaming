<template>
  <a-modal
    :open="modelValue"
    @update:open="val => emit('update:modelValue', val)"
    :footer="null"
    width="400px"
    centered
  >
    <div class="playlist-modal-header mb-3" 
      style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); 
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 1.1rem;
        font-weight: bold; 
        color: white;
      "
    >
      <plus-outlined />
      Thêm vào playlist
    </div>
    
    <div class="playlist-modal-content">
      <h3 v-if="selectedSong" class="song-title">
        Thêm "<span>{{ selectedSong.title }}</span>" vào:
      </h3>
      
      <div class="playlist-list">
        <div 
          v-for="playlist in playlists" 
          :key="playlist.id"
          class="playlist-item"
          @click="$emit('add-to-playlist', playlist.id)"
        >
          <div class="playlist-info">
            <div class="playlist-name">{{ playlist.name }}</div>
            <div class="playlist-count">{{ playlist.songCount }} bài hát</div>
          </div>
          <div class="playlist-add-btn">
            <plus-outlined />
          </div>
        </div>
      </div>
      
      <div class="create-playlist">
        <a-input
          :value="newPlaylistName"
          placeholder="Tạo playlist mới"
          size="large"
          @keyup.enter="handleCreatePlaylist"
        >
          <template #addonAfter>
            <a-button 
              type="primary" 
              @click="handleCreatePlaylist"
              :disabled="!newPlaylistName.trim()"
            >
              Tạo
            </a-button>
          </template>
        </a-input>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { PlusOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  modelValue: Boolean,
  selectedSong: Object,
  playlists: Array,
  newPlaylistName: String
});

const emit = defineEmits([
  'update:modelValue', 
  'update:newPlaylistName',
  'add-to-playlist', 
  'create-playlist'
]);

const handleCreatePlaylist = () => {
  emit('create-playlist');
};
</script>

<style scoped>
/* Playlist modal styles */
.playlist-modal-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 10px;
}

.playlist-modal-content .song-title {
  color: white;
  margin-bottom: 20px;
  font-weight: 500;
}

.playlist-modal-content .song-title span {
  color: #00dbde;
  font-weight: 600;
}

.playlist-list {
  margin-bottom: 20px;
}

.playlist-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s;
}

.playlist-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.playlist-info {
  flex: 1;
}

.playlist-name {
  color: white;
  font-weight: 500;
  margin-bottom: 4px;
}

.playlist-count {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.playlist-add-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(0, 219, 222, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00dbde;
}

.create-playlist {
  margin-top: 20px;
}

.create-playlist :deep(.ant-input-group-addon) {
  background: transparent !important;
  border: none !important;
}

.create-playlist :deep(.ant-input) {
  background: #6d6f89;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}

.create-playlist :deep(.ant-btn) {
  height: 40px;
  background: linear-gradient(90deg, #00dbde 0%, #fc00ff 100%);
  border: none;
}

/* Modal header style */
:deep(.ant-modal .ant-modal-title) {
  color: white !important;
  font-weight: 600;
}

:deep(.ant-modal .ant-modal-content) {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
}

:deep(.ant-modal .ant-modal-close-x) {
  color: rgba(255, 255, 255, 0.7) !important;
}
</style>