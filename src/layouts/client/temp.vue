<template>
    <a-drawer
    class="song-detail-drawer"
    :height="500"
    title="Chi tiết bài hát"
    placement="bottom"
    :open="openSongDetail"
    @close="toggleSongDetail"
    :header-style="{ background: 'rgba(26, 26, 46, 0.9)', color: 'white' }"
    :body-style="{ background: 'rgba(26, 26, 46, 0.9)', padding: 0 }"
  >
    <div class="song-detail-content">
      <div class="song-cover-container">
        <img :src="currentSong.cover" alt="Song cover" class="song-cover" />
      </div>
      <div class="song-info">
        <h3>{{ currentSong.title }}</h3>
        <p class="artist">{{ currentSong.artist }}</p>
        <div class="song-meta">
          <span class="genre">{{ currentSong.genre }}</span>
          <span class="duration">{{ currentSong.duration }}</span>
        </div>
      </div>
      <div class="song-actions">
        <a-button type="text" @click="toggleFavorite">
          <i :class="['fa-heart', isFavorite ? 'fa-solid text-danger' : 'fa-regular']"></i>
        </a-button>
        <a-button type="text">
          <i class="fa-solid fa-share-nodes"></i>
        </a-button>
        <a-button type="text" @click="toggleRightDrawer">
          <i class="fa-solid fa-comment-dots"></i>
        </a-button>
      </div>
    </div>
  </a-drawer>
</template>

<script setup>
const openSongDetail = ref(false);
const isFavorite = ref(false);

const toggleSongDetail = () => {
  openSongDetail.value = !openSongDetail.value;
};

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
};
</script>

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

.song-detail-drawer .ant-drawer-content-wrapper {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  overflow: hidden;
}

.song-detail-content {
  padding: 20px;
  color: white;
}

.song-cover-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.song-cover {
  width: 200px;
  height: 200px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.song-info {
  text-align: center;
  margin-bottom: 20px;
}

.song-info h3 {
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.song-info .artist {
  color: var(--accent-color);
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.song-meta {
  display: flex;
  justify-content: center;
  gap: 15px;
  color: rgba(255, 255, 255, 0.7);
}

.song-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.song-actions .ant-btn {
  color: white;
  font-size: 1.2rem;
}

.song-actions .ant-btn:hover {
  color: var(--accent-color);
  transform: scale(1.1);
}

/* Animation khi mở drawer */
.song-detail-drawer .ant-drawer-content {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .song-cover {
    width: 150px;
    height: 150px;
  }
  
  .song-info h3 {
    font-size: 1.3rem;
  }
}
</style>
