<template>
  <a-modal
    :open="open" 
    width="800px"
    :footer="null"
    centered
    class="favorite-modal"
    @cancel="handleCancel"
    @update:open="(value) => $emit('update:open', value)" 
  >
    <div class="favorite-modal-header mb-3" 
      style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); 
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 1.1rem;
        font-weight: bold; 
        color: #ff4d4f;
      "
    >
      <i class="fa-solid fa-heart me-2"></i>
      Bài hát yêu thích
    </div>
    
    <div class="favorite-container">
      <!-- Danh sách bài hát yêu thích -->
      <div class="song-list">
        <div class="header">
          <h3>Danh sách bài hát yêu thích</h3>
          <span class="total-songs">{{ favoriteSongs.length }} bài hát</span>
        </div>
        
        <a-table
          :dataSource="favoriteSongs"
          :columns="songColumns"
          :loading="loading"
          :rowKey="record => record.songId || record.id"
          size="small"
          :pagination="false"
          class="song-table"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'title'">
              <div class="song-info">
                <img 
                  :src="record.songImage || record.image || '/default-song.png'" 
                  alt="Song cover" 
                  class="song-cover"
                />
                <div class="song-details">
                  <span class="song-title">{{ record.songTitle || record.title }}</span>
                  <span class="song-artist">{{ record.songArtist || record.artist }}</span>
                </div>
              </div>
            </template>
            <template v-else-if="column.key === 'duration'">
              {{ formatDuration(record.duration) }}
            </template>
            <template v-else-if="column.key === 'actions'">
              <a-button 
                type="text" 
                danger 
                @click="removeFromFavorites(record)"
                class="action-btn"
              >
                <template #icon><delete-outlined /></template>
              </a-button>
              <a-button 
                type="text" 
                @click="playSong(record)" 
                class="action-btn play-btn"
              >
                <template #icon><play-circle-outlined /></template>
              </a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { 
  DeleteOutlined,
  PlayCircleOutlined 
} from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import { 
  getMyFavorites,
  removeFromFavorite
} from '@/services/favoriteService';
import { usePlayerStore } from '@/stores/playerStore';

const props = defineProps({
  open: Boolean
});

const emit = defineEmits(['update:open', 'close']);

const playerStore = usePlayerStore();
const favoriteSongs = ref([]);
const loading = ref(false);

const songColumns = [
  { 
    title: 'Bài hát', 
    key: 'title',
    width: '50%'
  },
  { 
    title: 'Thời lượng', 
    key: 'duration',
    width: '20%'
  },
  { 
    title: 'Hành động', 
    key: 'actions',
    width: '30%',
    align: 'right'
  }
];

// Lấy danh sách bài hát yêu thích
const fetchFavoriteSongs = async () => {
  try {
    loading.value = true;
    const response = await getMyFavorites(1, 100);
    console.log('Favorite songs:', response.data);
    favoriteSongs.value = response.data || [];
  } catch (error) {
    message.error('Lỗi khi tải danh sách yêu thích');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// Xóa bài hát khỏi danh sách yêu thích
const removeFromFavorites = async (song) => {
  Modal.confirm({
    title: 'Xác nhận xóa',
    content: `Bạn chắc chắn muốn xóa bài hát "${song.songTitle || song.title}" khỏi danh sách yêu thích?`,
    okText: 'Xóa',
    okType: 'danger',
    cancelText: 'Hủy',
    onOk: async () => {
      try {
        await removeFromFavorite(song.songId || song.id);
        message.success('Đã xóa khỏi danh sách yêu thích');
        await fetchFavoriteSongs(); // Refresh danh sách
      } catch (error) {
        message.error('Xóa thất bại');
      }
    }
  });
};

// Phát bài hát
const playSong = (song) => {
  playerStore.playSong({
    id: song.songId || song.id,
    title: song.songTitle || song.title,
    artist: song.songArtist || song.artist,
    image: song.songImage || song.image,
    duration: song.duration
  });
};

// Định dạng thời lượng
const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const handleCancel = () => {
  emit('update:open', false);
  emit('close');
};

// Theo dõi sự thay đổi của prop open
watch(() => props.open, (newVal) => {
  if (newVal) {
    fetchFavoriteSongs();
  }
});

// Load dữ liệu khi component mounted
onMounted(() => {
  if (props.open) {
    fetchFavoriteSongs();
  }
});
</script>

<style scoped>
/* Main modal styling */
.favorite-modal {
  border-radius: 12px;
  overflow: hidden;
}

.favorite-modal :deep(.ant-modal-content) {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.favorite-modal :deep(.ant-modal-header) {
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}

.favorite-modal :deep(.ant-modal-title) {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
}

.favorite-modal :deep(.ant-modal-body) {
  padding: 0;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%);
  backdrop-filter: blur(10px);
}

.favorite-modal :deep(.ant-modal-close) {
  color: rgba(255, 255, 255, 0.7);
}

.favorite-modal :deep(.ant-modal-close:hover) {
  color: white;
}

/* Container layout */
.favorite-container {
  display: flex;
  height: 60vh;
  color: white;
}

.song-list {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Header styling */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header h3 {
  flex: 1;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.total-songs {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-left: 12px;
}

/* Table styling */
.song-table {
  flex: 1;
  overflow-y: auto;
  background: transparent;
}

.song-table :deep(.ant-table) {
  background: transparent;
  color: white;
}

.song-table :deep(.ant-table-thead > tr > th) {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 500;
}

.song-table :deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s;
  background: transparent !important;
}

.song-table :deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(255, 77, 79, 0.1) !important;
}

.song-table :deep(.ant-table-row) {
  cursor: pointer;
}

/* Song info styling */
.song-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.song-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.song-details {
  display: flex;
  flex-direction: column;
}

.song-title {
  color: white;
  font-weight: 500;
  margin-bottom: 2px;
}

.song-artist {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

/* Action buttons */
.action-btn {
  opacity: 0.7;
  transition: all 0.2s;
}

.action-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.play-btn {
  color: #42b983 !important;
}

.play-btn:hover {
  color: #369970 !important;
}

/* Scrollbar styling */
.song-list::-webkit-scrollbar {
  width: 6px;
}

.song-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.song-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.song-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Animation */
.favorite-modal {
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .favorite-modal :deep(.ant-modal) {
    width: 95% !important;
    max-width: 95%;
  }
  
  .song-info {
    gap: 8px;
  }
  
  .song-cover {
    width: 32px;
    height: 32px;
  }
  
  .song-title {
    font-size: 0.9rem;
  }
  
  .song-artist {
    font-size: 0.7rem;
  }
}
</style>