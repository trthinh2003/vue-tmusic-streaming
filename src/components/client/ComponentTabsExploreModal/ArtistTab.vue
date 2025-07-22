<template>
  <!-- Danh sách nghệ sĩ -->
  <div class="artist-list-container" v-if="!selectedArtist">
    <a-spin :spinning="isLoadingArtists">
      <div class="artist-grid">
        <div 
          class="artist-item" 
          v-for="(artist, index) in artists" 
          :key="index"
          @click="selectArtist(artist)"
        >
          <div class="artist-cover">
            <img :src="artist.avatar" alt="artist avatar"/>
            <div class="artist-play-icon">
              <play-circle-filled />
            </div>
            <div class="artist-follow-btn" @click.stop="toggleFollowArtist(artist)">
              <heart-outlined v-if="!artist.isFollowed" />
              <heart-filled v-else style="color: #ff4757;" />
            </div>
          </div>
          <div class="artist-info">
            <h3 class="artist-name">{{ artist.name }}</h3>
            <p class="artist-songs-count">{{ artist.songs.length }} bài hát</p>
            <p 
              class="artist-bio" 
              :class="{ collapsed: !isBioExpanded[artist.id] }" 
              v-if="artist.bio"
            >
              {{ isBioExpanded[artist.id] ? artist.bio : truncateBio(artist.bio, BIO_TRUNCATE_LIMIT) }}
              <span 
                v-if="artist.bio.length > BIO_TRUNCATE_LIMIT" 
                class="read-more-btn"
                @click.stop="toggleBioExpand(artist.id)"
              >
                {{ isBioExpanded[artist.id] ? 'Thu gọn' : 'Xem thêm' }}
              </span>
            </p>
          </div>
        </div>
      </div>
      
      <!-- Hiển thị thông báo khi không tìm thấy -->
      <div v-if="!isLoadingArtists && searchStore.searchQuery && artists.length === 0" 
          class="no-results" 
          style="text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">
        <p>Không tìm thấy nghệ sĩ nào với từ khóa "{{ searchStore.searchQuery }}"</p>
      </div>
      
      <div class="artist-pagination">
        <a-pagination
          v-model:current="currentArtistPage"
          :total="totalArtists"
          :pageSize="artistPageSize"
          :showSizeChanger="false"
          @change="handleArtistPageChange"
          :disabled="isLoadingArtists"
          show-quick-jumper
        />
      </div>
    </a-spin>
  </div>

  <!-- Danh sách bài hát của nghệ sĩ đã chọn -->
  <div class="artist-songs-container" v-else>
    <div class="artist-header">
      <a-button class="back-button" @click="selectedArtist = null">
        <arrow-left-outlined /> Quay lại
      </a-button>
      <div class="artist-detail">
        <img :src="selectedArtist.avatar" alt="artist avatar" class="artist-detail-cover"/>
        <div class="artist-detail-info">
          <h2 class="artist-detail-name">{{ selectedArtist.name }}</h2>
          <p class="artist-detail-bio" v-if="selectedArtist.bio">{{ selectedArtist.bio }}</p>
          <p class="artist-detail-meta">{{ selectedArtist.songs.length }} bài hát</p>
          <div class="artist-actions">
            <a-button 
              type="primary" 
              :class="{ 'followed': selectedArtist.isFollowed }"
              @click="toggleFollowArtist(selectedArtist)"
            >
              <heart-outlined v-if="!selectedArtist.isFollowed" />
              <heart-filled v-else />
              {{ selectedArtist.isFollowed ? 'Đã theo dõi' : 'Theo dõi' }}
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <div class="artist-songs-list">
      <div
        class="music-item"
        v-for="(song, index) in selectedArtist.songs"
        :key="index"
        @click="playSong(song)"
        :class="{ 'active-song': currentSong?.id === song.id }"
      >
        <div class="music-item-content">
          <div class="music-number">{{ index + 1 }}</div>
          <div class="music-cover">
            <img :src="song.cover" alt="thumbnail" width="40px"/>
          </div>
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
      
      <div v-if="!isLoadingArtists && searchStore.searchQuery && selectedArtist.songs.length === 0" 
          class="no-results" 
          style="text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">
        <p>Không tìm thấy bài hát nào với từ khóa "{{ searchStore.searchQuery }}"</p>
      </div>
      
      <div v-if="!isLoadingArtists && !searchStore.searchQuery && selectedArtist.songs.length === 0" 
          class="no-results" 
          style="text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">
        <p>Nghệ sĩ này chưa có bài hát nào</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, toRefs, watch, onMounted } from 'vue';
import { 
  PlayCircleFilled, ArrowLeftOutlined, 
  HeartOutlined, HeartFilled 
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { getMyArtistsWithSongs, followArtist, unfollowArtist } from '@/services/artistService';
import SongActionDropdown from '@/components/client/dropdowns/SongActionDropdown.vue';
import { useSearchFilterModalStore } from '@/stores/useSearchFilterModalStore';

const props = defineProps({
  currentSong: Object,
  handleSongAction: Function
});

const emit = defineEmits(['play-song']);

const BIO_TRUNCATE_LIMIT = window.innerWidth <= 767 ? 50 : 100;
const { currentSong } = toRefs(props);
const searchStore = useSearchFilterModalStore(); 

const artists = ref([]);
const selectedArtist = ref(null);
const currentArtistPage = ref(1);
const artistPageSize = ref(4);
const totalArtists = ref(0);
const isLoadingArtists = ref(false);

let searchTimeout = null;

const fetchArtists = async (page = 1, pageSize = artistPageSize.value, query = '') => {
  try {
    isLoadingArtists.value = true;
    const artistRes = await getMyArtistsWithSongs(page, pageSize, query);
    
    if (artistRes.data && artistRes.data.pagination) {
      artists.value = artistRes.data.data;
      console.log(artists.value);
      totalArtists.value = artistRes.data.pagination.totalItems;
      currentArtistPage.value = page;
    } else {
      console.error('Invalid API response structure', artistRes);
    }
  } catch (error) {
    console.error("Lỗi khi tải danh sách nghệ sĩ:", error);
    message.error("Không thể tải danh sách nghệ sĩ");
  } finally {
    isLoadingArtists.value = false;
  }
};

watch(() => searchStore.searchQuery, (newQuery) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    currentArtistPage.value = 1;
    fetchArtists(1, artistPageSize.value, newQuery.trim());
  }, 500);
}, { immediate: false });

const selectArtist = (artist) => {
  selectedArtist.value = artist;
};

const toggleFollowArtist = async (artist) => {
  try {
    if (artist.isFollowed) {
      const res = await unfollowArtist(artist.id);
      console.log(res);
      artist.isFollowed = false;
      artist.followedAt = null;
      message.success(`Đã bỏ theo dõi ${artist.name}`);
    } else {
      await followArtist(artist.id);
      artist.isFollowed = true;
      artist.followedAt = new Date().toISOString();
      message.success(`Đã theo dõi ${artist.name}`);
    }
  } catch (error) {
    console.error("Lỗi khi follow/unfollow nghệ sĩ:", error);
    message.error("Không thể thực hiện hành động này");
    artist.isFollowed = !artist.isFollowed;
    artist.followedAt = artist.isFollowed ? new Date().toISOString() : null;
  }
};

const truncateBio = (bio, maxLength) => {
  if (!bio) return '';
  const truncated = bio.substring(0, maxLength);
  return bio.length > maxLength 
    ? truncated.substring(0, truncated.lastIndexOf(' ')) + '...' 
    : bio;
};

const handleArtistPageChange = (page) => {
  const query = searchStore.searchQuery?.trim() || '';
  fetchArtists(page, artistPageSize.value, query);
};

const playSong = (song) => {
  emit('play-song', song);
};

const isBioExpanded = ref({});

const toggleBioExpand = (artistId) => {
  isBioExpanded.value = {
    ...isBioExpanded.value,
    [artistId]: !isBioExpanded.value[artistId]
  };
};

onMounted(() => {
  fetchArtists(1, artistPageSize.value);
});
</script>

<style scoped>
.artist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.artist-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.artist-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.artist-cover {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
}

.artist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.artist-item:hover .artist-cover img {
  transform: scale(1.05);
}

.artist-play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 40px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.artist-follow-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  transition: background 0.3s ease;
}

.artist-follow-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.artist-item:hover .artist-play-icon {
  opacity: 1;
}

.artist-info {
  text-align: center;
}

.artist-name {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.artist-songs-count {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0 0 8px 0;
}

.artist-bio {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  line-height: 1.4;
  margin: 0;
}

.artist-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.artist-pagination :deep(.ant-pagination-item),
.artist-pagination :deep(.ant-pagination-prev),
.artist-pagination :deep(.ant-pagination-next),
.artist-pagination :deep(.ant-pagination-jump-prev),
.artist-pagination :deep(.ant-pagination-jump-next) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  min-width: 32px;
  height: 32px;
  line-height: 32px;
  border-radius: 8px;
  margin: 0 4px;
}

.artist-pagination :deep(.ant-pagination-item a) {
  color: rgba(255, 255, 255, 0.8);
}

.artist-pagination :deep(.ant-pagination-item:hover),
.artist-pagination :deep(.ant-pagination-prev:hover),
.artist-pagination :deep(.ant-pagination-next:hover) {
  border-color: #00dbde;
}

.artist-pagination :deep(.ant-pagination-item-active) {
  background: linear-gradient(90deg, #00dbde 0%, #fc00ff 100%);
  border-color: transparent;
}

.artist-pagination :deep(.ant-pagination-item-active a) {
  color: white;
}

.artist-pagination :deep(.ant-pagination-item-link) {
  color: rgba(255, 255, 255, 0.8);
  background: transparent;
  border: none;
}

.artist-pagination :deep(.ant-pagination-disabled .ant-pagination-item-link) {
  color: rgba(255, 255, 255, 0.3);
}

.artist-pagination :deep(.ant-pagination-options) {
  display: none;
}

.artist-header {
  padding: 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.artist-detail {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-top: 15px;
}

.artist-detail-cover {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
}

.artist-detail-info {
  flex: 1;
}

.artist-detail-name {
  color: white;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 10px 0;
}

.artist-detail-bio {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 10px 0;
  max-width: 600px;
}

.artist-detail-meta {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin: 0 0 15px 0;
}

.artist-actions .ant-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.artist-actions .ant-btn.followed {
  background: rgba(255, 71, 87, 0.2);
  border-color: #ff4757;
  color: #ff4757;
}

.artist-songs-list .music-item-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.artist-songs-list .music-number {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  min-width: 20px;
}

.artist-songs-list .music-cover {
  border-radius: 4px;
  overflow: hidden;
}

.artist-songs-list .music-info {
  flex: 1;
}

.artist-songs-list .music-duration {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  min-width: 50px;
  text-align: right;
}
</style>

<style scoped>
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