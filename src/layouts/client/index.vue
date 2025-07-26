<template>
  <div class="music-app d-flex flex-column flex-sm-row" :style="{ backgroundImage: `url(${currentBackground})` }">
    <!-- Phần header mobile -->
    <div class="mobile-header d-flex d-sm-none align-items-center justify-content-between p-3">
      <div class="d-flex align-items-center">
        <a-button type="text" @click="showDrawer" class="menu-btn">
          <i class="fa-solid fa-bars"></i>
        </a-button>
        <a-button 
          type="text" 
          class="help-btn" 
          @click.stop="showHelpModal"
          style="padding: 0; width: 28px; height: 28px; border-radius: 50%; background-color: #444;"
        >
          <i class="fa-solid fa-question"></i>
        </a-button>
      </div>

      <div class="ms-0 me-2">
        <i class="fa-solid fa-music me-1"></i>
        <p class="d-inline"><span class="text-white">TMusic</span>Streaming</p>
      </div>
      
      <!-- Avatar mobile -->
      <a-dropdown :trigger="['click']" placement="bottomRight">
        <a-avatar 
          :size="36" 
          :src="currentUser.avatar || adminLogo" 
          class="cursor-pointer"
        />
        
        <template #overlay>
          <a-menu>
            <a-menu-item key="profile" @click="openProfileModal">
              <i class="fa-solid fa-user me-2 text-white"></i>
              <span class="text-white">Hồ sơ</span>
            </a-menu-item>
            <a-menu-item key="settings">
              <i class="fa-solid fa-gear me-2 text-white"></i>
              <span class="text-white">Cài đặt</span>
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item key="logout" @click="handleLogout">
              <i class="fa-solid fa-right-from-bracket me-2 text-white"></i>
              <span class="text-white">Đăng xuất</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>

    <!-- Drawer cho mobile -->
    <a-drawer 
      v-model:open="visible"
      placement="left"
      class="mobile-drawer"
      :width="300"
      :body-style="{ padding: 0 }"
    >
      <template #title>
        <div class="drawer-header-container">
          <span></span>
          <a-button 
            type="text" 
            @click="openExploreModal"
            class="explore-drawer-btn"
          >
            <Icon icon="mdi:compass-outline" />
            <span class="explore-text d-inline">Khám phá</span>
          </a-button>
        </div>
      </template>

      <div class="sidebar h-100">
        <h1><span class="text-white">TMusic</span>Streaming</h1>
        <div class="search p-3">
          <a-input-search
            v-model:value="searchQuery"
            placeholder="Tìm kiếm bài hát..."
            @search="handleSearch"
          />
        </div>

        <div class="advance-filter d-flex align-items-center justify-content-center">
          <a-button 
            type="text" 
            class="advance-filter-btn p-1"
            style="background-color: #444; width: 50%;"
            @click="openFilterModal"
          >
            <template #icon>
              <i class="fa-solid fa-filter me-1"></i> Lọc nâng cao
            </template>
          </a-button>
        </div>
        <!-- Filter tags cho desktop -->
        <div class="filter-tags" v-if="hasActiveFilters">
          <template v-for="(value, key) in activeFilters" :key="key">
            <a-tag
              v-if="value && (Array.isArray(value) ? value.length : true)"
              closable
              @close="removeFilter(key)"
              class="mx-1 my-1"
            >
              {{ getFilterLabel(key) }}: {{ 
                Array.isArray(value) ? 
                $truncateWords(value.join(', '), 5) : 
                $truncateWords(value, 5) 
              }}
            </a-tag>
          </template>
        </div>

        <playlist 
          :songs="filteredSongs" 
          :current-song="currentSong"
          :available-playlists="playlists"
          :current-playlist-id="currentPlaylistId"
          @select-song="selectSong"
          @change-playlist="handleChangePlaylist"
          @open-modal="showModal = true"
          @open-favorite-modal="handleOpenFavoriteModal"
        />
      </div>
    </a-drawer>

    <!-- Sidebar cho desktop -->
    <div class="sidebar d-none d-sm-flex flex-sm-column flex-row">
      <div class="d-none d-sm-block">
        <h1 class=""><span class="text-white">TMusic</span>Streaming</h1>
        <div class="search p-3">
          <a-input-search
            v-model:value="searchQuery"
            placeholder="Tìm kiếm bài hát..."
            @search="handleSearch"
            enter-button
          />
        </div>
      </div>
      <div class="advance-filter d-flex align-items-center justify-content-center">
        <a-button 
          type="text" 
          class="advance-filter-btn p-1"
          style="background-color: #444; width: 50%;"
          @click="openFilterModal"
        >
          <template #icon>
            <i class="fa-solid fa-filter me-1"></i> Lọc nâng cao
          </template>
        </a-button>
      </div>

      <!-- Filter tags cho desktop -->
      <div class="filter-tags" v-if="hasActiveFilters">
        <template v-for="(value, key) in activeFilters" :key="key">
          <a-tag
            v-if="value && (Array.isArray(value) ? value.length : true)"
            closable
            @close="removeFilter(key)"
            class="mx-1 my-1"
          >
            {{ getFilterLabel(key) }}: {{ 
              Array.isArray(value) ? 
              $truncateWords(value.join(', '), 5) : 
              $truncateWords(value, 5) 
            }}
          </a-tag>
        </template>
      </div>

      <playlist 
        ref="playlistRef"
        :songs="filteredSongs" 
        :current-song="currentSong"
        :available-playlists="playlists"
        :current-playlist-id="currentPlaylistId"
        @select-song="selectSong"
        @change-playlist="handleChangePlaylist"
        @open-modal="showModal = true"
        @open-favorite-modal="handleOpenFavoriteModal"
        @clear-favorites="handleClearFavorites"
        class="d-none d-sm-block"
      />
    </div>

    <!-- Main content -->
    <div class="d-flex flex-column justify-content-center align-items-center w-100">
      <!-- Main header cho desktop -->
      <div class="main-header d-none d-sm-flex flex-row justify-content-between align-items-center w-100 py-3 px-0">
        <div class="d-flex align-items-center">
          <h1><span class="text-white">TMusic</span>Streaming</h1>
          <a-button 
            type="text" 
            class="help-btn" 
            @click="showHelpModal"
          >
            <i class="fa-solid fa-question" 
              style="color: #fff; font-size: 14px; background-color: #444; padding: 7px; border-radius: 50%;">
            </i>
          </a-button>
        </div>

        <a-button 
          type="text" 
          @click="openExploreModal"
          class="explore-header-btn"
        >
          <Icon icon="mdi:compass-outline" class="me-2" />
          Khám phá
        </a-button>

        <a-dropdown :trigger="['click']" placement="bottomRight">
          <div class="user-avatar">
            <a-avatar 
              :size="40" 
              :src="currentUser.avatar || adminLogo" 
              class="cursor-pointer"
            />
            <span class="username ms-2">{{ currentUser.username }}</span>
            <i class="fa-solid fa-chevron-down ms-2"></i>
          </div>
          
          <template #overlay>
            <a-menu>
              <a-menu-item key="profile" @click="openProfileModal">
                <i class="fa-solid fa-user me-2 text-white"></i>
                <span class="text-white">Hồ sơ</span>
              </a-menu-item>
              <a-menu-item key="settings">
                <i class="fa-solid fa-gear me-2 text-white"></i>
                <span class="text-white">Cài đặt</span>
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item key="logout" @click="handleLogout">
                <i class="fa-solid fa-right-from-bracket me-2 text-white"></i>
                <span class="text-white">Đăng xuất</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <div class="main-content">
        <player 
          v-if="currentSong"
          ref="playerRef"
          :current-song="currentSong"
          :is-favorite="currentSong.isFavorite"
          :is-playing="isPlaying"
          :playlist="songs"
          @toggle-play="togglePlay"
          @next-song="nextSong"
          @prev-song="prevSong"
          @update-shuffle="handleShuffleUpdate"
          @timeupdate="updateAudioTime"
          @favorite-updated="handleFavoriteUpdate"
          :is-shuffled="isShuffled"
        />
      </div>
    </div>
  </div>
  <FilterModal 
    v-model="visibleFilterModal"
    v-model:filters="filters"
    @apply-filter="applyFilter"
    @clear-filters="clearAllFilters"
    @update:filters="updateFilters"
  />
  <ExploreModal 
    v-model="visibleExploreModal"
    @update:modelValue="visibleExploreModal = false"
    @pause-play="handlePausePlay"
  />
  <a-button type="text" class="toggle-sidebar-btn me-2" @click="toggleRightDrawer">
    <i class="fa-solid fa-angle-left"></i>
  </a-button>
  <a-drawer 
    class="lyric-drawer-right" 
    :width="drawerLyricWidth"
    title="Lời bài hát & Bình luận"
    placement="right" 
    :header-style="{ background: 'rgba(26, 26, 46, 0.9)' }"
    :open="openRightDrawer" 
    @close="onCloseRightDrawer"
    :style="{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${currentBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '100%',
        marginLeft: 'auto',
      }"
  >
    <template #extra>
      <div style="margin-right: 8px;">
        <a-switch
          v-model:checked="karaokeMode"
          checked-children="Karaoke"
          un-checked-children="Thường"
          @change="handleKaraokeToggle"
        />
      </div> 
    </template>
    <LyricWithComments
      :current-lyric="currentLyric"
      :current-audio-time="currentAudioTime"
      :current-song="currentSong"
      :karaoke-mode="karaokeMode"
      @seek-lyric="handleSeek"
    />
  </a-drawer>
  <div class="song-detail-trigger" @click="toggleSongDetail">
    <i class="fa-solid fa-chevron-up"></i>
  </div>

  <SongDetailDrawer v-if="currentSong"
    v-model:open="openSongDetail"
    :current-song="currentSong"
    :same-artist-songs="sameArtistSongs"
    :suggested-songs="suggestedSongs"
    :is-favorite="isFavorite"
    :background-image="tmusicbackground2"
    @toggle-favorite="toggleFavorite"
    @select-song="selectSong"
    @play-song="playSong"
    @show-share-modal="showShareModal"
    @toggle-right-drawer="toggleRightDrawer"
  />

  <!-- Modal xác nhận logout -->
  <a-modal 
    v-model:open="logoutModalVisible"
    :footer="null"
    :closable="false"
    centered
    class="logout-modal"
  >
    <div class="logout-modal-content">
      <img 
        :src="logoutImage"
        alt="Tiếc nuối khi logout"
        class="logout-image"
      />
      <p class="logout-message">Chúng tôi sẽ nhớ bạn lắm đó!</p>
      <div class="logout-actions">
        <a-button type="primary" @click="confirmLogout" danger>
          <i class="fa-solid fa-right-from-bracket me-2"></i>
          Đăng xuất
        </a-button>
        <a-button @click="logoutModalVisible = false">
          <i class="fa-solid fa-xmark me-2"></i>
          Ở lại
        </a-button>
      </div>
    </div>
  </a-modal>
  <PlayListModal
    :open="showModal"
    @update:open="showModal = $event"
    :available-playlists="playlists"
    :current-playlist="currentPlaylist"
    @change-playlist="handlePlaylistChange"
    @play-playlist="handlePlayPlaylist"
    @refresh="fetchPlaylists"
    @close="showModal = false"
  />
  <FavoriteModal
    :open="showFavoriteModal"
    @update:open="showFavoriteModal = $event"
    @play-favorites="handlePlayFavorites"
    @close="handleCloseFavoriteModal"
  />
  <HelpGuideModal 
    v-model="helpModalVisible"
    :steps="helpSteps"
    @close="handleHelpModalClose"
  />
  <ShareQRModal
    v-model:open="shareModalVisible"
    :song="currentSong"
  />
  <ProfileModal
    :open="showProfileModal"
    @update:open="showProfileModal = $event"
    @profile-updated="handleProfileUpdated"
  />
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount  } from 'vue'

import Playlist from '@/components/client/Playlist.vue'
import Player from '@/components/client/Player.vue'
import PlayListModal from '@/components/client/modals/PlayListModal.vue'
import ExploreModal from '@/components/client/modals/ExploreModal.vue'
import LyricWithComments from '@/components/client/lyrics/LyricWithComments.vue'
import HelpGuideModal from '@/components/client/modals/HelpGuideModal.vue'
import FavoriteModal from '@/components/client/modals/FavoriteModal.vue'
import FilterModal from '@/components/client/modals/FilterModal.vue'
import SongDetailDrawer from '@/components/client/SongDetailDrawer.vue'
import ShareQRModal from '@/components/client/modals/ShareQRModal.vue'
import ProfileModal from '@/components/client/modals/ProfileModal.vue'

import { Button, Drawer, Input } from 'ant-design-vue'
import { Icon } from '@iconify/vue'
import axiosInstance from '@/configs/axios'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getSongs, getRandomSongs, getSongByPlaylist, getSongsFromFavorites, getSongByArtist } from '@/services/songService'
import { getMyPlaylists } from '@/services/playlistService'
import { getRecommendSongs } from '@/services/recommendService'

import { useProfileStore } from '@/stores/useProfile.js'
import { useFavoriteStore } from '@/stores/useFavoriteStore'
import { useNextSongSignalStore } from '@/stores/nextSongSignalStore';
import { usePlayerStore } from '@/stores/playerStore';

import tmusicbackground2 from '@/assets/img/tmusic_bg2.jpg';
import logoutImage from '@/assets/client/guide/logout_done.png';
import guideImage1 from '@/assets/client/guide/guide.png';
import guideImage2 from '@/assets/client/guide/guide.png';

import adminLogo from '@/assets/img/admin-logo.png';

const showProfileModal = ref(false);
const openProfileModal = () => {
  showProfileModal.value = true;
};

const handleProfileUpdated = (updatedUser) => {
  console.log("Profile updated successfully:", updatedUser);
  message.success('Hồ sơ đã được cập nhật!');
  currentUser.value = useProfileStore().getProfile();
};

const originalPlaylist = ref([]);
const favoriteStore = useFavoriteStore()
const nextSongSignalStore = useNextSongSignalStore();
const playerStore = usePlayerStore();

const shareModalVisible = ref(false);

const getSongsFromServer = async () => {
  try {
    const response = await getRandomSongs(1, 31, 30);
    originalPlaylist.value = response.data.data;
    songs.value = [...originalPlaylist.value];
    currentSong.value = songs.value[0];
    console.log('Songs loaded:', songs.value);
  } catch (error) {
    // console.error('Error loading songs:', error);
    // message.error('Không thể tải danh sách bài hát');
    // throw error;
  }
}
getSongsFromServer();

const songs = ref([...originalPlaylist.value])
const currentUser = ref({})
const currentSong = ref(songs.value[0])
const isPlaying = computed({
  get: () => playerStore.isPlaying,
  set: (value) => playerStore.setPlayingState(value)
});
const isShuffled = ref(false)
const visible = ref(false)
const showMobileSearch = ref(false) 
const searchQuery = ref('')
const router = useRouter()
const visibleExploreModal = ref(false);
const visibleFilterModal = ref(false);
const filters = ref({ songName: '', artistName: '', genre: '' });
const showRightDrawer = ref(true)
const openRightDrawer = ref(false)

const currentLyric = ref('');
const currentAudioTime = ref(0);

const karaokeMode = ref(false);

const logoutModalVisible = ref(false);

currentUser.value = useProfileStore().getProfile();

/*****************Chi tiết bài hát và hệ thống gợi ý*****************/
const openSongDetail = ref(false);
const isFavorite = (id) => {
  const song = songs.value.find(s => s.id === id);
  if (song && typeof song.isFavorite === 'boolean') {
    return song.isFavorite;
  }
  // Fallback về favorite store
  return favoriteStore.isFavorite(id);
}
const handleFavoriteUpdate = (songId, isFavorite) => {
  const song = songs.value.find(s => s.id === songId)
  if (song) song.isFavorite = isFavorite

  if (currentSong.value?.id === songId) {
    currentSong.value.isFavorite = isFavorite
  }
}


const sameArtistSongs = ref([]);
const fetchSameArtistSongs = async (artistName) => {
  if (!artistName) {
    sameArtistSongs.value = [];
    return;
  }
  try {
    const response = await getSongByArtist(artistName);
    sameArtistSongs.value = response.data.data.filter(song => song.id !== currentSong.value.id);
  } catch (error) {
    console.error('Error fetching songs by artist:', error);
    sameArtistSongs.value = [];
  }
};

const suggestedSongs = ref([]);
const fetchRecommendedSongs = async () => {
  try {
    const response = await getRecommendSongs(10) // Lấy 10 bài hát gợi ý
    suggestedSongs.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching recommended songs:', error)
    suggestedSongs.value = []
  }
}

watch(() => openSongDetail.value, (newVal) => {
  if (newVal && currentSong.value) {
    fetchSameArtistSongs(currentSong.value.artist);
    fetchRecommendedSongs();
  } else {
    sameArtistSongs.value = [];
    suggestedSongs.value = [];
  }
});

watch(currentSong, (newSong, oldSong) => {
  if (openSongDetail.value && newSong && newSong.artist !== oldSong?.artist) {
    fetchSameArtistSongs(newSong.artist);
  }
  if (openSongDetail.value && newSong) {
    fetchRecommendedSongs();
  }
}, { deep: true });

const playSong = (song) => {
  selectSong(song);
}

const toggleSongDetail = () => {
  openSongDetail.value = !openSongDetail.value;
};

const showShareModal = () => {
  shareModalVisible.value = true
}

const toggleFavorite = async (id) => {
  try {
    const status = await favoriteStore.toggle(id)
    handleFavoriteUpdate(id, status)
  } catch (error) {
    console.error('Error toggling favorite:', error)
  }
}
const handleKaraokeToggle = (checked) => {
  karaokeMode.value = checked;
};

const openFilterModal = () => {
  visibleFilterModal.value = true;
};

const applyFilter = (appliedFilters) => {
  try {
    const safeFilters = appliedFilters || { 
      songName: '', 
      artistName: '', 
      genres: [] 
    };
    if (!safeFilters.songName && !safeFilters.artistName && 
        (!safeFilters.genres || safeFilters.genres.length === 0)) {
      songs.value = [...originalPlaylist.value];
    } else {
      songs.value = originalPlaylist.value.filter(song => {
        const matchesSongName = safeFilters.songName 
          ? song.title.toLowerCase().includes(safeFilters.songName.toLowerCase())
          : true;
        const matchesArtistName = safeFilters.artistName 
          ? song.artist.toLowerCase().includes(safeFilters.artistName.toLowerCase())
          : true;
        const matchesGenres = safeFilters.genres?.length > 0
          ? safeFilters.genres.some(genre => 
              song.genre.toLowerCase().includes(genre.toLowerCase()))
          : true;
        return matchesSongName && matchesArtistName && matchesGenres;
      });
    }
    if (songs.value.length > 0 && !songs.value.some(s => s.id === currentSong.value?.id)) {
      currentSong.value = songs.value[0];
    }
    visibleFilterModal.value = false;
  } catch (error) {
    console.error('Filter error:', error);
    message.error('Có lỗi khi áp dụng bộ lọc');
  }
};
const clearAllFilters = () => {
  filters.value = { songName: '', artistName: '', genres: [] };
  songs.value = [...originalPlaylist.value];
};

const playerRef = ref(null);

const handleSeek = (time) => {
  if (playerRef.value) {
    playerRef.value.seekTo(time);
  }
};

/**************** Tabs ****************/
// Computed property để kiểm tra có bộ lọc đang hoạt động không
const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(val => val !== '');
});

// Computed property để lọc ra các bộ lọc đang được áp dụng
const activeFilters = computed(() => {
  return Object.fromEntries(
    Object.entries(filters.value).filter(([_, value]) => value !== '')
  );
});

// Method để xóa từng bộ lọc
const removeFilter = (filterKey) => {
  if (filterKey === 'genres') {
    filters.value.genres = [];
  } else {
    filters.value[filterKey] = '';
  }
  applyFilter(filters.value);
};

// Method để hiển thị label cho từng loại filter
const getFilterLabel = (key) => {
  const labels = {
    songName: 'Tên bài hát',
    artistName: 'Nghệ sĩ',
    genre: 'Thể loại'
  };
  return labels[key] || key;
};

const updateFilters = (newFilters) => {
  filters.value = newFilters;
}

// Lọc bài hát theo từ khóa
const filteredSongs = computed(() => {
  if (!searchQuery.value) return songs.value
  const query = searchQuery.value.toLowerCase()
  return songs.value.filter(song => 
    song.title.toLowerCase().includes(query) || 
    song.artist.toLowerCase().includes(query) ||
    song.genre.toLowerCase().includes(query)
  )
})

const showDrawer = () => {
  visible.value = true
}

const handleSearch = () => {
  if (showMobileSearch.value) {
    showMobileSearch.value = false
  }
}

// Trộn bài
const shufflePlaylist = () => {
  const shuffled = [...filteredSongs.value.length > 0 ? filteredSongs.value : songs.value];
  
  // Thuật toán Fisher-Yates
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  songs.value = shuffled;
  
  // Đảm bảo bài hát hiện tại vẫn trong playlist
  if (!shuffled.some(song => song.id === currentSong.value.id)) {
    currentSong.value = shuffled[0];
    isPlaying.value = true;
  }
}

// Khôi phục playlist gốc
const restorePlaylist = () => {
  songs.value = [...originalPlaylist.value];
  // Nếu đang áp dụng bộ lọc, cần giữ nguyên trạng thái filter
  if (hasActiveFilters.value) {
    applyFilter();
  }
}

// Xử lý khi bật/tắt shuffle
const handleShuffleUpdate = (shuffleStatus) => {
  isShuffled.value = shuffleStatus;
  if (shuffleStatus) {
    shufflePlaylist();
  } else {
    restorePlaylist();
  }
  
  // Đảm bảo UI cập nhật
  if (filteredSongs.value.length > 0 && !filteredSongs.value.some(s => s.id === currentSong.value.id)) {
    currentSong.value = filteredSongs.value[0];
  }
}

// Chọn bài hát
const selectSong = (song) => {
  currentSong.value = song
  playerStore.setCurrentSongId(song.id);
  playerStore.setPlayingState(true);
  visible.value = false // Đóng Drawer khi chọn bài hát trên mobile
}

// Play/Pause
const togglePlay = () => {
  isPlaying.value = !isPlaying.value
}

// Dừng hát bài hát hiện tại tại component Player nếu có bài hát khác đc phát trong FilterModal
const handlePausePlay = () => {
  isPlaying.value = false
}

// Bài tiếp theo
const nextSong = () => {
  const currentIndex = filteredSongs.value.findIndex(song => song.id === currentSong.value.id)
  const nextIndex = (currentIndex + 1) % filteredSongs.value.length
  currentSong.value = filteredSongs.value[nextIndex]
  isPlaying.value = true
  nextSongSignalStore.triggerRefresh(currentSong.value.id)
}

// Bài trước đó
const prevSong = () => {
  const currentIndex = filteredSongs.value.findIndex(song => song.id === currentSong.value.id)
  const prevIndex = (currentIndex - 1 + filteredSongs.value.length) % filteredSongs.value.length
  currentSong.value = filteredSongs.value[prevIndex]
  isPlaying.value = true
  nextSongSignalStore.triggerRefresh(currentSong.value.id)
}

watch(isShuffled, (newVal) => {
  if (newVal) {
    shufflePlaylist()
  } else {
    restorePlaylist()
  }
})

watch(originalPlaylist, (newVal) => {
  if (newVal.length > 0) {
    songs.value = [...newVal];
    if (!currentSong.value) {
      currentSong.value = newVal[0];
    }
  }
}, { deep: true });

// Theo dõi thay đổi bài hát
watch(currentSong, async (newSong) => {
  // Kiểm tra null hoặc undefined
  if (!newSong || !newSong.lyric) {
    currentLyric.value = '';
    return;
  }

  try {
    if (typeof newSong.lyric === 'string') {
      const response = await fetch(newSong.lyric);
      currentLyric.value = await response.text();
    } else {
      currentLyric.value = newSong.lyric;
    }
  } catch (error) {
    console.error('Error loading lyric:', error);
    currentLyric.value = '';
  }
}, { immediate: true });

// Hàm cập nhật thời gian audio
const updateAudioTime = (time) => {
  currentAudioTime.value = time;
  playerStore.setCurrentTime(time);
};

const toggleRightDrawer = () => {
  showRightDrawer.value = !showRightDrawer.value
  openRightDrawer.value = true;
}

const onCloseRightDrawer = () => {
  openRightDrawer.value = false
}

const currentBackground = computed(() => {
  return currentSong.value?.background || 'linear-gradient(135deg, var(--dark-bg) 0%, #0f3460 100%)'
})

// Modal Guide
const helpModalVisible = ref(false);
const helpSteps = ref([
  {
    id: 1,
    title: "Tìm kiếm bài hát",
    description: "Sử dụng ô tìm kiếm để tìm bài hát theo tên, nghệ sĩ hoặc thể loại",
    image: guideImage1
  },
  {
    id: 2,
    title: "Phát nhạc",
    description: "Nhấn vào bài hát trong danh sách để phát, sử dụng các nút điều khiển để play/pause, chuyển bài",
    image: guideImage2
  }
]);

const showHelpModal = (e) => {
  try {
    e?.stopPropagation();
    e?.preventDefault();
    
    // Đảm bảo steps có dữ liệu trước khi hiển thị
    if (!helpSteps.value || helpSteps.value.length === 0) {
      console.error('Help steps data is empty');
      return;
    }
    
    helpModalVisible.value = true;
    console.log('Modal opened successfully');
  } catch (error) {
    console.error('Error opening help modal:', error);
    message.error('Có lỗi khi mở hướng dẫn');
  }
};

const handleHelpModalClose = () => {
  helpModalVisible.value = false;
};

const playlistRef = ref(null);
// Modal Favorite
const showFavoriteModal = ref(false);
const handleOpenFavoriteModal = () => {
  showFavoriteModal.value = true;
};
const handleCloseFavoriteModal = () => {
  showFavoriteModal.value = false;
};
const handlePlayFavorites = async () => {
  console.log('Đã emit nút "Phát bài hát yêu thích"');
  try {
    const res = await getSongsFromFavorites();
    console.log('Danh sách bài hát yêu thích:', res.data.data);
    originalPlaylist.value = res.data.data;
    songs.value = [...originalPlaylist.value];
    if (songs.value.length > 0) {
      currentSong.value = songs.value[0];
      isPlaying.value = true;
    }
    showFavoriteModal.value = false;
    
    if (playlistRef.value) {
      playlistRef.value.handlePlayFavorites();
    }
  } catch (error) {
    console.log('Không thể tải danh sách bài hát yêu thích', error);
  }
};

const handleClearFavorites = () => {
  getSongsFromServer();
};

// Modal Playlist
const showModal = ref(false);
const currentPlaylistId = ref(null);
const playlists = ref([]);

const handlePlaylistChange = (playlist) => {
  currentPlaylistId.value = playlist?.id || null;
  
  // Nếu có playlist được chọn, load songs trong playlist
  if (playlist) {
    loadPlaylistSongs(playlist.id);
  } else {
    // Nếu không, load tất cả bài hát
    loadAllSongs();
  }
};

const handlePlayPlaylist = async (playlistId) => {
  try {
    currentPlaylistId.value = playlistId;
    
    const response = await getSongByPlaylist(playlistId);
    console.log('Playlist songs:', response.data.data);
    
    originalPlaylist.value = response.data.data;
    
    songs.value = [...originalPlaylist.value];
    
    if (songs.value.length > 0) {
      currentSong.value = songs.value[0];
      isPlaying.value = true;
    }
    
    showModal.value = false;
  } catch (error) {
    console.error('Error playing playlist:', error);
    message.error('Không thể phát playlist');
  }
};

const currentPlaylist = computed(() => {
  return playlists.value.find(p => p.id === currentPlaylistId.value);
});

const fetchPlaylists = async () => {
  try {
    const response = await getMyPlaylists();
    playlists.value = response.data;
  } catch (error) {
    // console.error('Error fetching playlists:', error);
    // message.error('Không thể tải danh sách playlist');
  }
};

const loadPlaylistSongs = async (playlistId) => {
  try {
    const response = await getSongsInPlaylist(playlistId);
    songs.value = response.data.map(song => ({
      ...song,
      isFavorite: false
    }));
    return songs.value;
  } catch (error) {
    console.error('Error loading playlist songs:', error);
    message.error('Không thể tải bài hát trong playlist');
    return [];
  }
};

const loadAllSongs = async () => {
  try {
    const response = await getSongs(1, 100);
    songs.value = response.data.data;
  } catch (error) {
    console.error('Error loading all songs:', error);
    message.error('Không thể tải danh sách bài hát');
  }
};

const drawerLyricWidth = ref('50vw')
function updateDrawerWidth() {
  const width = window.innerWidth
  if (width < 576) drawerLyricWidth.value = '90vw'       // Mobile
  else if (width < 768) drawerLyricWidth.value = '80vw'   // Tablet
  else drawerLyricWidth.value = '350px'                   // Desktop
}
onMounted(async () => {
  updateDrawerWidth()
  window.addEventListener('resize', updateDrawerWidth)
  await fetchPlaylists()
  const favoriteStore = useFavoriteStore()
  await favoriteStore.fetchFavoriteIds()
  await fetchRecommendedSongs()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateDrawerWidth)
})

const handleChangePlaylist = (playlistId) => {
  currentPlaylistId.value = playlistId;
  
  if (!playlistId) {
    getSongsFromServer();
  }
};

// Đăng xuất 
const handleLogout = () => {
  logoutModalVisible.value = true;
};
const confirmLogout = async () => {
  try {
    const response = await axiosInstance.get('/auth/logout');
    if (response.status === 200) {
      message.success(response.data.message);
      setTimeout(() => {
        router.push({ name: 'login' });
      }, 1000);
    }
  } catch (error) {
    message.error("Đã có lỗi xảy ra!");
  } finally {
    logoutModalVisible.value = false;
  }
};

const openExploreModal = () => {
  visibleExploreModal.value = true;
  visible.value = false; // Đóng drawer mobile nếu đang mở
};
</script>

<style>
:root {
  --primary-color: #4361ee;      
  --secondary-color: #3a0ca3;    
  --accent-color: #4cc9f0;      
  --dark-bg: #1a1a2e;           
  --light-bg: #f8f9fa;          
  --text-light: #f8f9fa;        
  --text-dark: #212529;         
  --card-bg: #16213e;           
  --hover-effect: rgba(255, 255, 255, 0.1); 
}

#app {
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  background: linear-gradient(135deg, var(--dark-bg) 0%, #0f3460 100%);
  color: var(--text-light);
  overflow: hidden;
}

.music-app {
  display: flex;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: background-image 0.5s ease-in-out;
  position: relative;
}

.music-app::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 46, 0.8);
  z-index: 0;
}

.sidebar, .main-content, .mobile-header, .main-header {
  position: relative;
  z-index: 1;
}

/* Sidebar Styles */
.sidebar {
  width: 310px;
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(10px);
  color: var(--text-light);
  overflow-y: auto;
  padding: 20px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
}

.sidebar h1 {
  color: var(--accent-color);
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  text-align: center;
}

/* Togge Sidebar Styles */
.toggle-sidebar-btn {
  position: fixed;
  top: 50%;
  right: -9px;
  background: rgba(26, 26, 46, 0.9);
  transform: translateY(-50%);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  color: var(--text-light);
  transition: all 0.3s ease;
  font-size: 20px;
  z-index: 100;
  height: 42px;
}

.toggle-sidebar-btn:hover {
  color: var(--accent-color);
  transform: translateX(-2px);
}

.ant-drawer .ant-drawer-title {
  color: var(--text-light);
}

.ant-drawer .ant-drawer-close {
  color: var(--text-light);
}

.ant-drawer .ant-drawer-content {
  background: rgba(26, 26, 46, 0.9);
}

/* Filter Tags */
.filter-tags {
  background: rgba(26, 26, 46, 0.9);
  border-radius: 8px;
  margin: 2px;
}

.ant-tag {
  background: var(--primary-color);
  color: white;
  border: none;
}

.ant-tag-close-icon {
  color: white;
  margin-left: 4px;
}

/* Search Input */
.ant-input-search {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.ant-input-search-button {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

/* Mobile Header */
.mobile-header {
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(5px);
  color: var(--text-light);
  position: sticky;
  top: 0;
  z-index: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-header p {
  font-weight: 500;
  color: var(--accent-color);
  margin: 0;
}

.mobile-header .ant-btn {
  color: var(--text-light);
}

.mobile-search-bar {
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(5px);
  position: sticky;
  top: 56px;
  z-index: 99;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* background: linear-gradient(135deg, rgba(26, 26, 46, 0.6) 0%, rgba(15, 52, 96, 0.6) 100%); */
}

.main-header {
  background: rgba(26, 26, 46, 0.8);
  backdrop-filter: blur(5px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 10px;
}

.main-header h1 {
  color: var(--accent-color);
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
}

.logout-btn {
  color: var(--text-light);
  transition: all 0.3s ease;
}

.logout-btn:hover {
  color: var(--accent-color);
}

/* Drawer Styles */
.mobile-drawer .ant-drawer-content {
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
  color: var(--text-light);
}

.mobile-drawer .ant-drawer-header {
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-drawer .ant-drawer-title {
  color: var(--text-light);
}

.ant-drawer .ant-drawer-body {
  overflow: hidden;
  padding: 0;
}

/* Button Styles */
.ant-btn {
  transition: all 0.3s ease;
}

.ant-btn:hover {
  transform: translateY(-2px);
}

</style>

<style scoped>
/* User dropdown styles */
.user-avatar {
  display: flex;
  margin-right: 5px;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.user-avatar:hover {
  background: rgba(255, 255, 255, 0.2);
}

.username {
  font-weight: 500;
  font-size: 0.9rem;
}

/* Dropdown menu styles */
.ant-dropdown-menu {
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.ant-dropdown-menu-item {
  color: var(--text-light);
  padding: 10px 16px;
  transition: all 0.2s ease;
}

.ant-dropdown-menu-item:hover {
  background: var(--primary-color);
  color: white;
}

.ant-dropdown-menu-item-divider {
  background: rgba(255, 255, 255, 0.1);
}

/* Main header padding */
.main-header {
  padding: 0.8rem 2rem;
}

.ant-input-search .ant-input {
  background: transparent;
  color: #f8f9fa;
}

/* Nút khám phá trên header desktop */
.explore-header-btn {
  color: var(--accent-color);
  font-weight: 500;
  border-radius: 8px;
  padding: 4px 12px;
  transition: all 0.3s ease;
}

.explore-header-btn:hover {
  background: rgba(67, 97, 238, 0.1);
  color: var(--accent-color);
}

.explore-header-btn .iconify {
  font-size: 18px;
  vertical-align: middle;
}

/* Container cho header drawer */
.drawer-header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-right: 8px;
}

/* Nút khám phá trong drawer */
.explore-drawer-btn {
  color: var(--accent-color);
  padding: 0 8px;
  height: auto;
}

.explore-drawer-btn .iconify {
  font-size: 18px;
  vertical-align: middle;
}

.explore-text {
  margin-left: 4px;
  font-size: 14px;
}

:deep(.ant-tabs-content) {
  overflow: hidden;
}

/* Ẩn text trên mobile nhỏ */
@media (max-width: 375px) {
  .explore-text {
    display: none;
  }
}

/* Điều chỉnh header drawer */
:deep(.ant-drawer-header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 12px;
  background: rgba(26, 26, 46, 0.9);
}

:deep(.ant-drawer-title) {
  width: 100%;
}

/* Responsive cho mobile */
@media (max-width: 576px) {
  .music-app {
    flex-direction: column;
  }
  
  .sidebar {
    width: 90%;
    height: auto;
    overflow-y: visible;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .main-header {
    padding: 0.8rem 1rem;
  }

  .mobile-drawer .ant-drawer-header {
    background: transparent;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: absolute;
    z-index: 50;
  }

  .anticon svg {
    display: inline-block;
  }

  .ant-input-search-button {
    background: white;
    border-color: var(--primary-color);
    color: white;
  }
}
</style>

<style scoped>
.song-detail-trigger {
  position: fixed;
  bottom: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.song-detail-trigger:hover {
  transform: translateY(-3px);
  background: var(--secondary-color);
}
</style>

<style scoped>
/* CSS cho modal logout */
.logout-modal .ant-modal-content {
  background: rgba(26, 26, 46, 0.95);
  border-radius: 12px;
  color: white;
}

.logout-modal .ant-modal-header {
  background: transparent;
  border-bottom: none;
}

.logout-modal .ant-modal-title {
  color: white;
  text-align: center;
  font-size: 1.2rem;
}

.logout-modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.logout-image {
  width: 100%;
  max-height: 450px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 20px;
}

.logout-message {
  font-size: 1.1rem;
  margin-bottom: 20px;
  text-align: center;
}

.logout-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  width: 100%;
}
</style>

<style scoped>
/* CSS cho help button */
.help-btn {
  margin-left: 10px;
  color: rgba(255, 255, 255, 0.65);
  transition: all 0.3s;
}

.help-btn:hover {
  color: #fff;
  transform: scale(1.1);
}
</style>