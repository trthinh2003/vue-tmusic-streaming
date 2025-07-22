<template>
  <!-- Danh sách album -->
  <div class="album-list-container" v-if="!currentSelectedAlbum">
    <a-spin :spinning="isLoadingAlbums">
      <div class="album-grid">
        <div 
          class="album-item" 
          v-for="(album, index) in albums" 
          :key="index"
          @click="selectAlbum(album)"
        >
          <div class="album-cover">
            <img :src="album.imageUrl" alt="album cover"/>
            <div class="album-play-icon">
              <play-circle-filled />
            </div>
          </div>
          <div class="album-info">
            <h3 class="album-title">{{ album.title }}</h3>
            <p class="album-artist">{{ album.artist }}</p>
            <p class="album-year">{{ album.realeaseDate }} • {{ album.songs.length }} bài hát</p>
          </div>
        </div>
      </div>
      <div v-if="searchStore.searchQuery && albums.length === 0 && !isLoadingAlbums"
        class="no-results" 
        style="text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">
      <p>Không tìm thấy album nào với từ khóa "{{ searchStore.searchQuery }}"</p>
      </div>
      <div class="album-pagination">
        <a-pagination
          v-model:current="currentAlbumPage"
          :total="totalAlbums"
          :pageSize="albumPageSize"
          :showSizeChanger="false"
          @change="handleAlbumPageChange"
          :disabled="isLoadingAlbums"
        />
      </div>
    </a-spin>
  </div>
  
  <!-- Danh sách bài hát trong album đã chọn -->
  <div class="album-songs-container" v-if="currentSelectedAlbum">
    <div class="album-header">
      <a-button class="back-button" @click="goBackToAlbumList">
        <arrow-left-outlined /> Quay lại
      </a-button>
      <div class="album-detail">
        <img :src="currentSelectedAlbum.imageUrl" alt="album cover" class="album-detail-cover"/>
        <div class="album-detail-info">
          <h2 class="album-detail-title">{{ currentSelectedAlbum.title }}</h2>
          <p class="album-detail-artist">{{ currentSelectedAlbum.artist }}</p>
          <p class="album-detail-meta">{{ currentSelectedAlbum.realeaseDate }} • {{ currentSelectedAlbum.songs.length }} bài hát</p>
        </div>
      </div>
    </div>

    <div class="album-songs-list">
      <div
        class="music-item"
        v-for="(song, index) in currentSelectedAlbum.songs"
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
import { ref, watch, onMounted } from 'vue';
import { PlayCircleFilled, ArrowLeftOutlined } from '@ant-design/icons-vue';
import { getAlbumWithSongs } from '@/services/albumService';
import { message } from 'ant-design-vue';
import SongActionDropdown from '@/components/client/dropdowns/SongActionDropdown.vue';
import { useSearchFilterModalStore } from '@/stores/useSearchFilterModalStore';

const props = defineProps({
  currentSong: Object,
  isPlaying: Boolean,
  selectedAlbum: Object
});

const emit = defineEmits(['play-song', 'song-action', 'album-selected']);

const searchStore = useSearchFilterModalStore();

const albums = ref([]);
const currentSelectedAlbum = ref(null);
const currentAlbumPage = ref(1);
const albumPageSize = ref(6);
const totalAlbums = ref(0);
const isLoadingAlbums = ref(false);

let searchTimeout = null;

watch(() => props.selectedAlbum, (newAlbum) => {
  currentSelectedAlbum.value = newAlbum;
}, { immediate: true });

watch(() => searchStore.searchQuery, (newQuery) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    currentAlbumPage.value = 1; // Reset về trang 1 khi search
    fetchAlbums(1, albumPageSize.value, newQuery.trim());
  }, 500);
}, { immediate: false });

const selectAlbum = (album) => {
  currentSelectedAlbum.value = album;
  emit('album-selected', album);
};

const goBackToAlbumList = () => {
  currentSelectedAlbum.value = null;
  emit('album-selected', null);
};

const playSong = (song) => {
  if (!song || !song.audio) {
    console.error('Invalid song data:', song);
    message.error("Bài hát không có dữ liệu âm thanh");
    return;
  }
  
  // Validate song có thuộc album hiện tại không
  if (currentSelectedAlbum.value && 
      !currentSelectedAlbum.value.songs.some(s => s.id === song.id)) {
    console.error('Song not found in current album');
    message.error("Bài hát không tồn tại trong album này");
    return;
  }
  emit('play-song', song);
};

const handleSongAction = (action, song) => {
  emit('song-action', action, song);
};

const fetchAlbums = async (page = 1, pageSize = albumPageSize.value, query = '') => {
  try {
    isLoadingAlbums.value = true;
    const albumRes = await getAlbumWithSongs(page, pageSize, query);
    // console.log('Album API response:', albumRes);
    
    if (albumRes.data && albumRes.data.pagination) {
      albums.value = albumRes.data.data;
      totalAlbums.value = albumRes.data.pagination.totalItems;
      currentAlbumPage.value = page;
    } else if (albumRes.data && Array.isArray(albumRes.data.data)) {
      albums.value = albumRes.data.data;
      totalAlbums.value = albumRes.data.data.length;
      currentAlbumPage.value = page;
    } else {
      console.error('Invalid API response structure', albumRes);
      message.error("Định dạng dữ liệu album không hợp lệ");
    }
  } catch (error) {
    console.error("Lỗi khi tải album:", error);
    message.error("Không thể tải danh sách album");
  } finally {
    isLoadingAlbums.value = false;
  }
};

const handleAlbumPageChange = (page) => {
  const query = searchStore.searchQuery?.trim() || '';
  fetchAlbums(page, albumPageSize.value, query);
};

onMounted(() => {
  fetchAlbums(1, 6);
});
</script>

<style scoped>
/* Active song */
.active-song {
  background: rgba(0, 219, 222, 0.1) !important;
  border-left: 3px solid #00dbde;
}

.active-song .music-title {
  color: #00dbde !important;
}

/* Album list */
.album-list-container {
  padding: 16px;
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  padding: 10px;
}

.album-item {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
}

.album-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-5px);
}

.album-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-play-icon {
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

.album-item:hover .album-play-icon {
  opacity: 1;
}

.album-play-icon :deep(svg) {
  font-size: 20px;
  color: white;
}

.album-info {
  padding: 12px;
}

.album-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-artist {
  margin: 4px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-year {
  margin: 4px 0 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

/* Album detail */
.album-songs-container {
  padding: 16px;
}

.album-header {
  margin-bottom: 20px;
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

.album-detail {
  display: flex;
  align-items: center;
  gap: 20px;
}

.album-detail-cover {
  width: 150px;
  height: 150px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.album-detail-info {
  flex: 1;
}

.album-detail-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.album-detail-artist {
  margin: 8px 0 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.album-detail-meta {
  margin: 8px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

/* Album songs list */
.album-songs-list {
  max-height: 50vh;
  overflow-y: auto;
  padding: 0 16px;
  margin-top: 16px;
}

.album-songs-list::-webkit-scrollbar {
  width: 6px;
}

.album-songs-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.album-songs-list::-webkit-scrollbar-thumb {
  background: linear-gradient(#00dbde, #fc00ff);
  border-radius: 3px;
}

.album-songs-list .music-item {
  margin-bottom: 12px;
  border-radius: 12px;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.03);
}

.album-songs-list .music-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.album-songs-list .music-item-content {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
}

.album-songs-list .music-number {
  width: 30px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-right: 10px;
}

.album-songs-list .music-info {
  flex-grow: 1;
  min-width: 0;
}

.album-songs-list .music-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-songs-list .music-artist {
  margin: 4px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.album-songs-list .music-duration {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin: 0 15px;
}

/* Album pagination */
.album-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.album-pagination :deep(.ant-pagination-item),
.album-pagination :deep(.ant-pagination-prev),
.album-pagination :deep(.ant-pagination-next),
.album-pagination :deep(.ant-pagination-jump-prev),
.album-pagination :deep(.ant-pagination-jump-next) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  min-width: 32px;
  height: 32px;
  line-height: 32px;
  border-radius: 8px;
  margin: 0 4px;
}

.album-pagination :deep(.ant-pagination-item a) {
  color: rgba(255, 255, 255, 0.8);
}

.album-pagination :deep(.ant-pagination-item:hover),
.album-pagination :deep(.ant-pagination-prev:hover),
.album-pagination :deep(.ant-pagination-next:hover) {
  border-color: #00dbde;
}

.album-pagination :deep(.ant-pagination-item-active) {
  background: linear-gradient(90deg, #00dbde 0%, #fc00ff 100%);
  border-color: transparent;
}

.album-pagination :deep(.ant-pagination-item-active a) {
  color: white;
}

.album-pagination :deep(.ant-pagination-item-link) {
  color: rgba(255, 255, 255, 0.8);
  background: transparent;
  border: none;
}

.album-pagination :deep(.ant-pagination-disabled .ant-pagination-item-link) {
  color: rgba(255, 255, 255, 0.3);
}

.album-pagination :deep(.ant-pagination-options) {
  display: none;
}

@media (max-width: 576px) {
  .album-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .album-detail {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .album-detail-cover {
    width: 100px;
    height: 100px;
  }
}
</style>