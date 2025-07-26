<template>
  <div class="playlist mt-4">
    <div class="playlist-header">
      <h2>Danh sách nhạc</h2>
      <div class="actions">
        <!-- Nút Playlist với tooltip -->
        <a-tooltip title="Quản lý Playlist" placement="top">
          <a-button 
            type="primary" 
            @click="emitOpenModal" 
            size="small"
            class="playlist-btn"
          >
            <template #icon>
              <Icon icon="material-symbols:queue-music" />
            </template>
          </a-button>
        </a-tooltip>
        
        <!-- Nút Yêu thích với tooltip -->
        <a-tooltip title="Danh sách Yêu thích" placement="top">
          <a-button 
            type="primary" 
            @click="emitOpenFavoriteModal" 
            size="small"
            class="favorite-btn"
            style="background-color: #ff4d4f; border-color: #ff4d4f;"
          >
            <template #icon>
              <Icon icon="ph:heart-fill" />
            </template>
          </a-button>
        </a-tooltip>
      </div>
    </div>
    
    <div v-if="(currentPlaylist && currentPlaylistId) || currentFavoriteList" class="current-playlist-info">
      <div class="playlist-details">
        <span class="playlist-name">
          {{ currentPlaylistName || currentPlaylist?.name || 'Danh sách nhạc' }}
        </span>
        <span class="song-count">{{ filteredSongs.length }} bài hát</span>
      </div>
      <a-tooltip title="Quay lại danh sách ban đầu" placement="top">
        <a-button 
          type="text" 
          size="small" 
          @click="clearCurrentList"
          class="clear-btn"
        >
          <template #icon>
            <Icon icon="material-symbols:close" />
          </template>
          {{ clearButtonText }}
        </a-button>
      </a-tooltip>
    </div>
    
    <div class="song-list-container">
      <a-empty 
        v-if="filteredSongs.length === 0" 
        description="Không có bài hát trong playlist"
        class="empty-placeholder"
      />
      
      <ul v-else>
        <song-item 
          v-for="song in paginatedSongs" 
          :key="song.id" 
          :song="song" 
          :is-current="song.id === currentSong.id"
          @click.native="$emit('select-song', song)" 
        />
      </ul>
    </div>
    
    <div v-if="filteredSongs.length > itemsPerPage" class="pagination-controls">
      <div class="simple-pagination">
        <a-tooltip title="Trang trước" placement="top">
          <button 
            class="page-button prev"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            <Icon icon="material-symbols:chevron-left" />
          </button>
        </a-tooltip>
        
        <span class="page-indicator">{{ currentPage }}/{{ totalPages }}</span>
        
        <a-tooltip title="Trang sau" placement="top">
          <button 
            class="page-button next"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            <Icon icon="material-symbols:chevron-right" />
          </button>
        </a-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
import SongItem from './SongItem.vue';
import { ref, computed, watch } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  songs: {
    type: Array,
    default: () => []
  },
  currentSong: {
    type: Object,
    default: () => ({})
  },
  availablePlaylists: {
    type: Array,
    default: () => []
  },
  currentPlaylistId: {
    type: [String, Number],
    default: null
  },
  itemsPerPage: {
    type: Number,
    default: 3
  }
});

const emit = defineEmits(['select-song', 'change-playlist', 'open-modal', 'open-favorite-modal', 'clear-favorites']);

const currentPage = ref(1);
const currentFavoriteList = ref(false);

const filteredSongs = computed(() => {
  // Nếu không có playlist được chọn hoặc đã clear, trả về tất cả bài hát
  if (!props.currentPlaylistId) {
    return props.songs;
  }
  
  return props.songs.filter(song => 
    (song.playlistIds && song.playlistIds.includes(props.currentPlaylistId)) || 
    song.playlistId === props.currentPlaylistId
  );
});

const paginatedSongs = computed(() => {
  if (filteredSongs.value.length === 0) return [];
  
  const start = (currentPage.value - 1) * props.itemsPerPage;
  const end = start + props.itemsPerPage;
  return filteredSongs.value.slice(start, end);
});

const currentPlaylist = computed(() => {
  if (!props.currentPlaylistId || !props.availablePlaylists?.length) return null;
  return props.availablePlaylists.find(playlist => playlist.id === props.currentPlaylistId);
});

const currentPlaylistName = computed(() => {
  if (currentFavoriteList.value) return 'Danh sách yêu thích';
  if (props.currentPlaylist) return props.currentPlaylist.name;
  return '';
});

const clearButtonText = computed(() => {
  return currentFavoriteList.value ? 'Quay lại' : 'Xóa playlist';
});

const clearCurrentList = () => {
  if (currentFavoriteList.value) {
    currentFavoriteList.value = false;
    emit('clear-favorites');
  } else {
    clearPlaylist();
  }
};

const handlePlayFavorites = () => {
  currentFavoriteList.value = true;
};

defineExpose({
  handlePlayFavorites
});

const handlePageChange = (page) => {
  currentPage.value = page;
};

const emitOpenModal = () => {
  emit('open-modal');
};

// Phát sự kiện mở modal yêu thích
const emitOpenFavoriteModal = () => {
  emit('open-favorite-modal');
};

const clearPlaylist = () => {
  console.log('Clearing playlist, currentPlaylistId:', props.currentPlaylistId);
  emit('change-playlist', null);
  console.log('After emit, songs:', props.songs);
  currentPage.value = 1;
};

const totalPages = computed(() => {
  return Math.ceil(filteredSongs.value.length / props.itemsPerPage);
});

const goToPage = (page) => {
  currentPage.value = page;
};

watch(filteredSongs, (newSongs) => {
  const newTotalPages = Math.ceil(newSongs.length / props.itemsPerPage);
  if (currentPage.value > newTotalPages && newTotalPages > 0) {
    currentPage.value = newTotalPages;
  }
});
</script>

<style scoped>
.playlist {
  margin-top: 5px;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #444;
}

.playlist-header h2 {
  color: white;
  margin: 0;
  font-size: 1.2rem;
}

.actions {
  display: flex;
  gap: 8px;
}

.playlist-btn {
  background: #42b983;
  color: white;
  border: none;
  display: flex;
  align-items: center;
}

.playlist-btn:hover {
  background: #369970;
}

.favorite-btn:hover {
  background: #ff7875 !important;
  border-color: #ff7875 !important;
}

/* Icon styling */
:deep(.iconify) {
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.current-playlist-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 8px;
  background-color: rgba(66, 185, 131, 0.1);
  border-left: 3px solid #42b983;
  border-radius: 3px;
  color: white;
}

.playlist-details {
  display: flex;
  flex-direction: column;
}

.playlist-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.song-count {
  font-size: 0.8rem;
  color: #aaa;
}

.clear-btn {
  color: #ff4d4f;
}

.clear-btn:hover {
  color: #ff7875;
}

.song-list-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  margin-bottom: 10px;
  max-height: calc(100vh - 250px);
}

.empty-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.45);
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

:deep(.ant-pagination-item a) {
  color: white;
}

:deep(.ant-pagination-item-active) {
  background-color: #42b983;
  border-color: #42b983;
}

:deep(.ant-pagination-item-active a) {
  color: white;
}

:deep(.ant-pagination-prev .ant-pagination-item-link),
:deep(.ant-pagination-next .ant-pagination-item-link) {
  color: white;
  background-color: transparent;
  border-color: #444;
}

/* Pagination Style */
.pagination-controls {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

.simple-pagination {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.08);
  padding: 6px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.page-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgba(66, 185, 131, 0.3);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-button:hover:not(:disabled) {
  background: #42b983;
  transform: scale(1.05);
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.1);
}

.page-button.prev {
  margin-right: 4px;
}

.page-button.next {
  margin-left: 4px;
}

.page-indicator {
  color: white;
  font-size: 14px;
  font-weight: 500;
  min-width: 50px;
  text-align: center;
}

/* Tooltip styling */
:deep(.ant-tooltip-inner) {
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
}

:deep(.ant-tooltip-arrow::before) {
  background-color: rgba(0, 0, 0, 0.85);
}

.current-playlist-info.favorite {
  border-left-color: #ff4d4f;
  background-color: rgba(255, 77, 79, 0.1);
}

@media (max-width: 768px) {
  .playlist {
    padding-bottom: 60px; /* Tạo khoảng trống cho phân trang */
  }
  
  .pagination-controls {
    position: sticky;
    bottom: 10px;
    z-index: 1;
    padding: 8px 0;
    background: rgba(0, 0, 0, 0.7); /* Làm nền đậm hơn để dễ nhìn */
    backdrop-filter: blur(5px);
    border-radius: 20px;
    margin: 10px auto;
    width: fit-content;
  }
  
  .simple-pagination {
    gap: 8px;
    padding: 4px 8px;
  }
  
  .page-button {
    width: 28px;
    height: 28px;
  }
  
  .page-indicator {
    font-size: 13px;
    min-width: 40px;
  }
  
  :deep(.iconify) {
    font-size: 16px;
    margin-left: 2px;
  }
}
</style>