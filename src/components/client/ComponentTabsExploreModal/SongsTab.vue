<template>
  <div class="music-list-container">
    <a-spin :spinning="isSearching">
      <div
        class="music-item"
        v-for="(song, index) in filteredSongs"
        :key="index"
        @click="playSong(song)"
        :class="{ 'active-song': currentSong?.id === song.id }"
      >
        <div class="music-item-content">
          <div class="music-cover">
            <img :src="song.cover" alt="thumbnail" width="25px"/>
            <div class="play-icon">
              <template v-if="currentSong?.id === song.id && isPlaying">
                <pause-circle-filled />
              </template>
              <template v-else>
                <play-circle-filled />
              </template>
            </div>
          </div>
          <div class="music-info">
            <h3 class="music-title">{{ song.title }}</h3>
            <p class="music-artist">{{ song.artist }}</p>
            <div class="music-tags">
              <span class="tag lossless">Lossless</span>
              <span class="tag popular">Phổ biến</span>
            </div>
          </div>
          <div class="music-actions">
            <SongActionDropdown 
              :song="song" 
              :is-downloaded="getDownloadStatus(song.id)"
              @action="handleSongAction"
            />
          </div>
        </div>
      </div>
      <div v-if="!isSearching && filteredSongs.length === 0 && searchQuery.trim()" 
          class="no-results" 
          style="text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">
        <p>Không tìm thấy bài hát nào với từ khóa "{{ searchQuery }}"</p>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { PlayCircleFilled, PauseCircleFilled } from '@ant-design/icons-vue';
import SongActionDropdown from '@/components/client/SongActionDropdown.vue';

const props = defineProps({
  currentSong: Object,
  isPlaying: Boolean,
  filteredSongs: Array,
  isSearching: Boolean,
  searchQuery: String,
  downloadStatuses: Map,
  getDownloadStatus: Function
});

const emit = defineEmits(['play-song', 'song-action']);

const playSong = (song) => {
  emit('play-song', song);
};

const handleSongAction = (action, song) => {
  emit('song-action', action, song);
};
</script>

<style scoped>
/* Active song */
.active-song {
  background: rgba(0, 219, 222, 0.1) !important;
  border-left: 3px solid #00dbde;
}

.active-song .music-title {
  color: #00dbde !important;
}

/* Danh sách nhạc */
.music-list-container {
  max-height: 50vh;
  overflow-y: auto;
  padding: 0 16px;
  margin-top: 16px;
}

.music-list-container::-webkit-scrollbar {
  width: 6px;
}

.music-list-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.music-list-container::-webkit-scrollbar-thumb {
  background: linear-gradient(#00dbde, #fc00ff);
  border-radius: 3px;
}

.music-item {
  margin-bottom: 12px;
  border-radius: 12px;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.03);
}

.music-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.music-item-content {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
}

.music-cover {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 16px;
  flex-shrink: 0;
}

.music-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-icon {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: all 0.3s;
}

.music-item:hover .play-icon {
  opacity: 1;
}

.play-icon :deep(svg) {
  font-size: 24px;
  color: #fff;
}

.music-info {
  flex-grow: 1;
  min-width: 0;
}

.music-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-artist {
  margin: 4px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.music-tags {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.tag.lossless {
  background: linear-gradient(90deg, #00dbde 0%, #fc00ff 100%);
  color: white;
}

.tag.popular {
  background: rgba(255, 215, 0, 0.2);
  color: gold;
}

.music-actions .action-btn {
  color: rgba(255, 255, 255, 0.6);
  font-size: 20px;
  padding: 8px;
  transition: all 0.3s;
}

.music-actions .action-btn:hover {
  color: #fff;
  transform: scale(1.1);
}

@media (max-width: 576px) {
  .music-item-content {
    font-size: 10px;
  }
}
</style>