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
    
    <!-- Fixed Modal Usage -->
    <play-list-modal 
      v-if="showPlaylistModal" 
      :available-playlists="availablePlaylists" 
      :current-playlist="currentPlaylist" 
      @close="closePlaylistModal" 
      @change-playlist="handlePlaylistChange" 
    />
    
    <div v-if="songs.length > itemsPerPage" class="pagination-controls mt-4">
      <button @click="prevPage" :disabled="currentPage === 1"><</button>
      <span class="text-white mx-2">{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">></button>
    </div>
  </div>
</template>

<script>
import SongItem from './SongItem.vue'
import PlayListModal from './PlayListModal.vue';
import { Icon } from '@iconify/vue';
import { ref, computed } from 'vue';

export default {
  name: 'Playlist',
  components: {
    SongItem,
    Icon,
    PlayListModal
  },
  props: {
    songs: {
      type: Array,
      default: () => []
    },
    currentSong: {
      type: Object,
      default: () => ({})
    },
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
      console.log('Opening playlist modal'); // Debug log
      showPlaylistModal.value = true;
    };
    
    const closePlaylistModal = () => {
      console.log('Closing playlist modal'); // Debug log
      showPlaylistModal.value = false;
    };
    
    const handlePlaylistChange = (playlist) => {
      console.log('Playlist changed:', playlist); // Debug log
      emit('change-playlist', playlist);
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
      handlePlaylistChange
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
  margin-top: 5px;
  padding-bottom: 10px;
  border-bottom: 1px solid #444;
}

.playlist-header h2 {
  color: white;
  margin: 0;
}

.playlist-selector-btn {
  display: flex;
  align-items: center;
  background: #42b983;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.playlist-selector-btn:hover {
  background: #369970;
}

.mr-1 {
  margin-right: 4px;
}

.current-playlist-info {
  margin-bottom: 15px;
  padding: 8px;
  background-color: rgba(66, 185, 131, 0.1);
  border-left: 3px solid #42b983;
  border-radius: 3px;
  font-size: 0.9rem;
  color: white;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
}

.pagination-controls button {
  background: #42b983;
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  margin: 0 5px;
  border-radius: 5px;
  transition: background-color 0.2s;
}

.pagination-controls button:hover:not(:disabled) {
  background: #369970;
}

.pagination-controls button:disabled {
  background: #555;
  cursor: not-allowed;
}

.text-white {
  color: white;
}

.mx-2 {
  margin: 0 8px;
}

.mt-4 {
  margin-top: 16px;
}
</style>