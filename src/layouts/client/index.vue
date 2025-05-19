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
      
      <!-- Avatar mobile -->
      <a-dropdown :trigger="['click']" placement="bottomRight">
        <a-avatar 
          :size="36" 
          src="require('@/assets/img/admin-logo.png')" 
          class="cursor-pointer"
        />
        
        <template #overlay>
          <a-menu>
            <a-menu-item key="profile">
              <i class="fa-solid fa-user me-2"></i>
              Hồ sơ
            </a-menu-item>
            <a-menu-item key="settings">
              <i class="fa-solid fa-gear me-2"></i>
              Cài đặt
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item key="logout" @click="handleLogout">
              <i class="fa-solid fa-right-from-bracket me-2"></i>
              Đăng xuất
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
            @click="goToExplore"
            class="explore-drawer-btn"
          >
            <Icon icon="mdi:compass-outline" />
            <span class="explore-text">Khám phá</span>
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
      <!-- Main header cho desktop -->
      <div class="main-header d-none d-sm-flex flex-row justify-content-between align-items-center w-100 py-3 px-4">
        <h1><span class="text-white">TMusic</span>Streaming</h1>

        <a-button 
          type="text" 
          @click="goToExplore"
          class="explore-header-btn ms-4"
        >
          <Icon icon="mdi:compass-outline" class="me-2" />
          Khám phá
        </a-button>

        <a-dropdown :trigger="['click']" placement="bottomRight">
          <div class="user-avatar">
            <a-avatar 
              :size="40" 
              :src="adminLogo" 
              class="cursor-pointer"
            />
            <span class="username ms-2">{{ currentUser.username }}</span>
            <i class="fa-solid fa-chevron-down ms-2"></i>
          </div>
          
          <template #overlay>
            <a-menu>
              <a-menu-item key="profile">
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
          :is-playing="isPlaying"
          :playlist="filteredSongs.length > 0 ? filteredSongs : songs"
          @toggle-play="togglePlay"
          @next-song="nextSong"
          @prev-song="prevSong"
          @update-shuffle="handleShuffleUpdate"
          @timeupdate="updateAudioTime"
          :is-shuffled="isShuffled"
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
    <i class="fa-solid fa-angle-left"></i>
  </a-button>
  <a-drawer 
    class="lyric-drawer-right" 
    :width="500" 
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
        width: '70%',
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
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import Playlist from '@/components/client/Playlist.vue'
import Player from '@/components/client/Player.vue'
import FilterModal from '@/components/client/FilterModal.vue'
import LyricWithComments from '@/components/client/LyricWithComments.vue'
import { Button, Drawer, Input } from 'ant-design-vue'
import { Icon } from '@iconify/vue'
import axiosInstance from '@/configs/axios'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getSongs } from '@/services/songService'
import { useProfileStore } from '@/stores/useProfile.js'

import adminLogo from '@/assets/img/admin-logo.png';

// Import các file assets
// import cover1 from '@/assets/client/covers/cover1.jpg'
// import cover2 from '@/assets/client/covers/cover2.jpg'
// import cover3 from '@/assets/client/covers/cover3.jpg'
// import cover4 from '@/assets/client/covers/cover4.jpg'
// import cover5 from '@/assets/client/covers/cover5.jpg'
// import cover6 from '@/assets/client/covers/cover6.jpg'
// import cover7 from '@/assets/client/covers/cover7.jpg'
// import cover8 from '@/assets/client/covers/cover8.jpg'
// import cover9 from '@/assets/client/covers/cover9.jpg'
// import cover10 from '@/assets/client/covers/cover10.jpg'
// import cover11 from '@/assets/client/covers/cover11.jpg'
// import cover12 from '@/assets/client/covers/cover12.jpg'
// import song1 from '@/assets/client/songs/song1.mp3'
// import song2 from '@/assets/client/songs/song2.mp3'
// import song3 from '@/assets/client/songs/song3.mp3'
// import song4 from '@/assets/client/songs/song4.mp3'
// import song5 from '@/assets/client/songs/song5.mp3'
// import song6 from '@/assets/client/songs/song6.mp3'
// import song7 from '@/assets/client/songs/song7.mp3'
// import song8 from '@/assets/client/songs/song8.mp3'
// import song9 from '@/assets/client/songs/song9.mp3'
// import song10 from '@/assets/client/songs/song10.mp3'
// import song11 from '@/assets/client/songs/song11.mp3'
// import song12 from '@/assets/client/songs/song12.mp3'
// import bg1 from '@/assets/client/backgrounds/bg-song1.jpg'
// import bg2 from '@/assets/client/backgrounds/bg-song2.jpg'
// import bg3 from '@/assets/client/backgrounds/bg-song3.jpg'
// import bg4 from '@/assets/client/backgrounds/bg-song4.jpg'
// import bg5 from '@/assets/client/backgrounds/bg-song5.jpg'
// import bg6 from '@/assets/client/backgrounds/bg-song6.jpg'
// import bg7 from '@/assets/client/backgrounds/bg-song7.jpg'
// import bg8 from '@/assets/client/backgrounds/bg-song8.jpg'
// import bg9 from '@/assets/client/backgrounds/bg-song9.jpg'
// import bg10 from '@/assets/client/backgrounds/bg-song10.jpg'
// import bg11 from '@/assets/client/backgrounds/bg-song11.jpg'
// import bg12 from '@/assets/client/backgrounds/bg-song12.jpg'
// import lyric1 from '@/assets/client/lyrics/lyric1.lrc'
// import lyric2 from '@/assets/client/lyrics/lyric2.lrc'
// import lyric3 from '@/assets/client/lyrics/lyric3.lrc'
// import lyric4 from '@/assets/client/lyrics/lyric4.lrc'
// import lyric5 from '@/assets/client/lyrics/lyric5.lrc'
// import lyric6 from '@/assets/client/lyrics/lyric6.lrc'
// import lyric7 from '@/assets/client/lyrics/lyric7.lrc'
// import lyric8 from '@/assets/client/lyrics/lyric8.lrc'
// import lyric9 from '@/assets/client/lyrics/lyric9.lrc'
// import lyric10 from '@/assets/client/lyrics/lyric10.lrc'
// import lyric11 from '@/assets/client/lyrics/lyric11.lrc'
// import lyric12 from '@/assets/client/lyrics/lyric12.lrc'

// const originalPlaylist = [
//   { id: 1, title: "The World Hasn't Even Started Yet", artist: "WxS", genre: "Pop", cover: cover1, audio: song1, duration: '2:01', background: bg1, lyric: lyric1 },
//   { id: 2, title: "Composing The Future", artist: "25-ji, Nightcord de", genre: "Jazz", cover: cover2, audio: song2, duration: '3:50', background: bg2, lyric: lyric2 },
//   { id: 3, title: "Bad Apple!!", artist: "25-ji, Nightcord de", genre: "Pop", cover: cover3, audio: song3, duration: '3:49', background: bg3, lyric: lyric3 },
//   { id: 4, title: "Starry Sky Melody/星空のメロディ", artist: "Kusanagi Nene (WxS)", genre: "Pop", cover: cover4, audio: song4, duration: '1:48', background: bg4, lyric: lyric4 },
//   { id: 5, title: "Mặt Trái Của Sự Thật", artist: "HKT", genre: "Jazz", cover: cover5, audio: song5, duration: '4:32', background: bg5, lyric: lyric5 },
//   { id: 6, title: "Senbonzakura", artist: "Hatsune Miku", genre: "Pop", cover: cover6, audio: song6, duration: '4:04', background: bg6, lyric: lyric6 },
//   { id: 7, title: "Em Của Ngày Hôm Qua", artist: "Sơn Tùng M-TP", genre: "Pop", cover: cover7, audio: song7, duration: '3:52', background: bg7, lyric: lyric7 },
//   { id: 8, title: "Blue Bird", artist: "Ikimonogakari", genre: "Pop", cover: cover8, audio: song8, duration: '3:32', background: bg8, lyric: lyric8 },
//   { id: 9, title: "Sakayume (Jujutsu Kaisen 0)", artist: "King Gnu", genre: "Pop", cover: cover9, audio: song9, duration: '5:07', background: bg9, lyric: lyric9 },
//   { id: 10, title: "Hazy Moon", artist: "Hatsune Miku", genre: "Pop", cover: cover10, audio: song10, duration: '4:15', background: bg10, lyric: lyric10 },
//   { id: 11, title: "Yoru Ni Kakeru / 夜に駆ける", artist: "YOASOBI", genre: "Pop", cover: cover11, audio: song11, duration: '4:18', background: bg11, lyric: lyric11 },
//   { id: 122, title: "Yume Wo Kanaete Doraemon", artist: "MAO", genre: "Pop", cover: cover12, audio: song12, duration: '4:01', background: bg12, lyric: lyric12 },
// ]

const originalPlaylist = ref([]);

const getSongsFromServer = async () => {
  try {
    const response = await getSongs();
    originalPlaylist.value = response.data.data.map(song => ({
      ...song,
      isFavorite: false
    }));
    songs.value = [...originalPlaylist.value];
    currentSong.value = songs.value[0];
    // Thêm console.log để debug nếu cần
    console.log('Songs loaded:', songs.value);
  } catch (error) {
    console.error('Error loading songs:', error);
    message.error('Không thể tải danh sách bài hát');
  }
}
getSongsFromServer();

const songs = ref([...originalPlaylist.value])
const currentUser = ref({})
const currentSong = ref(songs.value[0])
const isPlaying = ref(false)
const isShuffled = ref(false)
const visible = ref(false)
const showMobileSearch = ref(false) 
const searchQuery = ref('')
const router = useRouter()
const visibleModalFilter = ref(false);
const filters = ref({ songName: '', artistName: '', genre: '' });
const showRightDrawer = ref(true)
const openRightDrawer = ref(false)

const currentLyric = ref('');
const currentAudioTime = ref(0);

const karaokeMode = ref(false);

currentUser.value = useProfileStore().getProfile();

const handleKaraokeToggle = (checked) => {
  // console.log('Karaoke mode:', checked);
  karaokeMode.value = checked;
  // Tùy nhu cầu, có thể emit ra ngoài hoặc truyền cho LyricDisplay
};

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

const playerRef = ref(null);

const handleSeek = (time) => {
  if (playerRef.value) {
    playerRef.value.seekTo(time);
  }
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

// onMounted(() => {
//   currentUser.value = JSON.parse(localStorage.getItem('user'))
// })

// Theo dõi thay đổi shuffle
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

//Sang trang Khám phá
const goToExplore = async () => {
  const loading = message.loading('Đang chuyển trang...', 0);
  await router.push({ name: 'explore' }).then(() => {
    window.location.reload();
  });
  loading();
  visible.value = false;
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