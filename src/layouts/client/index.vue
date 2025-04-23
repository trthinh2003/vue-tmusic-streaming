<template>
  <div class="music-app d-flex flex-column flex-sm-row" :style="{ backgroundImage: `url(${currentBackground})` }">
    <!-- Phần header mobile -->
    <div class="mobile-header d-flex d-sm-none align-items-center justify-content-between p-3">
      <a-button type="text" @click="showDrawer">
        <i class="fa-solid fa-bars"></i>
      </a-button>
      <div class="ms-4">
        <i class="fa-solid fa-music me-1"></i>
        <p class="d-inline"><span class="text-white">TMusic</span>Streaming</p>
      </div>
      <a-button 
        type="text" 
        class="logout-btn"
        @click="handleLogout"
        style="text-align: end;"
      >
        <template #icon>
          <i class="fa-solid fa-right-from-bracket me-1"></i>
        </template>
        <span>Đăng xuất</span>
      </a-button>
    </div>

    <!-- Drawer cho mobile -->
    <a-drawer 
      v-model:open="visible"
      placement="left"
      class="mobile-drawer"
      :width="300"
      :body-style="{ padding: 0 }"
    >
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
            @click="visibleModalFilter = true"
          >
            <template #icon>
              <i class="fa-solid fa-filter me-1"></i> Lọc nâng cao
            </template>
          </a-button>
        </div>
        <!-- Filter tags cho desktop -->
        <div class="filter-tags p-2" v-if="hasActiveFilters">
          <a-tag
            v-for="(value, key) in activeFilters"
            :key="key"
            closable
            @close="removeFilter(key)"
            class="mx-1 my-1"
          >
            {{ getFilterLabel(key) }}: {{ $truncateWords(value, 5) }}
          </a-tag>
        </div>

        <playlist 
          :songs="filteredSongs" 
          :current-song="currentSong"
          @select-song="selectSong"
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
          class="advance-filter-btn p-1 w-75"
          style="background-color: #444;"
          @click="visibleModalFilter = true"
        >
          <template #icon>
            <i class="fa-solid fa-filter me-1"></i> Lọc nâng cao
          </template>
        </a-button>
      </div>

      <!-- Filter tags cho desktop -->
      <div class="filter-tags p-2" v-if="hasActiveFilters">
        <a-tag
          v-for="(value, key) in activeFilters"
          :key="key"
          closable
          @close="removeFilter(key)"
          class="mx-1 my-1"
        >
          {{ getFilterLabel(key) }}: {{ value }}
        </a-tag>
      </div>

      <playlist 
        :songs="filteredSongs" 
        :current-song="currentSong"
        @select-song="selectSong"
        class="d-none d-sm-block"
      />
    </div>

    <!-- Main content -->
    <div class="d-flex flex-column justify-content-center align-items-center w-100">
      <div class="main-header d-none d-sm-flex flex-row justify-content-between align-items-center w-100 py-4">
        <h1><span class="text-white">TMusic</span>Streaming</h1>
        <div>
          <a-button 
            type="text" 
            class="logout-btn"
            @click="handleLogout"
          >
            <template #icon>
              <i class="fa-solid fa-right-from-bracket me-1"></i>
            </template>
            <span>Đăng xuất</span>
          </a-button>
        </div>
      </div>
      <div class="main-content">
        <player 
          :current-song="currentSong"
          :is-playing="isPlaying"
          :playlist="filteredSongs"
          @toggle-play="togglePlay"
          @next-song="nextSong"
          @prev-song="prevSong"
          @update-shuffle="handleShuffleUpdate"
          @timeupdate="updateAudioTime"
        />
      </div>
    </div>
  </div>
  <FilterModal 
    v-model:open="visibleModalFilter"
    v-model:filters="filters"
    @apply-filter="applyFilter"
    @update:filters="updateFilters"
    @update:modelValue="visibleModalFilter = false"
  />
  <a-button type="text" class="toggle-sidebar-btn me-2" @click="toggleRightDrawer">
    <i :class="showRightDrawer ? 'fa-solid fa-angle-left' : 'fa-solid fa-angle-right'"></i>
  </a-button>
  <a-drawer class="lyric-drawer-right" :width="500" title="Lời bài hát" placement="right" :open="openRightDrawer" @close="onCloseRightDrawer">
    <template #extra>
      <a-button style="margin-right: 8px" @click="onCloseRightDrawer">x</a-button>
    </template>
    <LyricDisplay 
      v-if="currentLyric" 
      :lyrics="currentLyric" 
      :current-time="currentAudioTime" 
      :style="{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${currentBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }"
     />
    <p v-else>Không có lời bài hát</p>
  </a-drawer>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import Playlist from '@/components/client/Playlist.vue'
import Player from '@/components/client/Player.vue'
import FilterModal from '@/components/client/FilterModal.vue'
import LyricDisplay from '@/components/client/LyricDisplay.vue'
import { Button, Drawer, Input } from 'ant-design-vue'
import axiosInstance from '@/configs/axios'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

// Import các file assets
import cover1 from '@/assets/client/covers/cover1.jpg'
import cover2 from '@/assets/client/covers/cover2.jpg'
import cover3 from '@/assets/client/covers/cover3.jpg'
import cover4 from '@/assets/client/covers/cover4.jpg'
import cover5 from '@/assets/client/covers/cover5.jpg'
import song1 from '@/assets/client/songs/song1.mp3'
import song2 from '@/assets/client/songs/song2.mp3'
import song3 from '@/assets/client/songs/song3.mp3'
import song4 from '@/assets/client/songs/song4.mp3'
import song5 from '@/assets/client/songs/song5.mp3'
import bg1 from '@/assets/client/backgrounds/bg-song1.jpg'
import bg2 from '@/assets/client/backgrounds/bg-song2.jpg'
import bg3 from '@/assets/client/backgrounds/bg-song3.jpg'
import bg4 from '@/assets/client/backgrounds/bg-song4.jpg'
import bg5 from '@/assets/client/backgrounds/bg-song5.jpg'
import lyric1 from '@/assets/client/lyrics/lyric1.lrc'
import lyric2 from '@/assets/client/lyrics/lyric2.lrc'
import lyric3 from '@/assets/client/lyrics/lyric3.lrc'
import lyric4 from '@/assets/client/lyrics/lyric4.lrc'
import lyric5 from '@/assets/client/lyrics/lyric5.lrc'

const originalPlaylist = [
  { id: 1, title: "The World Hasn't Even Started Yet", artist: "WxS", genre: "Pop", cover: cover1, audio: song1, duration: '2:01', background: bg1, lyric: lyric1 },
  { id: 2, title: "Composing The Future", artist: "25-ji, Nightcord de", genre: "Jazz", cover: cover2, audio: song2, duration: '3:50', background: bg2, lyric: lyric2 },
  { id: 3, title: "Bad Apple!!", artist: "25-ji, Nightcord de", genre: "Pop", cover: cover3, audio: song3, duration: '3:49', background: bg3, lyric: lyric3 },
  { id: 4, title: "Starry Sky Melody/星空のメロディ", artist: "Kusanagi Nene (WxS)", genre: "Pop", cover: cover4, audio: song4, duration: '1:48', background: bg4, lyric: lyric4 },
  { id: 5, title: "Mặt Trái Của Sự Thật", artist: "HKT", genre: "Jazz", cover: cover5, audio: song5, duration: '4:32', background: bg5, lyric: lyric5 },
]

const songs = ref([...originalPlaylist])
const currentSong = ref(songs.value[0])
const isPlaying = ref(false)
const isShuffled = ref(false)
const visible = ref(false) // State điều khiển Drawer
const showMobileSearch = ref(false) // State hiển thị thanh tìm kiếm mobile
const searchQuery = ref('') // Từ khóa tìm kiếm
const router = useRouter()
const visibleModalFilter = ref(false);
const filters = ref({ songName: '', artistName: '', genre: '' });
const showRightDrawer = ref(true)
const openRightDrawer = ref(false)

const currentLyric = ref('');
const currentAudioTime = ref(0);

const applyFilter = () => {
  // Nếu không có bộ lọc nào, khôi phục danh sách gốc
  if (!hasActiveFilters.value) {
    songs.value = [...originalPlaylist];
    return;
  }

  // Áp dụng bộ lọc
  songs.value = originalPlaylist.filter(song => {
    const matchesSongName = filters.value.songName 
      ? song.title.toLowerCase().includes(filters.value.songName.toLowerCase())
      : true;
    
    const matchesArtistName = filters.value.artistName 
      ? song.artist.toLowerCase().includes(filters.value.artistName.toLowerCase())
      : true;
    
    const matchesGenre = filters.value.genre 
      ? song.genre.toLowerCase().includes(filters.value.genre.toLowerCase())
      : true;
    
    return matchesSongName && matchesArtistName && matchesGenre;
  });
};

/**************** Tags ****************/
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
  filters.value[filterKey] = '';
  applyFilter(); // Áp dụng lại bộ lọc sau khi xóa
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
  const shuffled = [...originalPlaylist]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  songs.value = shuffled
  
  // Đảm bảo bài hát hiện tại vẫn trong playlist
  if (!shuffled.some(song => song.id === currentSong.value.id)) {
    currentSong.value = shuffled[0]
  }
}

// Khôi phục playlist gốc
const restorePlaylist = () => {
  songs.value = [...originalPlaylist]
}

// Xử lý khi bật/tắt shuffle
const handleShuffleUpdate = (shuffleStatus) => {
  isShuffled.value = shuffleStatus
  if (shuffleStatus) {
    shufflePlaylist()
  } else {
    restorePlaylist()
  }
}

// Chọn bài hát
const selectSong = (song) => {
  currentSong.value = song
  isPlaying.value = true
  visible.value = false // Đóng Drawer khi chọn bài hát trên mobile
}

// Play/Pause
const togglePlay = () => {
  isPlaying.value = !isPlaying.value
}

// Bài tiếp theo
const nextSong = () => {
  const currentIndex = filteredSongs.value.findIndex(song => song.id === currentSong.value.id)
  const nextIndex = (currentIndex + 1) % filteredSongs.value.length
  currentSong.value = filteredSongs.value[nextIndex]
  isPlaying.value = true
}

// Bài trước đó
const prevSong = () => {
  const currentIndex = filteredSongs.value.findIndex(song => song.id === currentSong.value.id)
  const prevIndex = (currentIndex - 1 + filteredSongs.value.length) % filteredSongs.value.length
  currentSong.value = filteredSongs.value[prevIndex]
  isPlaying.value = true
}

// Khởi tạo
onMounted(() => {
  currentSong.value = songs.value[0]
})

// Theo dõi thay đổi shuffle
watch(isShuffled, (newVal) => {
  if (newVal) {
    shufflePlaylist()
  } else {
    restorePlaylist()
  }
})

// Theo dõi thay đổi bài hát
watch(() => currentSong.value, async (newSong) => {
  if (newSong.lyric) {
    try {
      // Giả sử lyric là một file được import
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
  } else {
    currentLyric.value = '';
  }
}, { immediate: true });

// Thêm hàm cập nhật thời gian audio
const updateAudioTime = (time) => {
  currentAudioTime.value = time;
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

// Đăng xuất 
const handleLogout = async () => {
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
  }
}
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

:where(.css-dev-only-do-not-override-1p3hq3p).ant-drawer .ant-drawer-title {
  color: var(--text-light);
}

:where(.css-dev-only-do-not-override-1p3hq3p).ant-drawer .ant-drawer-close {
  color: var(--text-light);
}
:where(.css-dev-only-do-not-override-1p3hq3p).ant-drawer .ant-drawer-content {
  background: rgba(26, 26, 46, 0.9);
}

/* Filter Tags */
.filter-tags {
  background: rgba(26, 26, 46, 0.9);
  border-radius: 8px;
  margin: 8px;
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

.ant-input-search .ant-input {
  background: transparent;
  color: var(--text-light);
}

.ant-input-search .ant-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
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
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.6) 0%, rgba(15, 52, 96, 0.6) 100%);
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

/* Button Styles */
.ant-btn {
  transition: all 0.3s ease;
}

.ant-btn:hover {
  transform: translateY(-2px);
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

  :where(.css-dev-only-do-not-override-1p3hq3p).ant-drawer .ant-drawer-content {
    width: 350px;
    margin-left: auto;
  }
}
</style>