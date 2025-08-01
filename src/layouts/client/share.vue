<template>
  <div class="shared-song-view">
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="loading-content">
        <a-spin size="large" />
        <p class="loading-text">Đang tải bài hát...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <div class="error-icon">
          <ExclamationCircleOutlined />
        </div>
        <h2>{{ error.title }}</h2>
        <p>{{ error.message }}</p>
        <a-button type="primary" @click="$router.push('/')" class="home-btn">
          Về trang chủ
        </a-button>
      </div>
    </div>

    <!-- Success state -->
    <div v-else-if="song" class="share-song-container" :style="{ backgroundImage: `url(${song.background})` }">
      <div class="overlay"></div>
      
      <!-- Lyrics Button -->
      <div class="lyrics-btn" @click="showLyricsDrawer = true" v-if="song.lyric">
        <LeftOutlined />
        <!-- <span class="lyrics-btn-text">Lời bài hát</span> -->
      </div>
      
      <div class="share-song-content">
        <div class="song-info">
          <div class="album-cover-wrapper">
            <img :src="song.cover" alt="Album cover" class="album-cover">
            <div class="cover-overlay"></div>
          </div>
          <h2 class="song-title">{{ song.title }}</h2>
          <p class="song-artist">{{ song.artist }}</p>
          
          <div v-if="shareInfo" class="share-expiry">
            <a-alert 
              v-if="shareInfo.remainingMinutes > 0"
              :message="`Link hết hạn sau ${shareInfo.remainingMinutes} phút`"
              type="info"
              show-icon
              class="expiry-alert"
            />
            <a-alert 
              v-else
              message="Link đã hết hạn"
              type="error"
              show-icon
              class="expiry-alert"
            />
            <p class="expiry-detail">
              <span class="detail-label">Tạo lúc:</span> {{ formatDate(shareInfo.createdAt) }}<br>
              <span class="detail-label">Hết hạn:</span> {{ formatDate(shareInfo.expiresAt) }}
            </p>
          </div>
        </div>
        
        <div class="player-container" v-if="shareInfo?.remainingMinutes > 0">
          <audio
            ref="audioPlayer"
            :src="song.audio"
            controls
            class="audio-player"
            @loadstart="onAudioLoad"
            @error="onAudioError"
            @timeupdate="onTimeUpdate"
            @play="onPlay"
            @pause="onPause"
          ></audio>
        </div>
        
        <div class="auth-section">
          <a-button
            v-if="!isAuthenticated"
            type="primary"
            @click="goToLogin"
            class="login-btn"
            size="large"
          >
            <template #icon><LoginOutlined /></template>
            Đăng nhập để trải nghiệm đầy đủ
          </a-button>
          <div v-else class="user-info">
            <a-avatar :src="user.avatar" size="small" />
            <span class="username">{{ user.username }}</span>
            <a-button type="link" @click="goToHome" class="home-link">
              <HomeOutlined /> Về trang chủ
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Lyrics Drawer -->
    <a-drawer
      v-model:open="showLyricsDrawer"
      title="Lời bài hát"
      placement="right"
      width="400"
      :closable="true"
      :mask="false"
      class="lyrics-drawer"
      :headerStyle="{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px 24px',
        borderRadius: '0'
      }"
      :bodyStyle="{
        overflow: 'hidden',
        padding: '0',
        background: 'transparent'
      }"
    >
      <template #title>
        <div class="drawer-header">
          <div class="drawer-title-content">
            <div class="music-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <span class="drawer-title-text">Lời bài hát</span>
          </div>
          <div class="song-mini-info">
            <div class="mini-cover">
              <img :src="song?.cover" alt="Cover" />
            </div>
            <div class="mini-details">
              <p class="mini-title">{{ song?.title }}</p>
              <p class="mini-artist">{{ song?.artist }}</p>
            </div>
          </div>
        </div>
      </template>
      
      <div class="lyrics-container">
        <div class="lyrics-background"></div>
        <div class="lyrics-content">
          <LyricDisplay 
            v-if="lyricsContent && song"
            :lyrics="lyricsContent"
            :currentTime="currentTime"
            :theme="''"
            :karaokeMode="false"
            @seek="seekTo"
            @toggle-play="togglePlayPause"
          />
          <div v-else class="no-lyrics">
            <div class="no-lyrics-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <p>Không có lời bài hát</p>
            <p class="no-lyrics-subtitle">Hãy thưởng thức giai điệu!</p>
          </div>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ExclamationCircleOutlined, LoginOutlined, HomeOutlined, LeftOutlined } from '@ant-design/icons-vue'
import axiosInstance from '@/configs/axios'
import { getSharedSong } from '@/services/songService'
import LyricDisplay from '@/components/client/lyrics/LyricDisplay.vue'
import { usePlayerStore } from '@/stores/playerStore'

const route = useRoute()
const router = useRouter()

const song = ref(null)
const shareInfo = ref(null)
const audioPlayer = ref(null)
const isAuthenticated = ref(false)
const user = ref({})
const showLyricsDrawer = ref(false)
const lyricsContent = ref('')
const currentTime = ref(0)
const isPlaying = computed({
  get: () => playerStore.isPlaying,
  set: (value) => playerStore.setPlayingState(value)
})

const loading = ref(true)
const error = ref(null)

const playerStore = usePlayerStore()

onMounted(async () => {
  const shareToken = route.params.shareToken
  
  if (!shareToken) {
    error.value = {
      title: 'Link không hợp lệ',
      message: 'Không tìm thấy mã chia sẻ trong URL.'
    }
    loading.value = false
    return
  }
  
  await fetchSharedSong(shareToken)
  await checkAuthStatus()
})

const fetchSharedSong = async (shareToken) => {
  try {
    loading.value = true
    error.value = null
    
    const response = await getSharedSong(shareToken)
    console.log('Fetched shared song:', response.data)
    
    if (response.data.song) {
      song.value = response.data.song
      shareInfo.value = response.data.shareInfo
      
      if (song.value.lyric) {
        await fetchLyrics(song.value.lyric)
      }
      
      if (shareInfo.value?.remainingMinutes <= 0) {
        error.value = {
          title: 'Link đã hết hạn',
          message: 'Link chia sẻ đã hết thời gian hiệu lực. Vui lòng yêu cầu link mới.'
        }
      }
    }
  } catch (err) {
    console.error('Error fetching shared song:', err)
    
    if (err.response?.status === 400 && err.response?.data?.expired) {
      error.value = {
        title: 'Link đã hết hạn',
        message: 'Link chia sẻ đã hết thời gian hiệu lực. Vui lòng yêu cầu link mới.'
      }
    } else if (err.response?.status === 404) {
      error.value = {
        title: 'Không tìm thấy bài hát',
        message: 'Bài hát không tồn tại hoặc đã bị xóa.'
      }
    } else {
      error.value = {
        title: 'Lỗi tải bài hát',
        message: 'Có lỗi xảy ra khi tải bài hát. Vui lòng thử lại sau.'
      }
    }
    
    message.error(error.value.message)
  } finally {
    loading.value = false
  }
}

const fetchLyrics = async (lyricUrl) => {
  try {
    const response = await fetch(lyricUrl)
    if (response.ok) {
      lyricsContent.value = await response.text()
    }
  } catch (err) {
    console.error('Error fetching lyrics:', err)
  }
}

const checkAuthStatus = async () => {
  try {
    const response = await axiosInstance.get('/auth/check')
    isAuthenticated.value = response.data.authenticated
    if (isAuthenticated.value) {
      user.value = response.data.user
    }
  } catch (error) {
    // console.error('Auth check error:', error)
    isAuthenticated.value = false
  }
}

const goToLogin = () => {
  router.push({ name: 'login' })
}

const goToHome = () => {
  router.push('/')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('vi-VN')
}

const onAudioLoad = () => {
  console.log('Audio loading...')
}

const onAudioError = (e) => {
  console.error('Audio error:', e)
  message.error('Không thể phát nhạc')
}

const onTimeUpdate = () => {
  if (audioPlayer.value) {
    currentTime.value = audioPlayer.value.currentTime
  }
}

const onPlay = () => {
  playerStore.setPlayingState(true)
}

const onPause = () => {
  playerStore.setPlayingState(false)
}

const seekTo = (time) => {
  if (audioPlayer.value) {
    audioPlayer.value.currentTime = time
  }
}

const togglePlayPause = () => {
  if (audioPlayer.value) {
    if (playerStore.isPlaying) {
      audioPlayer.value.pause()
    } else {
      audioPlayer.value.play()
    }
  }
}

watch(() => playerStore.isPlaying, (newIsPlaying) => {
  if (audioPlayer.value) {
    if (newIsPlaying && audioPlayer.value.paused) {
      audioPlayer.value.play()
    } else if (!newIsPlaying && !audioPlayer.value.paused) {
      audioPlayer.value.pause()
    }
  }
})

onUnmounted(() => {
  if (audioPlayer.value) {
    audioPlayer.value.removeEventListener('timeupdate', onTimeUpdate)
    audioPlayer.value.removeEventListener('play', onPlay)
    audioPlayer.value.removeEventListener('pause', onPause)
  }
})
</script>

<style scoped>
.shared-song-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.loading-content {
  text-align: center;
  color: white;
  padding: 40px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.loading-text {
  margin-top: 16px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.error-content {
  text-align: center;
  background: rgba(26, 26, 46, 0.9);
  border-radius: 16px;
  padding: 40px;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.error-icon {
  font-size: 48px;
  color: #ff4d4f;
  margin-bottom: 20px;
}

.error-content h2 {
  color: #ff4d4f;
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: 600;
}

.error-content p {
  margin-bottom: 24px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.home-btn {
  margin-top: 10px;
  height: 40px;
  font-weight: 500;
  padding: 0 24px;
}

.share-song-container {
  position: relative;
  height: 100vh;
  width: 100vw;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(1, 1, 2, 0.9) 100%);
  z-index: 0;
}

.lyrics-btn {
  position: fixed;
  top: 50%;
  right: 20px;
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
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  /* padding: 0 15px; */
}

.lyrics-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
}

.lyrics-btn-text {
  font-size: 14px;
  white-space: nowrap;
}

.share-song-content {
  position: relative;
  z-index: 1;
  width: 90%;
  max-width: 500px;
  background: rgba(26, 26, 46, 0.8);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.song-info {
  margin-bottom: 30px;
}

.album-cover-wrapper {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 25px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.album-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.song-title {
  color: white;
  font-size: 24px;
  margin-bottom: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.song-artist {
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  margin-bottom: 25px;
  font-weight: 400;
}

.share-expiry {
  margin-top: 25px;
}

.expiry-alert {
  border-radius: 8px;
  text-align: left;
}

.expiry-detail {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 12px;
  line-height: 1.6;
}

.detail-label {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.player-container {
  margin: 30px 0;
}

.audio-player {
  width: 100%;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
}

.audio-player::-webkit-media-controls-panel {
  background: rgba(26, 26, 46, 0.8);
}

.auth-section {
  margin-top: 30px;
}

.login-btn {
  width: 100%;
  height: 45px;
  font-weight: 500;
  border-radius: 8px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  gap: 10px;
  flex-wrap: wrap;
}

.username {
  font-weight: 500;
}

.home-link {
  color: rgba(255, 255, 255, 0.7);
  margin-left: auto;
}

.home-link:hover {
  color: #1890ff;
}

/* Enhanced Drawer Styles */
.lyrics-drawer {
  z-index: 1001;
}

.lyrics-drawer :deep(.ant-drawer-content) {
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.lyrics-drawer :deep(.ant-drawer-header) {
  background: linear-gradient(135deg, rgba(15, 15, 35, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(102, 126, 234, 0.3);
  padding: 0;
}

.lyrics-drawer :deep(.ant-drawer-close) {
  color: #fff;
  font-size: 18px;
  opacity: 0.8;
  transition: all 0.3s ease;
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.lyrics-drawer :deep(.ant-drawer-close):hover {
  color: #667eea;
  opacity: 1;
  background: rgba(102, 126, 234, 0.2);
  transform: scale(1.1);
}

.drawer-header {
  padding: 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.drawer-title-content {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.music-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.drawer-title-text {
  color: white;
  font-size: 18px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.song-mini-info {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.mini-cover {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.mini-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mini-details {
  flex: 1;
  text-align: left;
}

.mini-title {
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.mini-artist {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin: 0;
  line-height: 1.2;
}

.lyrics-container {
  position: relative;
  height: 100%;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.97);
}

.lyrics-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(118, 75, 162, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(64, 123, 255, 0.05) 0%, transparent 50%);
  z-index: 0;
}

.lyrics-content {
  position: relative;
  z-index: 1;
  height: 100%;
}

.no-lyrics {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.no-lyrics-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.no-lyrics p {
  font-size: 16px;
  margin: 0 0 8px 0;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.no-lyrics-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5) !important;
  font-style: italic;
}

@media (max-width: 576px) {
  .share-song-content {
    padding: 25px;
    width: 95%;
  }
  
  .album-cover-wrapper {
    width: 160px;
    height: 160px;
  }
  
  .song-title {
    font-size: 20px;
  }
  
  .song-artist {
    font-size: 16px;
  }
  
  .lyrics-btn {
    width: 45px;
    height: 45px;
    font-size: 14px;
    top: 40%;
    right: 15px;
  }
  
  .lyrics-btn-text {
    display: none;
  }
  
  .lyrics-drawer {
    width: 100% !important;
  }
  
  .drawer-header {
    padding: 15px;
  }
  
  .song-mini-info {
    padding: 10px;
  }
  
  .mini-cover {
    width: 35px;
    height: 35px;
  }
  
  .mini-title {
    font-size: 13px;
  }
  
  .mini-artist {
    font-size: 11px;
  }
}
</style>