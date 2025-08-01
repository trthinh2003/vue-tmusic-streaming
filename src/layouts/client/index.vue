<template>
  <div class="music-app d-flex flex-column flex-sm-row" :style="{ backgroundImage: `url(${currentBackground})` }">
    <!-- Phần header mobile -->
    <div class="mobile-header d-flex d-sm-none align-items-center justify-content-between p-3">
      <div class="d-flex align-items-center">
        <a-button type="text" @click="showDrawer" class="menu-btn">
          <i class="fa-solid fa-bars"></i>
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
            class="tour-btn" 
            @click="startTour"
            style="margin-left: 8px;"
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
          @next-song="nextSongHandler"
          @prev-song="prevSongHandler"
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
        zIndex: '1000'
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
  <ShareQRModal
    v-model:open="shareModalVisible"
    :song="currentSong"
  />
  <ProfileModal
    :open="showProfileModal"
    @update:open="showProfileModal = $event"
    @profile-updated="handleProfileUpdated"
  />
  <a-tour 
    v-model:open="tourVisible" 
    :steps="steps" 
    :current="currentStep"
    @change="(current) => currentStep = current"
    @close="closeTour"
    @finish="closeTour"
    type="primary"
    :arrow="{ pointAtCenter: true }"
  >
    <template #indicatorsRender="{ current, total }">
      <span>{{ current + 1 }} / {{ total }}</span>
    </template>
  </a-tour>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch } from 'vue'

// Components
import Playlist from '@/components/client/Playlist.vue'
import Player from '@/components/client/Player.vue'
import PlayListModal from '@/components/client/modals/PlayListModal.vue'
import ExploreModal from '@/components/client/modals/ExploreModal.vue'
import LyricWithComments from '@/components/client/lyrics/LyricWithComments.vue'
import FavoriteModal from '@/components/client/modals/FavoriteModal.vue'
import FilterModal from '@/components/client/modals/FilterModal.vue'
import SongDetailDrawer from '@/components/client/SongDetailDrawer.vue'
import ShareQRModal from '@/components/client/modals/ShareQRModal.vue'
import ProfileModal from '@/components/client/modals/ProfileModal.vue'

// UI Components
import { Button, Drawer, Input, Tour } from 'ant-design-vue'
import { Icon } from '@iconify/vue'

// Composables
import { usePlayer } from '@/composables/Main/usePlayer'
import { usePlaylist } from '@/composables/Main/usePlaylist'
import { useFilters } from '@/composables/Main/useFilters'
import { useModals } from '@/composables/Main/useModals'
import { useFavorites } from '@/composables/Main/useFavorites'
import { useSongRecommendations } from '@/composables/Main/useSongRecommendations'
import { useTour } from '@/composables/Main/useTour'

// Stores
import { useProfileStore } from '@/stores/useProfile.js'

// Assets
import tmusicbackground2 from '@/assets/img/tmusic_bg2.jpg'
import adminLogo from '@/assets/img/admin-logo.png'

// Initialize composables
const {
  currentSong,
  currentAudioTime,
  currentLyric,
  karaokeMode,
  playerRef,
  isPlaying,
  selectSong,
  togglePlay,
  handlePausePlay,
  updateAudioTime,
  handleSeek,
  handleKaraokeToggle
} = usePlayer()

const {
  originalPlaylist,
  songs,
  playlists,
  currentPlaylistId,
  isShuffled,
  playlistRef,
  currentPlaylist,
  getSongsFromServer,
  fetchPlaylists,
  handleShuffleUpdate,
  nextSong,
  prevSong,
  handlePlayPlaylist,
  handlePlayFavorites,
  handleClearFavorites,
  handleChangePlaylist,
  handlePlaylistChange
} = usePlaylist(currentSong, isPlaying)

const {
  searchQuery,
  filters,
  visibleFilterModal,
  hasActiveFilters,
  activeFilters,
  filteredSongs,
  openFilterModal,
  applyFilter,
  clearAllFilters,
  removeFilter,
  getFilterLabel,
  updateFilters,
  handleSearch
} = useFilters(originalPlaylist, songs, currentSong)

const {
  visible,
  showModal,
  showFavoriteModal,
  shareModalVisible,
  showProfileModal,
  visibleExploreModal,
  openSongDetail,
  openRightDrawer,
  showRightDrawer,
  drawerLyricWidth,
  showMobileSearch,
  showDrawer,
  toggleRightDrawer,
  onCloseRightDrawer,
  openExploreModal,
  handleOpenFavoriteModal,
  handleCloseFavoriteModal,
  openProfileModal,
  showShareModal,
  toggleSongDetail,
  handleLogout,
  handleProfileUpdated,
  updateDrawerWidth
} = useModals()

const {
  isFavorite,
  handleFavoriteUpdate,
  toggleFavorite,
  initializeFavorites
} = useFavorites(songs, currentSong)

const {
  sameArtistSongs,
  suggestedSongs,
  fetchSameArtistSongs,
  fetchRecommendedSongs
} = useSongRecommendations(currentSong, openSongDetail)

const {
  tourVisible,
  currentStep,
  steps,
  startTour,
  nextStep,
  prevStep,
  closeTour
} = useTour()

// Local state
const currentUser = ref({})

const currentBackground = computed(() => {
  return currentSong.value?.background || 'linear-gradient(135deg, var(--dark-bg) 0%, #0f3460 100%)'
})

const playSong = (song) => {
  try {
    if (!song) {
      console.warn('playSong called with invalid song:', song)
      return
    }
    selectSong(song)
  } catch (error) {
    console.error('Error in playSong:', error)
  }
}

const nextSongHandler = () => {
  try {
    console.log('nextSongHandler called')
    console.log('Current filteredSongs:', filteredSongs.value)
    console.log('Current song:', currentSong.value)
    
    if (!filteredSongs.value || filteredSongs.value.length === 0) {
      console.warn('No filtered songs available')
      return
    }
    
    nextSong(filteredSongs.value)
  } catch (error) {
    console.error('Error in nextSongHandler:', error)
  }
}

const prevSongHandler = () => {
  try {
    console.log('prevSongHandler called')
    console.log('Current filteredSongs:', filteredSongs.value)
    console.log('Current song:', currentSong.value)
    
    if (!filteredSongs.value || filteredSongs.value.length === 0) {
      console.warn('No filtered songs available')
      return
    }
    
    prevSong(filteredSongs.value)
  } catch (error) {
    console.error('Error in prevSongHandler:', error)
  }
}

// Profile handling
const handleProfileUpdatedLocal = (updatedUser) => {
  try {
    const result = handleProfileUpdated(updatedUser)
    currentUser.value = useProfileStore().getProfile()
    return result
  } catch (error) {
    console.error('Error in handleProfileUpdatedLocal:', error)
  }
}

// Lifecycle hooks
onMounted(async () => {
  try {
    currentUser.value = useProfileStore().getProfile()
    
    updateDrawerWidth()
    window.addEventListener('resize', updateDrawerWidth)
    
    await getSongsFromServer()
    await fetchPlaylists()
    await initializeFavorites()
    await fetchRecommendedSongs()
  } catch (error) {
    console.error('Error in onMounted:', error)
  }
})

onBeforeUnmount(() => {
  try {
    window.removeEventListener('resize', updateDrawerWidth)
  } catch (error) {
    console.error('Error in onBeforeUnmount:', error)
  }
})

// Watchers
watch(isShuffled, (newVal) => {
  try {
    if (newVal) {
      handleShuffleUpdate(true)
    } else {
      handleShuffleUpdate(false)
    }
  } catch (error) {
    console.error('Error in isShuffled watch:', error)
  }
})

watch(originalPlaylist, (newVal) => {
  try {
    if (newVal && newVal.length > 0) {
      songs.value = [...newVal]
      if (!currentSong.value) {
        currentSong.value = newVal[0]
      }
    }
  } catch (error) {
    console.error('Error in originalPlaylist watch:', error)
  }
}, { deep: true })

watch(() => visible.value, (newVal) => {
  try {
    if (!newVal && currentSong.value) {
    }
  } catch (error) {
    console.error('Error in visible watch:', error)
  }
})
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
  overflow-y: hidden;
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
  right: -8px;
  z-index: 1000;
  min-width: 50px;
  height: 50px;
  border-radius: 25px;
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(15px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  font-size: 16px;
  font-weight: 500;
}

.toggle-sidebar-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: white;
  transform: translateY(-2px) scale(1.05);
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

<style scoped>
.tour-btn {
  transition: all 0.3s;
}

.tour-btn:hover {
  color: var(--accent-color);
  transform: scale(1.1);
}

:deep(.ant-tour) {
  width: 250px !important; 
  max-width: 90vw;
}

:deep(.ant-tour-content) {
  background: rgba(26, 26, 46, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

:deep(.ant-tour-title) {
  color: var(--accent-color);
}

:deep(.ant-tour-description) {
  color: #eee;
}

:deep(.ant-tour-next-btn) {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

:deep(.ant-tour-prev-btn) {
  color: #eee;
}

:deep(.ant-tour-indicator) {
  background: var(--accent-color);
}
</style>