<template>
  <div class="explore-page">
    <div class="back-button-container">
      <router-link to="/watch" class="back-button">
        <i class="fas fa-arrow-left"></i>
        <span>Quay lại nghe nhạc</span>
      </router-link>
    </div>

    <!-- Hero Banner -->
    <div class="hero-banner">
      <div 
        class="banner-background" 
        :class="{ 'active': activeBg === 0, 'fade-out': isFading && activeBg === 1 }"
        :style="{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${backgrounds[0]})` }"
      ></div>
      <div 
        class="banner-background" 
        :class="{ 'active': activeBg === 1, 'fade-out': isFading && activeBg === 0 }"
        :style="{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${backgrounds[1]})` }"
      ></div>
      <div class="banner-content">
        <h1 class="d-none d-sm-block">Khám Phá Âm Nhạc</h1>
        <p>Những bản nhạc mới nhất và xu hướng hàng đầu</p>
      </div>
    </div>

    <!-- Bảng xếp hạng -->
    <div class="section">
      <h2 class="section-title">
        <i class="fas fa-chart-line me-2"></i> Bảng Xếp Hạng
      </h2>
      <div class="ranking-tabs">
        <a-tabs v-model:activeKey="activeRankingTab">
          <a-tab-pane key="vietnam" tab="Việt Nam">
            <song-list :songs="vietnamRanking" show-rank />
          </a-tab-pane>
          <a-tab-pane key="usuk" tab="US-UK">
            <song-list :songs="usukRanking" show-rank />
          </a-tab-pane>
          <a-tab-pane key="kpop" tab="K-Pop">
            <song-list :songs="kpopRanking" show-rank />
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>

    <!-- Chủ đề/Thể loại phổ biến -->
    <div class="section">
      <h2 class="section-title">
        <i class="fas fa-tags me-2"></i> Thể Loại Phổ Biến
      </h2>
      <div class="genre-grid">
        <div 
          v-for="genre in popularGenres" 
          :key="genre.id"
          class="genre-card"
          :style="{ backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${genre.image})` }"
          @click="viewGenre(genre.id)"
        >
          <span>{{ genre.name }}</span>
        </div>
      </div>
    </div>

    <!-- Playlist đề xuất -->
    <div class="section">
      <h2 class="section-title">
        <i class="fas fa-headphones me-2"></i> Playlist Cho Bạn
      </h2>
      <div class="playlist-carousel">
        <div 
          v-for="playlist in recommendedPlaylists" 
          :key="playlist.id"
          class="playlist-card"
          @click="viewPlaylist(playlist.id)"
        >
          <div class="playlist-image">
            <img :src="playlist.cover" :alt="playlist.name">
            <div class="play-button">
              <i class="fas fa-play"></i>
            </div>
          </div>
          <div class="playlist-info">
            <h3>{{ playlist.name }}</h3>
            <p>{{ playlist.trackCount }} bài hát</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Nghệ sĩ nổi bật -->
    <div class="section">
      <h2 class="section-title">
        <i class="fas fa-star me-2"></i> Nghệ Sĩ Nổi Bật
      </h2>
      <div class="artist-list">
        <div 
          v-for="artist in featuredArtists" 
          :key="artist.id"
          class="artist-card"
          @click="viewArtist(artist.id)"
        >
          <div class="artist-avatar">
            <img :src="artist.avatar" :alt="artist.name">
          </div>
          <div class="artist-info">
            <h3>{{ artist.name }}</h3>
            <p>{{ artist.followerCount }} lượt theo dõi</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Bài hát mới phát hành -->
    <div class="section">
      <h2 class="section-title">
        <i class="fas fa-music me-2"></i> Mới Phát Hành
      </h2>
      <song-list :songs="newReleases" show-release-date />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import SongList from '@/components/client/SongList.vue';
import tmusicbackground1 from '@/assets/img/tmusic_bg1.jpg';
import tmusicbackground2 from '@/assets/img/tmusic_bg2.jpg';
import popbackground from '@/assets/client/explore/pop_bg.png';
import rapvietbackground from '@/assets/client/explore/rapviet_bg.png';


const router = useRouter();

const backgrounds = [tmusicbackground1, tmusicbackground2];
const activeBg = ref(0);
const isFading = ref(false);
let backgroundInterval;

const switchBackground = () => {
  isFading.value = true;
  setTimeout(() => {
    activeBg.value = activeBg.value === 0 ? 1 : 0;
    isFading.value = false;
  }, 1000);
};

onMounted(() => {
  backgroundInterval = setInterval(switchBackground, 7000);
});

onBeforeUnmount(() => {
  clearInterval(backgroundInterval);
});

// Data mẫu - thay bằng API thực tế
const activeRankingTab = ref('vietnam');

const featuredArtists = ref([
  { 
    id: 1, 
    name: 'Nghệ Sĩ A', 
    avatar: 'https://example.com/artist1.jpg', 
    followerCount: '1.2M' 
  },
  // Thêm nghệ sĩ khác
]);

const newReleases = ref([
  {
    id: 1,
    title: 'Bài Hát Mới 1',
    artist: 'Nghệ Sĩ X',
    duration: '3:45',
    releaseDate: '20/10/2023'
  },
  // Thêm bài hát khác
]);


const vietnamRanking = ref([
  { id: 1, rank: 1, title: 'Bài Hát Việt 1', artist: 'Nghệ Sĩ A', duration: '3:45', plays: '1.2M' },
  { id: 2, rank: 2, title: 'Bài Hát Việt 2', artist: 'Nghệ Sĩ B', duration: '4:12', plays: '980K' },
  // Thêm dữ liệu thực tế
]);

const usukRanking = ref([
  { id: 1, rank: 1, title: 'Bài Hát 1', artist: 'Nghệ Sĩ A', duration: '3:45', plays: '1.2M' },
  { id: 2, rank: 2, title: 'Bài Hát 2', artist: 'Nghệ Sĩ B', duration: '4:12', plays: '980K' },
  // Thêm dữ liệu thực tế
]);

const kpopRanking = ref([
  { id: 1, rank: 1, title: 'K-Pop Hit 1', artist: 'Group A', duration: '3:45', plays: '2.5M' },
  { id: 2, rank: 2, title: 'K-Pop Hit 2', artist: 'Group B', duration: '3:22', plays: '1.8M' },
  // Thêm dữ liệu thực tế
]);

const popularGenres = ref([
  { id: 1, name: 'Pop', image: popbackground },
  { id: 2, name: 'Rap Việt', image: rapvietbackground },
  // Thêm thể loại khác
]);

const recommendedPlaylists = ref([
  { id: 1, name: 'Top 100 Bài Hát Việt Nam', cover: 'https://example.com/playlist1.jpg', trackCount: 100 },
  // Thêm playlist khác
]);

// Các hàm xử lý
const viewGenre = (genreId) => {
  router.push({ name: 'genre', params: { id: genreId } });
};

const viewPlaylist = (playlistId) => {
  router.push({ name: 'playlist', params: { id: playlistId } });
};

const viewArtist = (artistId) => {
  router.push({ name: 'artist', params: { id: artistId } });
};
</script>


<style scoped>
.back-button-container {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%);
  padding: 15px 20px;
  display: flex;
  justify-content: flex-start;
}

.back-button {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: rgba(30, 30, 30, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  color: white;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.back-button:hover {
  background: rgba(60, 60, 60, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.back-button i {
  margin-right: 8px;
  font-size: 0.9rem;
  color: var(--accent-color);
}

/* Responsive cho mobile */
@media (max-width: 768px) {
  .back-button-container {
    padding: 10px 15px;
  }
  
  .back-button span {
    display: none;
  }
  
  .back-button {
    padding: 10px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    justify-content: center;
  }
  
  .back-button i {
    margin-right: 0;
    font-size: 1rem;
  }
}
</style>

<style scoped>
.explore-page {
  padding: 0;
  background: #00112a;
  color: #e0e0e0;
  min-height: 100vh;
}

/* Typography */
h1, h2, h3 {
  font-weight: 600;
  margin: 0;
}

/* Section styling */
.section {
  padding: 0 16px;
  margin-bottom: 32px;
}

.section-title {
  font-size: 1.5rem;
  margin: 30px 0 20px;
  padding-left: 20px;
  position: relative;
  color: #c2ceff;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 60%;
  width: 4px;
  background: var(--primary-gradient);
  border-radius: 2px;
}

.section-title i {
  margin-right: 10px;
  color: var(--accent-color);
}

/* Hero banner */
.hero-banner {
  height: 300px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: white;
  margin-bottom: 30px;
}

.hero-banner::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 150px;
  background: linear-gradient(transparent, var(--dark-bg));
  z-index: 2;
}

.hero-banner h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

.hero-banner p {
  font-size: 1.1rem;
  opacity: 0.9;
  position: relative;
  z-index: 1;
  text-shadow: 0 1px 5px rgba(0,0,0,0.5);
}

/* Background banner */
.banner-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 1.5s ease-out;
  z-index: 1;
}

.banner-background.active {
  opacity: 1;
}

.banner-background.fade-out {
  opacity: 0;
}

.banner-content {
  position: relative;
  z-index: 5;
  padding: 40px;
}

.banner-content h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

.banner-content p {
  font-size: 1.1rem;
  opacity: 0.9;
  text-shadow: 0 1px 5px rgba(0,0,0,0.5);
}

/* Tabs styling */
.ranking-tabs {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

:deep(.ant-tabs-nav) {
  background: var(--card-bg);
  padding: 0 20px;
}

:deep(.ant-tabs-tab) {
  color: var(--text-secondary);
  font-weight: 500;
  padding: 15px 0;
  margin-right: 25px;
  transition: color 0.2s;
}

:deep(.ant-tabs .ant-tabs-tab-btn) {
  color: white;
}

:deep(.ant-tabs-tab-active) {
  color: white;
}

:deep(.ant-tabs-ink-bar) {
  background: var(--primary-gradient);
  height: 3px;
}

:deep(.ant-tabs-content) {
  padding: 0;
}
</style>

<style scoped>
.genre-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  padding: 0 10px;
}

.genre-card {
  height: 100px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  padding: 15px;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.genre-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%);
}

.genre-card span {
  position: relative;
  z-index: 1;
}

.genre-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}
</style>

<style scoped>
.playlist-carousel {
  display: flex;
  overflow-x: auto;
  gap: 20px;
  padding: 10px 20px;
  scrollbar-width: none;
}

.playlist-card {
  min-width: 180px;
  cursor: pointer;
  transition: transform 0.3s;
  background: var(--card-bg);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.playlist-card:hover {
  transform: scale(1.05);
}

.playlist-image {
  position: relative;
  aspect-ratio: 1;
}

.playlist-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: var(--primary-gradient);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.play-button i {
  color: white;
  font-size: 14px;
  margin-left: 2px;
}

.playlist-card:hover .play-button {
  opacity: 1;
  transform: translateY(-5px);
}

.playlist-info {
  padding: 12px;
}

.playlist-info h3 {
  font-size: 0.95rem;
  margin: 0 0 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
}

.playlist-info p {
  font-size: 0.8rem;
  margin: 0;
  color: var(--text-secondary);
}
</style>

<style scoped>
.artist-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  padding: 0 20px;
}

.artist-card {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.artist-card:hover {
  transform: translateY(-5px);
  background: #333;
}

.artist-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 15px;
  border: 3px solid rgba(255,255,255,0.1);
  transition: all 0.3s;
}

.artist-card:hover .artist-avatar {
  border-color: var(--accent-color);
  transform: scale(1.05);
}

.artist-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artist-info h3 {
  font-size: 1rem;
  margin: 0 0 5px;
  color: white;
}

.artist-info p {
  font-size: 0.8rem;
  margin: 0;
  color: var(--text-secondary);
}
</style>

<style scoped>
@media (min-width: 640px) {
  .section {
    padding: 0 24px;
  }
  
  .hero-banner {
    height: 320px;
    padding: 32px;
  }
  
  .hero-banner h1 {
    font-size: 2.5rem;
  }

  .banner-content {
    padding: 32px;
  }
  
  .banner-content h1 {
    font-size: 2.5rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .genre-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .artist-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) {
  .genre-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  
  .artist-list {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  
  .playlist-carousel {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    overflow-x: visible;
    gap: 20px;
  }
  
  .playlist-card {
    min-width: auto;
  }
}

@media (min-width: 1024px) {
  .explore-page {
    padding-bottom: 120px;
  }
  
  .hero-banner {
    height: 380px;
  }
}
</style>

<style scoped>
:root {
  --primary-gradient: linear-gradient(135deg, #1db954 0%, #1ed760 100%); 
  --secondary-gradient: linear-gradient(135deg, #4687ff 0%, #5d9dff 100%);
  --purple-gradient: linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%);
  --dark-bg: #181818;
  --card-bg: #282828;
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --accent-color: #1db954;
}
</style>