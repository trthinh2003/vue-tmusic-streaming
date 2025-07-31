<template>
  <!-- Danh sách playlist -->
  <div class="playlist-list-container" v-if="!selectedPlaylist">
    <a-spin :spinning="isLoadingPlaylists">
      <div class="playlist-grid">
        <div 
          class="playlist-item" 
          v-for="(playlist, index) in playlists" 
          :key="index"
          @click="selectPlaylist(playlist)"
        >
          <div class="playlist-cover">
            <img :src="playlist.image || defaultImage" alt="playlist cover"/>
            <div class="playlist-play-icon">
              <play-circle-filled />
            </div>
          </div>
          <div class="playlist-info">
            <h3 class="playlist-title">{{ playlist.name }}</h3>
            <p class="playlist-creator">Tạo bởi {{ playlist.userName }}</p>
          </div>
        </div>
      </div>
      <!-- Hiển thị thông báo khi không tìm thấy -->
      <div v-if="!isLoadingPlaylists && searchStore.searchQuery && playlists.length === 0" 
          class="no-results" 
          style="text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">
        <p>Không tìm thấy playlist nào với từ khóa "{{ searchStore.searchQuery }}"</p>
      </div>

      <div class="playlist-pagination">
        <a-pagination
          v-model:current="currentPage"
          :total="totalItems"
          :pageSize="pageSize"
          :showSizeChanger="false"
          @change="handlePlaylistPageChange"
          :disabled="isLoadingPlaylists"
        />
      </div>
    </a-spin>
  </div>

  <!-- Danh sách bài hát trong playlist đã chọn -->
  <div class="playlist-songs-container" v-else>
    <div class="playlist-header">
      <a-button class="back-button" @click="selectedPlaylist = null">
        <arrow-left-outlined /> Quay lại
      </a-button>
      <div class="playlist-detail">
        <img :src="selectedPlaylist.image || defaultImage" alt="playlist cover" class="playlist-detail-cover"/>
        <div class="playlist-detail-info">
          <h2 class="playlist-detail-title">{{ selectedPlaylist.name }}</h2>
          <p class="playlist-detail-creator">Tạo bởi {{ selectedPlaylist.userName }}</p>
          <p class="playlist-detail-meta">{{ selectedPlaylist.songs.length }} bài hát</p>
          <p class="playlist-detail-description">{{ selectedPlaylist.description }}</p>
        </div>
      </div>
    </div>

    <div class="playlist-songs-list">
      <div
        class="music-item"
        v-for="(song, index) in selectedPlaylist.songs"
        :key="index"
        @click="playSong(song)"
        :class="{ 'active-song': currentSong?.id === song.id }"
      >
        <div class="music-item-content">
          <div class="music-number">{{ index + 1 }}</div>
          <div class="music-info">
            <h3 class="music-title">{{ song.title }}</h3>
            <p class="music-artist">{{ song.artist }}</p>
          </div>
          <div class="music-duration">{{ song.duration }}</div>
          <div class="music-actions">
            <SongActionDropdown 
              :song="song" 
              @action="handleSongAction"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, toRefs, watch, onMounted } from 'vue';
import { PlayCircleFilled, ArrowLeftOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { getPlaylistsPopular } from '@/services/playlistService';
import SongActionDropdown from '@/components/client/dropdowns/SongActionDropdown.vue';
import { usePlaylistSignalStore } from '@/stores/playlistSignalStore';
import { useSearchFilterModalStore } from '@/stores/useSearchFilterModalStore';

const props = defineProps({
  currentSong: Object,
  handleSongAction: Function,
  defaultImage: String
});

const emit = defineEmits(['play-song']);

const searchStore = useSearchFilterModalStore();

const { currentSong } = toRefs(props);
const playlists = ref([]);
const selectedPlaylist = ref(null);
const currentPage = ref(1);
const pageSize = ref(6);
const totalItems = ref(0);
const isLoadingPlaylists = ref(false);
const playlistSignalStore = usePlaylistSignalStore();

let searchTimeout = null;

watch(() => searchStore.searchQuery, (newQuery) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    currentPage.value = 1; 
    fetchPlaylists(1, pageSize.value, newQuery.trim());
  }, 500);
}, { immediate: false });

const fetchPlaylists = async (page = 1, size = pageSize.value, query = '') => {
  try {
    isLoadingPlaylists.value = true;
    const res = await getPlaylistsPopular(page, size, query);
    playlists.value = res.data.data;
    console.log(res.data);
    totalItems.value = res.data.pagination.totalItems;
    currentPage.value = page;
  } catch (error) {
    console.error("Lỗi khi tải playlists:", error);
    message.error("Không thể tải danh sách playlist");
  } finally {
    isLoadingPlaylists.value = false;
  }
};

const selectPlaylist = (playlist) => {
  selectedPlaylist.value = playlist;
};

const playSong = (song) => {
  emit('play-song', song);
};

const handlePlaylistPageChange = (page) => {
  const query = searchStore.searchQuery?.trim() || '';
  fetchPlaylists(page, pageSize.value, query);
};

watch(() => playlistSignalStore.refreshFlag, (newVal) => {
  const query = searchStore.searchQuery?.trim() || '';
  fetchPlaylists(currentPage.value, pageSize.value, query);
});

onMounted(() => {
  fetchPlaylists(1, pageSize.value);
});
</script>

<style scoped>
.playlist-list-container {
  padding: 16px;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  padding: 10px;
}

.playlist-item {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
}

.playlist-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-5px);
}

.playlist-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-play-icon {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  background: rgba(0, 219, 222, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s;
}

.playlist-item:hover .playlist-play-icon {
  opacity: 1;
}

.playlist-play-icon :deep(svg) {
  font-size: 20px;
  color: white;
}

.playlist-info {
  padding: 12px;
}

.playlist-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-creator {
  margin: 4px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Playlist detail */
.playlist-songs-container {
  padding: 16px;
}

.playlist-header {
  margin-bottom: 20px;
}

.playlist-detail {
  display: flex;
  align-items: center;
  gap: 20px;
}

.playlist-detail-cover {
  width: 150px;
  height: 150px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.playlist-detail-info {
  flex: 1;
}

.playlist-detail-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.playlist-detail-creator {
  margin: 8px 0 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.playlist-detail-meta {
  margin: 8px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.playlist-detail-description {
  margin: 8px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* Playlist songs list */
.playlist-songs-list {
  max-height: 50vh;
  overflow-y: auto;
  padding: 0 16px;
  margin-top: 16px;
}

.playlist-songs-list::-webkit-scrollbar {
  width: 6px;
}

.playlist-songs-list .music-item-content {
  padding: 10px 15px;
}

.playlist-songs-list .music-number {
  width: 30px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-right: 10px;
}

.playlist-songs-list .music-duration {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin: 0 15px;
}

.playlist-songs-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.playlist-songs-list::-webkit-scrollbar-thumb {
  background: linear-gradient(#00dbde, #fc00ff);
  border-radius: 3px;
}

/* Playlist pagination */
.playlist-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.playlist-pagination :deep(.ant-pagination-item),
.playlist-pagination :deep(.ant-pagination-prev),
.playlist-pagination :deep(.ant-pagination-next),
.playlist-pagination :deep(.ant-pagination-jump-prev),
.playlist-pagination :deep(.ant-pagination-jump-next) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  min-width: 32px;
  height: 32px;
  line-height: 32px;
  border-radius: 8px;
  margin: 0 4px;
}

.playlist-pagination :deep(.ant-pagination-item a) {
  color: rgba(255, 255, 255, 0.8);
}

.playlist-pagination :deep(.ant-pagination-item:hover),
.playlist-pagination :deep(.ant-pagination-prev:hover),
.playlist-pagination :deep(.ant-pagination-next:hover) {
  border-color: #00dbde;
}

.playlist-pagination :deep(.ant-pagination-item-active) {
  background: linear-gradient(90deg, #00dbde 0%, #fc00ff 100%);
  border-color: transparent;
}

.playlist-pagination :deep(.ant-pagination-item-active a) {
  color: white;
}

.playlist-pagination :deep(.ant-pagination-item-link) {
  color: rgba(255, 255, 255, 0.8);
  background: transparent;
  border: none;
}

.playlist-pagination :deep(.ant-pagination-disabled .ant-pagination-item-link) {
  color: rgba(255, 255, 255, 0.3);
}

.playlist-pagination :deep(.ant-pagination-options) {
  display: none;
}

@media (max-width: 576px) {
  .playlist-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .playlist-detail {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .playlist-detail-cover {
    width: 100px;
    height: 100px;
  }

	.music-item-content {
    font-size: 10px;
  }
}
</style>

<style scoped>
/* Active song */
.active-song {
  background: rgba(0, 219, 222, 0.1) !important;
  border-left: 3px solid #00dbde;
}

.active-song .music-title {
  color: #00dbde !important;
}

.back-button {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15px;
  padding: 0;
  display: flex;
  align-items: center;
}

.back-button:hover {
  color: white;
}

.music-item {
  margin-bottom: 12px;
  border-radius: 12px;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.03);
}

.music-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.music-item-content {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
}

.music-cover {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 16px;
  flex-shrink: 0;
}

.music-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-icon {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: all 0.3s;
}

.music-item:hover .play-icon {
  opacity: 1;
}

.play-icon :deep(svg) {
  font-size: 24px;
  color: #fff;
}

.music-info {
  flex-grow: 1;
  min-width: 0;
}

.music-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-artist {
  margin: 4px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}
</style>