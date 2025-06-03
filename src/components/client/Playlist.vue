<template>
  <div class="playlist">
    <div class="playlist-header">
      <h2>Playlist</h2>
      <div class="actions">
        <a-button 
          type="primary" 
          @click="emitOpenModal" 
          size="small"
          class="playlist-btn"
        >
          <template #icon><menu-outlined /></template>
          Quản lý Playlist
        </a-button>
      </div>
    </div>
    
    <div v-if="currentPlaylist && currentPlaylistId" class="current-playlist-info">
      <div class="playlist-details">
        <span class="playlist-name">{{ currentPlaylist.name }}</span>
        <span class="song-count">{{ filteredSongs.length }} bài hát</span>
      </div>
      <a-button 
        type="text" 
        size="small" 
        @click="clearPlaylist"
        class="clear-btn"
      >
        <template #icon><close-outlined /></template>
        Xóa playlist
      </a-button>
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
        <button 
          class="page-button prev"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          <left-outlined />
        </button>
        <span class="page-indicator">{{ currentPage }}/{{ totalPages }}</span>
        <button 
          class="page-button next"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          <right-outlined />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MenuOutlined, CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import SongItem from './SongItem.vue';
import { ref, computed } from 'vue';

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

const emit = defineEmits(['select-song', 'change-playlist', 'open-modal']);

const currentPage = ref(1);

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
  const start = (currentPage.value - 1) * props.itemsPerPage;
  const end = start + props.itemsPerPage;
  return filteredSongs.value.slice(start, end);
});

const currentPlaylist = computed(() => {
  if (!props.currentPlaylistId || !props.availablePlaylists?.length) return null;
  return props.availablePlaylists.find(playlist => playlist.id === props.currentPlaylistId);
});

const handlePageChange = (page) => {
  currentPage.value = page;
};

const emitOpenModal = () => {
  emit('open-modal');
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
}
</style>