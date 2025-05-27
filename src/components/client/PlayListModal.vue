<template>
  <!-- Playlist Selection Modal -->
  <div class="playlist-modal" @click.self="$emit('close')">
    <div class="playlist-modal-content">
      <div class="modal-header">
        <h3>Select Playlist</h3>
        <button @click="$emit('close')" class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <ul class="playlist-list">
          <li 
            v-for="playlist in availablePlaylists" 
            :key="playlist.id"
            :class="{ 'active': currentPlaylist && playlist.id === currentPlaylist.id }"
            @click="selectPlaylist(playlist)"
          >
            {{ playlist.name }}
            <span v-if="currentPlaylist && playlist.id === currentPlaylist.id" class="now-playing">
              <Icon icon="mdi:music-note" />
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';

const props = defineProps({
  availablePlaylists: {
    type: Array,
    default: () => []
  },
  currentPlaylist: {
    type: Object,
    default: null
  }
});

const emits = defineEmits(['close', 'change-playlist']);

const selectPlaylist = (playlist) => {
  emits('change-playlist', playlist);
  emits('close');
};
</script>

<style scoped>
.playlist-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.playlist-modal-content {
  background-color: #222;
  border-radius: 8px;
  width: 80%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #333;
  border-bottom: 1px solid #444;
}

.modal-header h3 {
  margin: 0;
  color: white;
}

.close-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  margin: 0;
}

.close-btn:hover {
  opacity: 0.7;
}

.modal-body {
  padding: 15px;
  max-height: 60vh;
  overflow-y: auto;
}

.playlist-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.playlist-list li {
  padding: 12px 15px;
  border-bottom: 1px solid #444;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.playlist-list li:last-child {
  border-bottom: none;
}

.playlist-list li:hover {
  background-color: #333;
}

.playlist-list li.active {
  background-color: rgba(66, 185, 131, 0.2);
}

.now-playing {
  color: #42b983;
}
</style>