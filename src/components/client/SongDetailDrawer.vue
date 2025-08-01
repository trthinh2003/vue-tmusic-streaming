<template>
  <a-drawer
    class="song-detail-drawer"
    :height="600"
    title="Chi tiết bài hát"
    placement="bottom"
    :open="open"
    @close="onClose"
    :header-style="{
      background: 'rgba(26, 26, 46, 0.9)',
      color: 'white'
    }"
    :body-style="{
      backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      padding: 0
    }"
  >
    <div class="song-detail-container">
      <!-- Cột trái - Thông tin bài hát hiện tại -->
      <div class="left-column">
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
            <a-button type="text" @click="toggleFavorite(currentSong.id)">
              <i :class="['fa-heart', isFavorite(currentSong.id) ? 'fa-solid text-danger' : 'fa-regular']"></i>
            </a-button>
            <a-button type="text" @click="showShareModal">
              <i class="fa-solid fa-share-nodes"></i>
            </a-button>
            <a-button type="text" @click="toggleRightDrawer">
              <i class="fa-solid fa-comment-dots"></i>
            </a-button>
          </div>
        </div>
      </div>
      <!-- Cột phải - Danh sách bài hát -->
      <div class="right-column">
        <div class="song-lists">
          <!-- Bài hát cùng ca sĩ -->
          <div class="song-list-section">
            <h4 class="section-title">
              <i class="fa-solid fa-music"></i>
              Bài hát cùng nghệ sĩ
            </h4>
            <div class="song-list">
              <div 
                v-for="song in sameArtistSongs" 
                :key="song.id"
                class="song-item"
                :class="{ active: song.id === currentSong.id }"
                @click="selectSong(song)"
              >
                <img :src="song.cover" alt="Song cover" class="song-item-cover" />
                <div class="song-item-info">
                  <p class="song-item-title">{{ song.title }}</p>
                  <p class="song-item-duration">{{ song.duration }}</p>
                </div>
                <button class="play-btn" @click.stop="playSong(song)">
                  <i class="fa-solid fa-play"></i>
                </button>
              </div>
            </div>
          </div>
          <div v-if="sameArtistSongs.length === 0" class="empty-state">
            <p>Hiện chưa có bài hát nào khác thuộc cùng ca sĩ này.</p>
          </div>
          <!-- Bài hát gợi ý -->
          <div class="song-list-section">
            <h4 class="section-title">
              <i class="fa-solid fa-thumbs-up"></i>
              Gợi ý cho bạn
            </h4>
            <div class="song-list">
              <div 
                v-for="song in suggestedSongs" 
                :key="song.id"
                class="song-item"
                :class="{ active: song.id === currentSong.id }"
                @click="selectSong(song)"
              >
                <img :src="song.cover" alt="Song cover" class="song-item-cover" />
                <div class="song-item-info">
                  <p class="song-item-title">{{ song.title }}</p>
                  <p class="song-item-artist">{{ song.artist }}</p>
                </div>
                <button class="play-btn" @click.stop="playSong(song)">
                  <i class="fa-solid fa-play"></i>
                </button>
              </div>
              
              <!-- Hiển thị khi không có bài hát gợi ý -->
              <div v-if="suggestedSongs.length === 0" class="empty-state">
                <p>Không có bài hát gợi ý</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script setup>
import { toRefs, onMounted, computed, ref } from 'vue'

const props = defineProps({
  open: Boolean,
  currentSong: { type: Object, required: true, default: null },
  sameArtistSongs: { type: Array, required: true },
  suggestedSongs: { 
    type: Array, 
    default: () => []
  },
  isFavorite: { type: Function, required: true },
  backgroundImage: String
})
const emit = defineEmits([
  'update:open',
  'toggle-favorite',
  'select-song',
  'play-song',
  'toggle-right-drawer',
  'show-share-modal'
])

const { open, currentSong, sameArtistSongs, suggestedSongs, isFavorite, backgroundImage } = toRefs(props)

function onClose() {
  emit('update:open', false)
}
function toggleFavorite(id) {
  emit('toggle-favorite', id)
}
function selectSong(song) {
  emit('select-song', song)
}
function playSong(song) {
  emit('play-song', song)
}
function toggleRightDrawer() {
  emit('toggle-right-drawer')
}

function showShareModal() {
  emit('show-share-modal')
}

onMounted(async() => {
  
})
</script>

<style scoped>
.song-detail-container {
  display: flex;
  height: 100%;
  color: white;
}

.left-column {
  flex: 1;
  padding: 20px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.song-detail-content {
  text-align: center;
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
  margin-bottom: 20px;
}
.song-info h3 {
  font-size: 1.5rem;
  margin-bottom: 5px;
  color: white;
}
.song-info .artist {
  color: var(--accent-color, #64ffda);
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
  border: none;
  background: transparent;
}
.song-actions .ant-btn:hover {
  color: var(--accent-color, #64ffda);
  transform: scale(1.1);
  background: transparent;
}
.right-column {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
.song-lists {
  height: 100%;
}
.song-list-section {
  margin-bottom: 30px;
}
.section-title {
  color: white;
  font-size: 1.1rem;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-title i {
  color: var(--accent-color, #64ffda);
}
.song-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.song-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
}
.song-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}
.song-item.active {
  background: var(--accent-color, #64ffda);
  color: #1a1a2e;
}
.song-item-cover {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  margin-right: 12px;
}
.song-item-info {
  flex: 1;
  min-width: 0;
}
.song-item-title {
  font-weight: 500;
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.song-item-duration,
.song-item-artist {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.song-item.active .song-item-duration,
.song-item.active .song-item-artist {
  color: rgba(26, 26, 46, 0.7);
}
.play-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--accent-color, #64ffda);
  border: none;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
}
.song-item:hover .play-btn {
  opacity: 1;
}
.play-btn:hover {
  transform: scale(1.1);
}
.empty-state {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

.song-item-cover {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  margin-right: 12px;
}
@media (max-width: 768px) {
  .song-detail-container {
    flex-direction: column;
  }
  .left-column {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex: none;
  }
  .song-cover {
    width: 150px;
    height: 150px;
  }
  .song-info h3 {
    font-size: 1.3rem;
  }
  .right-column {
    flex: 1;
    max-height: 300px;
  }
}
@media (max-width: 576px) {
  .song-detail-container {
    flex-direction: column;
  }
  .left-column {
    padding: 15px;
  }
  .right-column {
    padding: 15px;
  }
  .song-cover {
    width: 120px;
    height: 120px;
  }
}
.right-column::-webkit-scrollbar {
  width: 4px;
}
.right-column::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}
.right-column::-webkit-scrollbar-thumb {
  background: var(--accent-color, #64ffda);
  border-radius: 2px;
}
.right-column::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 255, 218, 0.8);
}
</style>