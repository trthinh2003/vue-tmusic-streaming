<template>
  <div class="playlist">
    <div class="playlist-header">
      <h2>Playlist</h2>
      <button @click="openPlaylistModal" class="playlist-selector-btn">
        <Icon icon="mdi:playlist-music" class="mr-1" />
        Select Playlist
      </button>
    </div>
    
    <div v-if="currentPlaylist" class="current-playlist-info">
      <span>Now Playing: <strong>{{ currentPlaylist.name }}</strong></span>
    </div>
    
    <ul>
      <song-item 
        v-for="song in paginatedSongs" 
        :key="song.id" 
        :song="song" 
        :is-current="song.id === currentSong.id"
        @click.native="$emit('select-song', song)" 
      />
    </ul>
    
    <div v-if="songs.length > itemsPerPage" class="pagination-controls mt-4">
      <button @click="prevPage" :disabled="currentPage === 1"><</button>
      <span class="text-white mx-2">{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">></button>
    </div>
    
    <!-- Playlist Selection Modal -->
    <div v-if="showPlaylistModal" class="playlist-modal">
      <div class="playlist-modal-content">
        <div class="modal-header">
          <h3>Select Playlist</h3>
          <button @click="closePlaylistModal" class="close-btn">&times;</button>
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
  </div>
</template>

<script>
import SongItem from './SongItem.vue'
import { Icon } from '@iconify/vue';
import { ref, computed } from 'vue';

export default {
  name: 'Playlist',
  components: {
    SongItem,
    Icon
  },
  props: {
    songs: Array,
    currentSong: Object,
    availablePlaylists: {
      type: Array,
      default: () => []
    },
    currentPlaylistId: {
      type: [String, Number],
      default: null
    },
    itemsPerPage: {
      type: Number,
      default: 3
    }
  },
  emits: ['select-song', 'change-playlist'],
  setup(props, { emit }) {
    const currentPage = ref(1);
    const showPlaylistModal = ref(false);
    
    const totalPages = computed(() => {
      return Math.ceil(props.songs.length / props.itemsPerPage);
    });
    
    const paginatedSongs = computed(() => {
      const start = (currentPage.value - 1) * props.itemsPerPage;
      const end = start + props.itemsPerPage;
      return props.songs.slice(start, end);
    });
    
    const currentPlaylist = computed(() => {
      if (!props.currentPlaylistId || !props.availablePlaylists) return null;
      return props.availablePlaylists.find(playlist => playlist.id === props.currentPlaylistId);
    });
    
    const prevPage = () => {
      if (currentPage.value > 1) currentPage.value--;
    };
    
    const nextPage = () => {
      if (currentPage.value < totalPages.value) currentPage.value++;
    };
    
    const openPlaylistModal = () => {
      showPlaylistModal.value = true;
    };
    
    const closePlaylistModal = () => {
      showPlaylistModal.value = false;
    };
    
    const selectPlaylist = (playlist) => {
      emit('change-playlist', playlist);
      closePlaylistModal();
      // Reset to first page when changing playlists
      currentPage.value = 1;
    };
    
    return {
      currentPage,
      totalPages,
      paginatedSongs,
      currentPlaylist,
      showPlaylistModal,
      prevPage,
      nextPage,
      openPlaylistModal,
      closePlaylistModal,
      selectPlaylist
    };
  }
}
</script>

<style scoped>
.playlist {
  margin-top: 5px;
  position: relative;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #444;
}

.playlist-selector-btn {
  display: flex;
  align-items: center;
  background: #42b983;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
}

.current-playlist-info {
  margin-bottom: 15px;
  padding: 8px;
  background-color: rgba(66, 185, 131, 0.1);
  border-left: 3px solid #42b983;
  border-radius: 3px;
  font-size: 0.9rem;
}

ul {
  list-style: none;
  padding: 0;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

button {
  background: #42b983;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  margin: 0 5px;
  border-radius: 5px;
}

button:disabled {
  background: #555;
  cursor: not-allowed;
}

/* Modal styles */
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