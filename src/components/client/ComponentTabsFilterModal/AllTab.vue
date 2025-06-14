<template>
  <div class="all-tab-container">
    <!-- Section Bài hát gợi ý -->
    <div class="music-section">
      <div class="section-header">
        <h3 class="section-title">🎵 Bài hát gợi ý cho bạn</h3>
        <a-button type="text" class="view-all-btn">Xem tất cả</a-button>
      </div>
      <div class="horizontal-scroll">
        <div class="song-cards">
          <div 
            class="song-card" 
            v-for="(song, index) in suggestedSongs" 
            :key="'suggested-' + index"
            @click="$emit('play-song', song)"
            :class="{ 'active-card': currentSong?.id === song.id }"
          >
            <div class="card-cover">
              <img :src="song.cover" :alt="song.title" />
              <div class="card-play-overlay">
                <play-circle-filled v-if="currentSong?.id !== song.id || !isPlaying" />
                <pause-circle-filled v-else />
              </div>
            </div>
            <div class="card-info">
              <h4 class="card-title">{{ song.title }}</h4>
              <p class="card-artist">{{ song.artist }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Phổ biến -->
    <div class="music-section">
      <div class="section-header">
        <h3 class="section-title">🔥 Đang thịnh hành</h3>
        <a-button type="text" class="view-all-btn">Xem tất cả</a-button>
      </div>
      <div class="trending-list">
        <div 
          class="trending-item" 
          v-for="(song, index) in trendingSongs" 
          :key="'trending-' + index"
          @click="$emit('play-song', song)"
          :class="{ 'active-trending': currentSong?.id === song.id }"
        >
          <div class="trending-rank">{{ index + 1 }}</div>
          <div class="trending-cover">
            <img :src="song.cover" :alt="song.title" />
            <div class="trending-play-icon">
              <play-circle-filled v-if="currentSong?.id !== song.id || !isPlaying" />
              <pause-circle-filled v-else />
            </div>
          </div>
          <div class="trending-info">
            <h4 class="trending-title">{{ song.title }}</h4>
            <p class="trending-artist">{{ song.artist }}</p>
            <div class="trending-stats">
              <span class="play-count">{{ formatPlayCount(song.playCount) }} lượt phát</span>
            </div>
          </div>
          <div class="trending-actions">
            <SongActionDropdown 
              :song="song" 
              @action="$emit('song-action', $event)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Section Mới phát hành -->
    <div class="music-section">
      <div class="section-header">
        <h3 class="section-title">✨ Mới phát hành</h3>
        <a-button type="text" class="view-all-btn">Xem tất cả</a-button>
      </div>
      <div class="horizontal-scroll">
        <div class="song-cards">
          <div 
            class="song-card new-release" 
            v-for="(song, index) in newReleases" 
            :key="'new-' + index"
            @click="$emit('play-song', song)"
            :class="{ 'active-card': currentSong?.id === song.id }"
          >
            <div class="card-cover">
              <img :src="song.cover" :alt="song.title" />
              <div class="new-badge">MỚI</div>
              <div class="card-play-overlay">
                <play-circle-filled v-if="currentSong?.id !== song.id || !isPlaying" />
                <pause-circle-filled v-else />
              </div>
            </div>
            <div class="card-info">
              <h4 class="card-title">{{ song.title }}</h4>
              <p class="card-artist">{{ song.artist }}</p>
              <span class="release-date">{{ formatReleaseDate(song.releaseDate) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Nghệ sĩ yêu thích -->
    <div class="music-section">
      <div class="section-header">
        <h3 class="section-title">⭐ Nghệ sĩ bạn có thể thích</h3>
        <a-button type="text" class="view-all-btn">Xem tất cả</a-button>
      </div>
      <div class="horizontal-scroll">
        <div class="artist-cards">
          <div 
            class="artist-card" 
            v-for="(artist, index) in suggestedArtists" 
            :key="'artist-' + index"
            @click="$emit('view-artist', artist)"
          >
            <div class="artist-avatar">
              <img :src="artist.avatar" :alt="artist.name" />
              <div class="artist-play-overlay">
                <play-circle-filled />
              </div>
            </div>
            <div class="artist-info">
              <h4 class="artist-name">{{ artist.name }}</h4>
              <p class="artist-followers">{{ formatFollowers(artist.followers) }} người theo dõi</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Playlist gợi ý -->
    <div class="music-section">
      <div class="section-header">
        <h3 class="section-title">🎧 Playlist dành cho bạn</h3>
        <a-button type="text" class="view-all-btn">Xem tất cả</a-button>
      </div>
      <div class="horizontal-scroll">
        <div class="playlist-cards">
          <div 
            class="playlist-card" 
            v-for="(playlist, index) in suggestedPlaylists" 
            :key="'playlist-' + index"
            @click="$emit('view-playlist', playlist)"
          >
            <div class="playlist-cover">
              <img :src="playlist.cover" :alt="playlist.name" />
              <div class="playlist-play-overlay">
                <play-circle-filled />
              </div>
            </div>
            <div class="playlist-info">
              <h4 class="playlist-name">{{ playlist.name }}</h4>
              <p class="playlist-description">{{ playlist.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PlayCircleFilled, PauseCircleFilled } from '@ant-design/icons-vue'
import SongActionDropdown from '@/components/client/SongActionDropdown.vue';

// Props
const props = defineProps({
  currentSong: Object,
  isPlaying: Boolean,
  // Dữ liệu mẫu - sau này sẽ được thay thế bằng dữ liệu thật
  suggestedSongs: {
    type: Array,
    default: () => [
      { id: 1, title: 'Chúng Ta Của Hiện Tại', artist: 'Sơn Tùng M-TP', cover: 'https://via.placeholder.com/150', playCount: 1200000 },
      { id: 2, title: 'Em Không Sai Chúng Ta Sai', artist: 'Erik', cover: 'https://via.placeholder.com/150', playCount: 980000 },
      { id: 3, title: 'Hoa Hải Đường', artist: 'Jack', cover: 'https://via.placeholder.com/150', playCount: 1500000 },
      { id: 4, title: 'Muộn Rồi Mà Sao Còn', artist: 'Sơn Tùng M-TP', cover: 'https://via.placeholder.com/150', playCount: 800000 },
      { id: 5, title: 'Yêu Đơn Phương', artist: 'Dương Edward', cover: 'https://via.placeholder.com/150', playCount: 600000 }
    ]
  },
  trendingSongs: {
    type: Array,
    default: () => [
      { id: 6, title: 'There\'s No One At All', artist: 'Sơn Tùng M-TP', cover: 'https://via.placeholder.com/150', playCount: 2100000 },
      { id: 7, title: 'Chạy Về Khóc Với Anh', artist: 'ERIK x Suni Hạ Linh', cover: 'https://via.placeholder.com/150', playCount: 1800000 },
      { id: 8, title: 'Đom Đóm', artist: 'Jack - J97', cover: 'https://via.placeholder.com/150', playCount: 1700000 },
      { id: 9, title: 'Hãy Trao Cho Anh', artist: 'Sơn Tùng M-TP', cover: 'https://via.placeholder.com/150', playCount: 1600000 },
      { id: 10, title: 'Anh Đã Quen Với Cô Đơn', artist: 'Soobin Hoàng Sơn', cover: 'https://via.placeholder.com/150', playCount: 1400000 }
    ]
  },
  newReleases: {
    type: Array,
    default: () => [
      { id: 11, title: 'Tháng Tư Là Lời Nói Dối Của Em', artist: 'Hà Anh Tuấn', cover: 'https://via.placeholder.com/150', releaseDate: '2024-01-15' },
      { id: 12, title: 'Người Lạ Ơi', artist: 'Superbrothers x Karik x Orange', cover: 'https://via.placeholder.com/150', releaseDate: '2024-01-12' },
      { id: 13, title: '3107-3', artist: 'W/n x Duongg x Nâu', cover: 'https://via.placeholder.com/150', releaseDate: '2024-01-10' }
    ]
  },
  suggestedArtists: {
    type: Array,
    default: () => [
      { id: 1, name: 'Sơn Tùng M-TP', avatar: 'https://via.placeholder.com/150', followers: 5200000 },
      { id: 2, name: 'Jack - J97', avatar: 'https://via.placeholder.com/150', followers: 4800000 },
      { id: 3, name: 'ERIK', avatar: 'https://via.placeholder.com/150', followers: 2100000 },
      { id: 4, name: 'Hương Ly', avatar: 'https://via.placeholder.com/150', followers: 1800000 }
    ]
  },
  suggestedPlaylists: {
    type: Array,
    default: () => [
      { id: 1, name: 'Top Hits Việt Nam', description: 'Những bài hát hot nhất hiện tại', cover: 'https://via.placeholder.com/150' },
      { id: 2, name: 'Ballad Buồn', description: 'Những ca khúc ballad da diết', cover: 'https://via.placeholder.com/150' },
      { id: 3, name: 'Chill Lofi', description: 'Thư giãn cùng lofi', cover: 'https://via.placeholder.com/150' }
    ]
  }
})

// Emits
const emit = defineEmits(['play-song', 'song-action', 'view-artist', 'view-playlist'])

// Methods
const formatPlayCount = (count) => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(0) + 'K'
  }
  return count.toString()
}

const formatFollowers = (count) => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(0) + 'K'
  }
  return count.toString()
}

const formatReleaseDate = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Hôm qua'
  if (diffDays < 7) return `${diffDays} ngày trước`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`
  return `${Math.floor(diffDays / 30)} tháng trước`
}
</script>

<style scoped>
.all-tab-container {
  padding: 20px 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.all-tab-container::-webkit-scrollbar {
  width: 6px;
}

.all-tab-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.all-tab-container::-webkit-scrollbar-thumb {
  background: linear-gradient(#00dbde, #fc00ff);
  border-radius: 3px;
}

/* Section Headers */
.music-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: white;
  background: linear-gradient(90deg, #00dbde 0%, #fc00ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.view-all-btn {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  padding: 0;
  height: auto;
  border: none;
  background: none;
}

.view-all-btn:hover {
  color: white;
}

/* Horizontal Scroll */
.horizontal-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 10px;
}

.horizontal-scroll::-webkit-scrollbar {
  height: 6px;
}

.horizontal-scroll::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.horizontal-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #00dbde 0%, #fc00ff 100%);
  border-radius: 3px;
}

/* Song Cards */
.song-cards {
  display: flex;
  gap: 16px;
  min-width: max-content;
}

.song-card {
  width: 160px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 12px;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
}

.song-card:hover, .song-card.active-card {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.card-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s;
}

.song-card:hover .card-play-overlay,
.song-card.active-card .card-play-overlay {
  opacity: 1;
}

.card-play-overlay :deep(svg) {
  font-size: 40px;
  color: white;
}

.card-info {
  text-align: left;
}

.card-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-artist {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* New Release Badge */
.new-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(90deg, #00dbde 0%, #fc00ff 100%);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  z-index: 1;
}

.release-date {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

/* Trending List */
.trending-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trending-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.trending-item:hover, .trending-item.active-trending {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.trending-rank {
  width: 30px;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: #00dbde;
  margin-right: 12px;
}

.trending-cover {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 12px;
}

.trending-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trending-play-icon {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s;
}

.trending-item:hover .trending-play-icon {
  opacity: 1;
}

.trending-play-icon :deep(svg) {
  font-size: 20px;
  color: white;
}

.trending-info {
  flex: 1;
  min-width: 0;
}

.trending-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trending-artist {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.trending-stats {
  display: flex;
  gap: 8px;
}

.play-count {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.trending-actions {
  margin-left: 12px;
}

/* Artist Cards */
.artist-cards {
  display: flex;
  gap: 16px;
  min-width: max-content;
}

.artist-card {
  width: 140px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.artist-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
}

.artist-avatar {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 12px;
}

.artist-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artist-play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s;
}

.artist-card:hover .artist-play-overlay {
  opacity: 1;
}

.artist-play-overlay :deep(svg) {
  font-size: 24px;
  color: white;
}

.artist-name {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist-followers {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* Playlist Cards */
.playlist-cards {
  display: flex;
  gap: 16px;
  min-width: max-content;
}

.playlist-card {
  width: 180px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.playlist-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
}

.playlist-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-play-overlay {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 35px;
  height: 35px;
  background: rgba(0, 219, 222, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s;
}

.playlist-card:hover .playlist-play-overlay {
  opacity: 1;
}

.playlist-play-overlay :deep(svg) {
  font-size: 18px;
  color: white;
}

.playlist-name {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-description {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Mobile Responsive */
@media (max-width: 576px) {
  .all-tab-container {
    padding: 16px 12px;
  }
  
  .section-title {
    font-size: 16px;
  }
  
  .song-card, .playlist-card {
    width: 140px;
  }
  
  .artist-card {
    width: 120px;
  }
  
  .trending-item {
    padding: 8px;
  }
  
  .trending-cover {
    width: 40px;
    height: 40px;
  }
}
</style>