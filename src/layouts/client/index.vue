<template>
  <div class="music-app">
    <div class="sidebar">
      <h1>Music Player</h1>
      <playlist 
        :songs="songs" 
        :current-song="currentSong"
        @select-song="selectSong"
      />
    </div>
    <div class="main-content">
      <player 
        :current-song="currentSong"
        :is-playing="isPlaying"
        :playlist="songs"
        @toggle-play="togglePlay"
        @next-song="nextSong"
        @prev-song="prevSong"
        @update-shuffle="handleShuffleUpdate"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Playlist from '@/components/client/Playlist.vue'
import Player from '@/components/client/Player.vue'

// Import các file assets
import cover1 from '@/assets/client/covers/cover1.jpg'
import cover2 from '@/assets/client/covers/cover2.jpg'
import cover3 from '@/assets/client/covers/cover3.jpg'
import song1 from '@/assets/client/songs/song1.mp3'
import song2 from '@/assets/client/songs/song2.mp3'
import song3 from '@/assets/client/songs/song3.mp3'

const originalPlaylist = [
  {
    id: 1,
    title: "Bài hát 1",
    artist: "Nghệ sĩ A",
    cover: cover1,
    audio: song1,
    duration: '3:45'
  },
  {
    id: 2,
    title: "Bài hát 2",
    artist: "Nghệ sĩ B",
    cover: cover2,
    audio: song2,
    duration: '4:20'
  },
  {
    id: 3,
    title: "Bài hát 3",
    artist: "Nghệ sĩ C",
    cover: cover3,
    audio: song3,
    duration: '3:15'
  }
]

const songs = ref([...originalPlaylist])
const currentSong = ref(songs.value[0])
const isPlaying = ref(false)
const isShuffled = ref(false)

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
}

// Play/Pause
const togglePlay = () => {
  isPlaying.value = !isPlaying.value
}

// Bài tiếp theo
const nextSong = () => {
  const currentIndex = songs.value.findIndex(song => song.id === currentSong.value.id)
  const nextIndex = (currentIndex + 1) % songs.value.length
  currentSong.value = songs.value[nextIndex]
  isPlaying.value = true
}

// Bài trước đó
const prevSong = () => {
  const currentIndex = songs.value.findIndex(song => song.id === currentSong.value.id)
  const prevIndex = (currentIndex - 1 + songs.value.length) % songs.value.length
  currentSong.value = songs.value[prevIndex]
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
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
}

.music-app {
  display: flex;
  height: 100%;
}

.sidebar {
  width: 300px;
  background: #2c3e50;
  color: white;
  padding: 20px;
  overflow-y: auto;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}
</style>