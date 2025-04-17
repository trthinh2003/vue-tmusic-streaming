<template>
  <div class="music-app d-flex flex-column flex-sm-row">
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
      <div class="main-content">
        <player 
          :current-song="currentSong"
          :is-playing="isPlaying"
          :playlist="filteredSongs"
          @toggle-play="togglePlay"
          @next-song="nextSong"
          @prev-song="prevSong"
          @update-shuffle="handleShuffleUpdate"
        />
      </div>
    </div>
  </div>
  <div class="filter-container">
    <a-modal v-model:open="visibleModalFilter" title="Bộ lọc bài hát" class="dark-modal" @ok="applyFilter">
      <a-form layout="vertical">
        <a-form-item label="Tên bài hát">
          <a-input v-model:value="filters.songName" placeholder="Nhập tên bài hát" />
        </a-form-item>
        <a-form-item label="Tên nghệ sĩ">
          <a-input v-model:value="filters.artistName" placeholder="Nhập tên nghệ sĩ" />
        </a-form-item>
        <a-form-item label="Thể loại">
          <a-select v-model:value="filters.genre" placeholder="Chọn thể loại" allowClear>
            <a-select-option value="pop">Pop</a-select-option>
            <a-select-option value="rock">Rock</a-select-option>
            <a-select-option value="jazz">Jazz</a-select-option>
            <a-select-option value="hiphop">Hip Hop</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button class="close-button" @click="visible = false">Đóng</a-button>
        <a-button type="primary" class="apply-button" @click="applyFilter">Áp dụng</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import Playlist from '@/components/client/Playlist.vue'
import Player from '@/components/client/Player.vue'
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

const originalPlaylist = [
  { id: 1, title: "Bài hát 1", artist: "Nghệ sĩ A", cover: cover1, audio: song1, duration: '2:01' },
  { id: 2, title: "Bài hát 2", artist: "Nghệ sĩ B", cover: cover2, audio: song2, duration: '3:50' },
  { id: 3, title: "Bài hát 3", artist: "Nghệ sĩ C", cover: cover3, audio: song3, duration: '3:49' },
  { id: 4, title: "Bài hát 4", artist: "Nghệ sĩ D", cover: cover4, audio: song4, duration: '1:48' },
  { id: 5, title: "Bài hát 5", artist: "Nghệ sĩ E", cover: cover5, audio: song5, duration: '4:32' }
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

const applyFilter = () => {
  console.log('Áp dụng bộ lọc:', filters.value);
  visibleModalFilter.value = false;
};

// Lọc bài hát theo từ khóa
const filteredSongs = computed(() => {
  if (!searchQuery.value) return songs.value
  const query = searchQuery.value.toLowerCase()
  return songs.value.filter(song => 
    song.title.toLowerCase().includes(query) || 
    song.artist.toLowerCase().includes(query)
  )
})

const showDrawer = () => {
  visible.value = true
}

// Xử lý tìm kiếm
const handleSearch = () => {
  // Đã được xử lý tự động thông qua computed filteredSongs
  if (showMobileSearch.value) {
    showMobileSearch.value = false // Đóng thanh tìm kiếm mobile sau khi search
  }
}

// Xáo trộn playlist
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
  --primary-color: #4361ee;       /* Màu chủ đạo - xanh dương */
  --secondary-color: #3a0ca3;    /* Màu phụ - tím đậm */
  --accent-color: #4cc9f0;       /* Màu nhấn - xanh sáng */
  --dark-bg: #1a1a2e;           /* Nền tối */
  --light-bg: #f8f9fa;          /* Nền sáng */
  --text-light: #f8f9fa;        /* Chữ trên nền tối */
  --text-dark: #212529;         /* Chữ trên nền sáng */
  --card-bg: #16213e;           /* Nền card */
  --hover-effect: rgba(255, 255, 255, 0.1); /* Hiệu ứng hover */
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
  background: rgba(26, 26, 46, 0.8);
}

/* Sidebar Styles */
.sidebar {
  width: 300px;
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

/* Filter Modal */
.filter-container {
  display: flex;
  justify-content: center;
  padding: 10px;
}

.filter-button {
  background-color: #1f1f1f;
  border: none;
  color: #fff;
  transition: background 0.3s;
}

.filter-button:hover {
  background-color: #333;
}

.dark-modal :deep(.ant-modal-content) {
  background: #1e1e1e;
  color: white;
}

.dark-modal :deep(.ant-modal-header) {
  background: #252525;
  border-bottom: 1px solid #444;
  color: white;
}

.dark-modal :deep(.ant-modal-footer) {
  background: #252525;
  border-top: 1px solid #444;
}

.close-button {
  background: #444;
  border: none;
  color: white;
}

.close-button:hover {
  background: #666;
}

.apply-button {
  background: #007bff;
  border: none;
  color: white;
}

.apply-button:hover {
  background: #0056b3;
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

/* Responsive Adjustments */
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
    color: var(--primary-color);
  }

  .ant-input-search-button {
    background: white;
    border-color: var(--primary-color);
    color: white;
  }
}
</style>