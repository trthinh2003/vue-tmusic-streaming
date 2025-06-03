<template>
  <a-modal
    :open="open" 
    width="800px"
    :footer="null"
    centered
    class="playlist-modal"
    @cancel="handleCancel"
    @update:open="(value) => $emit('update:open', value)" 
  >
    <div class="playlist-modal-header mb-3" 
      style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); 
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 1.1rem;
        font-weight: bold; 
        color: #1890ff;
      "
    >
      <i class="fa-solid fa-music me-2"></i>
      Quản lý Playlist
    </div>
    <div class="playlist-container">
      <!-- Danh sách playlist -->
      <div class="playlist-list">
        <div class="header">
          <h3>Danh sách</h3>
          <a-button type="primary" @click="showCreateModal">
            <template #icon><plus-outlined /></template>
            Tạo mới
          </a-button>
        </div>
        
        <a-list
          :data-source="availablePlaylists"
          :loading="loading"
          item-layout="horizontal"
          class="list-container"
        >
          <template #renderItem="{ item }">
            <a-list-item 
              :class="{ 'active': currentPlaylist?.id === item.id }"
              @click="selectPlaylist(item)"
            >
              <a-list-item-meta>
                <template #title>
                  <div class="playlist-title">
                    {{ item.name }}
                    <a-tag v-if="currentPlaylist?.id === item.id" color="green" style="
                      background: linear-gradient(135deg, #42b983 0%, #369970 100%);
                      color: white;
                      font-weight: bold;
                      border: none;
                      border-radius: 12px;
                      padding: 0 8px;
                      box-shadow: 0 2px 8px rgba(66, 185, 131, 0.3);
                      animation: pulse 2s infinite;"
                    >
                        <i class="fa-solid fa-play me-1"></i> ...
                    </a-tag>
                  </div>
                </template>
              </a-list-item-meta>
              <template #actions>
                <a-button type="text" @click.stop="editPlaylist(item)" style="color: rgb(148 90 48);">
                  <template #icon><edit-outlined /></template>
                </a-button>
                <a-button type="text" danger @click.stop="confirmDelete(item)">
                  <template #icon><delete-outlined /></template>
                </a-button>
                <a-button type="text" @click.stop="playPlaylist(item)" style="color: #42b983;">
                  <template #icon><play-circle-outlined /></template>
                </a-button>
              </template>
            </a-list-item>
          </template>
        </a-list>
      </div>

      <!-- Danh sách bài hát trong playlist đã chọn -->
      <div class="song-list" v-if="selectedPlaylist">
        <div class="header">
          <h3>Bài hát trong playlist: {{ selectedPlaylist.name }}</h3>
        </div>
        
        <a-table
          :dataSource="playlistSongs"
          :columns="songColumns"
          :loading="songsLoading"
          :rowKey="record => record.id"
          size="small"
          :pagination="false"
          class="song-table"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'actions'">
              <a-button type="text" danger @click="removeFromPlaylist(record)">
                <template #icon><delete-outlined /></template>
              </a-button>
            </template>
            <template v-else-if="column.key === 'duration'">
              {{ record.duration }}
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- Modal tạo/chỉnh sửa playlist -->
    <a-modal
      v-model:open="playlistModalVisible"
      :title="null"
      :footer="null"
      :closable="false"
      @ok="handlePlaylistSubmit"
      @cancel="resetPlaylistForm"
    >
      <!-- Header tùy chỉnh -->
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, rgb(26, 26, 46) 0%, rgb(22, 33, 62) 100%);
          padding: 16px;
          border-bottom: 2px solid #1890ff;
        "
      >
        <div style="font-size: 20px; font-weight: bold; color: #1890ff;">
          {{ isEditing ? 'Chỉnh sửa Playlist' : 'Tạo Playlist mới' }}
        </div>
        <a-button
          type="text"
          shape="circle"
          size="large"
          @click="playlistModalVisible = false"
          style="font-size: 20px; color: #fff;"
          aria-label="Close"
        >
          <i class="fa-solid fa-xmark"></i>
        </a-button>
      </div>

      <!-- Nội dung form -->
      <a-form :model="playlistForm" layout="vertical" style="margin-top: 16px;">
        <a-form-item required>
          <template #label>
            <span style="color: #fff;">Tên playlist</span>
          </template>
          <a-input v-model:value="playlistForm.name" placeholder="Nhập tên playlist" />
        </a-form-item>
      </a-form>

      <!-- Footer tùy chỉnh -->
      <div style="text-align: right; margin-top: 16px;">
        <a-button @click="resetPlaylistForm">Hủy</a-button>
        <a-button type="primary" @click="handlePlaylistSubmit" style="margin-left: 8px;">Lưu</a-button>
      </div>
    </a-modal>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch, onMounted, h } from 'vue';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  PlayCircleOutlined 
} from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import { 
  createPlaylist, 
  updatePlaylist, 
  deletePlaylist,
  getSongsInPlaylist,
  removeSongFromPlaylist
} from '@/services/playlistService';

const props = defineProps({
  open: Boolean,
  availablePlaylists: {
    type: Array,
    default: () => []
  },
  currentPlaylist: {
    type: Object,
    default: null
  },
  open: Boolean
});

const emit = defineEmits(['update:open', 'close', 'change-playlist', 'refresh', 'play-playlist']);

const selectedPlaylist = ref(null);
const playlistSongs = ref([]);
const loading = ref(false);
const songsLoading = ref(false);
const playlistModalVisible = ref(false);
const isEditing = ref(false);

const playlistForm = ref({
  id: null,
  name: '',
});

const songColumns = [
  {
    title: 'Tên bài hát',
    dataIndex: 'title',
    key: 'title'
  },
  {
    title: 'Nghệ sĩ',
    dataIndex: 'artist',
    key: 'artist'
  },
  {
    title: 'Thời lượng',
    dataIndex: 'duration',
    key: 'duration'
  },
  {
    title: 'Hành động',
    key: 'actions',
    width: '80px'
  }
];

// Chọn playlist
const selectPlaylist = async (playlist) => {
  selectedPlaylist.value = playlist;
  songsLoading.value = true;
  playlistSongs.value = [];
  const loadingRows = Array(3).fill({ loading: true });
  playlistSongs.value = loadingRows;
  
  try {
    const response = await getSongsInPlaylist(playlist.id);
    playlistSongs.value = response.data;
  } catch (error) {
    message.error('Lỗi khi tải bài hát trong playlist');
  } finally {
    songsLoading.value = false;
  }
};

// Phát playlist
const playPlaylist = (playlist) => {
  const loadingMessage = message.loading('Đang tải playlist...', 0);
  
  emit('play-playlist', playlist.id);
  setTimeout(() => {
    loadingMessage();
    message.success(`Đang phát playlist: ${playlist.name}`, 1.5);
    emit('update:open', false);
  }, 800);
};


// Hiển thị modal tạo playlist
const showCreateModal = () => {
  isEditing.value = false;
  playlistForm.value = { id: null, name: '' };
  playlistModalVisible.value = true;
};

// Hiển thị modal chỉnh sửa playlist
const editPlaylist = (playlist) => {
  isEditing.value = true;
  playlistForm.value = { ...playlist };
  playlistModalVisible.value = true;
};

const handleCancel = () => {
  emit('update:open', false);
  emit('close');
};

// Xử lý submit tạo/chỉnh sửa playlist
const handlePlaylistSubmit = async () => {
  if (!playlistForm.value.name) {
    message.error('Vui lòng nhập tên playlist');
    return;
  }

  try {
    if (isEditing.value) {
      // console.log(playlistForm.value.name);
      const res = await updatePlaylist(playlistForm.value.id, { 
        name: playlistForm.value.name 
      });
      console.log(res);
      message.success('Cập nhật playlist thành công');
    } else {
      const res = await createPlaylist({ 
        name: playlistForm.value.name 
      });
      message.success('Tạo playlist thành công');
    }
    playlistModalVisible.value = false;
    emit('refresh');
  } catch (error) {
    message.error('Đã có lỗi xảy ra');
    console.error(error);
  }
}

// Xác nhận xóa playlist
const confirmDelete = (playlist) => {
  Modal.confirm({
    title: h('div', { style: { color: 'white' } }, 'Xác nhận xóa'),
    content: h('div', { style: { color: 'white' } },`Bạn chắc chắn muốn xóa playlist "${playlist.name}"?`),
    okText: 'Xóa',
    okType: 'danger',
    cancelText: 'Hủy',
    onOk: async () => {
      try {
        await deletePlaylist(playlist.id);
        message.success('Đã xóa playlist');
        emit('refresh');
        if (props.currentPlaylist?.id === playlist.id) {
          emit('change-playlist', null);
        }
      } catch (error) {
        message.error('Xóa playlist thất bại');
      }
    }
  });
};

// Xóa bài hát khỏi playlist
const removeFromPlaylist = async (song) => {
  Modal.confirm({
    title: h('div', { style: { color: 'white' } }, 'Xác nhận xóa'),
    content: h('div', { style: { color: 'white' } }, `Bạn chắc chắn muốn xóa bài hát "${song.title}" khỏi playlist?`),
    okText: 'Xóa',
    okType: 'danger',
    cancelText: 'Hủy',
    onOk: async () => {
      try {
        console.log(selectedPlaylist.value.id, song.id);
        const res = await removeSongFromPlaylist(selectedPlaylist.value.id, song.id);
        console.log(res);
        message.success('Đã xóa bài hát khỏi playlist');
        await selectPlaylist(selectedPlaylist.value); // Refresh danh sách bài hát
      } catch (error) {
        message.error('Xóa bài hát thất bại');
      }
    }
  });
};

// Reset form playlist
const resetPlaylistForm = () => {
  playlistForm.value = { id: null, name: '' };
};

// Theo dõi thay đổi currentPlaylist từ props
watch(() => props.currentPlaylist, (newVal) => {
  if (newVal) {
    selectPlaylist(newVal);
  } else {
    selectedPlaylist.value = null;
    playlistSongs.value = [];
  }
}, { immediate: true });

// Theo dõi thay đổi open từ props
watch(() => props.open, (newVal) => {
  if (newVal && props.currentPlaylist) {
    selectPlaylist(props.currentPlaylist);
  }
});
</script>

<style scoped>
/* Main modal styling */
.playlist-modal {
  border-radius: 12px;
  overflow: hidden;
}

.playlist-modal :deep(.ant-modal-content) {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.playlist-modal :deep(.ant-modal-header) {
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}

.playlist-modal :deep(.ant-modal-title) {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
}

.playlist-modal :deep(.ant-modal-body) {
  padding: 0;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%);
  backdrop-filter: blur(10px);
}

.playlist-modal :deep(.ant-btn-text[style*="color: #42b983"]:hover) {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

.playlist-modal :deep(.ant-modal-close) {
  color: rgba(255, 255, 255, 0.7);
}

.playlist-modal :deep(.ant-modal-close:hover) {
  color: white;
}

/* Container layout */
.playlist-container {
  display: flex;
  height: 60vh;
  gap: 24px;
  color: white;
}

.playlist-list {
  flex: 1;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding-right: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.song-list {
  flex: 2;
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
  color: white;
  font-size: 1.1rem;
  margin: 0;
  font-weight: 500;
}

/* List styling */
.list-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.list-container :deep(.ant-list-item) {
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);  margin-bottom: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  box-shadow: none;
}

.list-container :deep(.ant-list-item:hover) {
  background: rgba(66, 185, 131, 0.15); 
  transform: translateX(4px) scale(1.00); 
  box-shadow: 0 8px 16px rgba(66, 185, 131, 0.3); 
  transition: all 0.3s ease, box-shadow 0.3s ease;
}

.list-container :deep(.ant-list-item.active) {
  background: rgba(66, 185, 131, 0.25);
  border-left: 3px solid #42b983;
  font-weight: 600;
  color: #42b983;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(66, 185, 131, 0.4);
  }
  50% { transform: scale(1.05); }
  70% {
    box-shadow: 0 0 0 10px rgba(66, 185, 131, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(66, 185, 131, 0);
  }
}

.song-table :deep(.ant-table-row) {
  transition: all 0.3s ease;
}

.song-table :deep(.ant-table-row:hover) {
  transform: translateX(5px);
  background: rgba(66, 185, 131, 0.1) !important;
}

.list-container :deep(.ant-list-item:hover) .playlist-title {
  color: #42b983;
  transition: color 0.3s ease;
}

:deep(.ant-list .ant-list-item .ant-list-item-action > li) {
  padding: 0;
}

.playlist-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: white;
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
}

.song-table :deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(255, 255, 255, 0.05) !important;
}

.song-table :deep(.ant-table-row) {
  cursor: pointer;
}

/* Button styling */
.playlist-modal {
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

.playlist-modal :deep(.ant-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease-in-out;
}

.playlist-modal :deep(.ant-btn:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.playlist-modal :deep(.ant-btn-primary) {
  background: #42b983;
  border-color: #42b983;
}

.playlist-modal :deep(.ant-btn-primary:hover) {
  background: #369970;
  border-color: #369970;
}

.playlist-modal :deep(.ant-btn-text) {
  color: rgba(255, 255, 255, 0.7);
}

.playlist-modal :deep(.ant-btn-text:hover) {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

/* Scrollbar styling */
.playlist-list::-webkit-scrollbar,
.song-list::-webkit-scrollbar {
  width: 6px;
}

.playlist-list::-webkit-scrollbar-track,
.song-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.playlist-list::-webkit-scrollbar-thumb,
.song-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.playlist-list::-webkit-scrollbar-thumb:hover,
.song-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Tag styling */
.playlist-modal :deep(.ant-tag) {
  border-radius: 4px;
  font-size: 0.75rem;
  padding: 0 6px;
  line-height: 20px;
}

/* Empty state styling */
.playlist-modal :deep(.ant-empty) {
  color: rgba(255, 255, 255, 0.5);
  margin: 40px 0;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .playlist-container {
    flex-direction: column;
    height: auto;
    max-height: 70vh;
  }
  
  .playlist-list {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-right: 0;
    padding-bottom: 20px;
    margin-bottom: 20px;
  }
  
  .list-container,
  .song-table {
    max-height: 200px;
  }
}

/* Animation for modal content */
.playlist-container {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>