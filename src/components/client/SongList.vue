<template>
  <div class="song-list">
    <div 
      v-for="(song, index) in songs" 
      :key="song.id" 
      class="song-item"
      @click="playSong(song)"
    >
      <div class="song-info">
        <span v-if="showRank" class="song-rank">{{ song.rank || index + 1 }}</span>
        <div class="song-details">
          <h3>{{ song.title }}</h3>
          <p>{{ song.artist }}</p>
        </div>
      </div>
      <div class="song-meta">
        <span v-if="showReleaseDate && song.releaseDate">{{ song.releaseDate }}</span>
        <span>{{ song.duration }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  songs: Array,
  showRank: Boolean,
  showReleaseDate: Boolean
});

const emit = defineEmits(['play']);

const playSong = (song) => {
  emit('play', song);
};
</script>

<style scoped>
.song-list {
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
}

.song-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background 0.2s;
}

.song-item:last-child {
  border-bottom: none;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.song-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.song-rank {
  font-weight: bold;
  color: var(--accent-color);
  min-width: 24px;
  text-align: center;
  font-size: 0.9rem;
}

.song-details {
  flex: 1;
  min-width: 0;
}

.song-details h3 {
  font-size: 0.95rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-details p {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 4px 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-meta {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 16px;
}
</style>