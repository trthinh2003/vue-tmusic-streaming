<template>
  <a-modal
    :open="modelValue"
    :footer="false"
    class="music-modal"
    @cancel="handleCancel"
    :width="800"
    style="top: 50px;"
  >
    <h2 class="modal-title mb-3">Khám phá âm nhạc</h2>

    <div class="search-container">
      <a-input-search
        v-model:value="searchQuery"
        placeholder="Tìm kiếm bài hát, nghệ sĩ, album..."
        size="large"
        class="music-search-bar"
        :loading="isSearching"
        @search="() => searchSongs(searchQuery)"
        :styles="{
          'input-group-addon': { background: 'transparent', border: 'none' },
          'input-search-button': { background: 'transparent', border: 'none', color: 'rgba(255, 255, 255, 0.8)' }
        }"
      >
        <template #enterButton>
          <span>
            <search-outlined />
          </span>
        </template>
      </a-input-search>
    </div>

    <!-- Tabs -->
    <a-tabs v-model:activeKey="activeTab" class="music-tabs" centered scrollable>
      <a-tab-pane key="all" tab="🎼 Tất cả">
        <AllTab 
          :current-song="currentSong"
          :is-playing="isPlaying"
          @play-song="playSong"
          @song-action="handleSongAction"
          @view-artist="handleViewArtist"
          @view-playlist="handleViewPlaylist"
        />
      </a-tab-pane>
      <a-tab-pane key="songs" tab="🎵 Bài hát">
        <SongsTab 
          :current-song="currentSong"
          :is-playing="isPlaying"
          :filtered-songs="filteredSongs"
          :is-searching="isSearching"
          :search-query="searchQuery"
          @play-song="playSong"
          @song-action="handleSongAction"
        />
      </a-tab-pane>
      <a-tab-pane key="playlist" tab="🎧 Playlist">
        <PlaylistTab 
          :current-song="currentSong"
          :handle-song-action="handleSongAction"
          :default-image="playlistPopularImg"
          @play-song="playSong"
        />
      </a-tab-pane>
      <a-tab-pane key="album" tab="💿 Album">
        <AlbumTab 
          :current-song="currentSong"
          :is-playing="isPlaying"
          :selected-album="selectedAlbum"
          @play-song="playSong"
          @song-action="handleSongAction"
          @album-selected="handleAlbumSelected"
        />
      </a-tab-pane>
      <a-tab-pane key="artist" tab="🌟 Nghệ sĩ">
        <ArtistTab 
          :current-song="currentSong" 
          :handle-song-action="handleSongAction"
          @play-song="playSong"
        />
      </a-tab-pane>
    </a-tabs>
    
    <!-- Footer với nút bấm -->
    <div class="music-footer">
      <!-- Player Control -->
      <div class="player-controls" v-if="currentSong && showPlayerControls">
        <div class="player-close" @click="showPlayerControls = false">
          <close-outlined />
        </div>
        
        <div class="player-info">
          <img :src="currentSong.cover" width="40" height="40" />
          <div>
            <div class="song-title">{{ currentSong.title }}</div>
            <div class="song-artist">{{ currentSong.artist }}</div>
          </div>
        </div>
        
        <div class="player-progress">
          <a-slider 
            v-model:value="currentTime" 
            :max="duration" 
            @change="seekAudio"
            :tooltip="false"
            :step="0.01"
          />
          <div class="time-display">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>
        
        <div class="player-buttons">
          <button @click="playPrevious">
            <step-backward-outlined />
          </button>
          <button @click="togglePlay">
            <play-circle-filled v-if="!isPlaying" />
            <pause-circle-filled v-else />
          </button>
          <button @click="playNext">
            <step-forward-outlined />
          </button>
        </div>
      </div>

      <!-- Nút hiển thị player controls khi đang phát nhạc -->
      <div class="mini-player" v-if="currentSong && !showPlayerControls" @click="showPlayerControls = true">
        <img :src="currentSong.cover" width="30" height="30" />
        <div class="mini-player-info">
          <span>{{ currentSong.title }}</span>
          <play-circle-filled v-if="!isPlaying" />
          <pause-circle-filled v-else />
        </div>
      </div>
      <a-button class="footer-btn cancel-btn" @click="handleCancel">Đóng</a-button>
    </div>
  </a-modal>
  <audio 
    ref="audioPlayer"
    preload="none"
    @loadedmetadata="handleMetadataLoaded"
    @error="handleAudioError"
    @ended="handleSongEnded"
    @timeupdate="updateTime"
    style="display: none;"
  >
  </audio>
  <!-- Modal chọn playlist -->
  <AddSongToPlaylistModal
    v-model="showPlaylistModal"
    :selected-song="selectedSongForPlaylist"
    :playlists="playlists"
    v-model:new-playlist-name="newPlaylistName"
    @add-to-playlist="addSongToPlaylist"
    @create-playlist="createNewPlaylist"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import AllTab from '@/components/client/ComponentTabsFilterModal/AllTab.vue';
import SongsTab from '@/components/client/ComponentTabsFilterModal/SongsTab.vue';
import PlaylistTab from '@/components/client/ComponentTabsFilterModal/PlaylistTab.vue';
import AlbumTab from '@/components/client/ComponentTabsFilterModal/AlbumTab.vue';
import ArtistTab from '@/components/client/ComponentTabsFilterModal/ArtistTab.vue';
import AddSongToPlaylistModal from '@/components/client/AddSongToPlaylistModal.vue';
import { useSongActions } from '@/composables/useSongActions';
import { debounce } from 'lodash';
import { 
  PlayCircleFilled, SearchOutlined,
  CheckOutlined, PauseCircleFilled, StepBackwardOutlined, 
  StepForwardOutlined, CloseOutlined
} from '@ant-design/icons-vue';

import playlistPopularImg from '@/assets/client/playlists/img/playlist_popular.jpg';
import { useSearchFilterModalStore } from '@/stores/useSearchFilterModalStore';

import { message } from 'ant-design-vue';
import { getSongs } from '@/services/songService';


const searchStore = useSearchFilterModalStore();
const props = defineProps({
  modelValue: Boolean,
  filters: {
    type: Object,
    default: () => ({
      songName: '',
      artistName: '',
      genre: ''
    })
  }
});

const emit = defineEmits(['update:modelValue', 'update:filters', 'apply-filter', 'pause-play']);

const localFilters = ref({ ...props.filters });
const activeTab = ref("all");
const selectedAlbum = ref(null);
const currentSong = ref(null);
const isPlaying = ref(false);
const audioPlayer = ref(null);
const isLoadingAudio = ref(false);
const loadingAbortController = ref(null);

const filteredSongs = ref([]);

const searchQuery = computed({
  get: () => searchStore.searchQuery,
  set: (value) => searchStore.setSearchQuery(value)
});
const isSearching = computed(() => searchStore.isSearching);

const searchSongs = async (query) => {
  if (!query.trim()) {
    searchStore.setIsSearching(false);
    const songRes = await getSongs();
    filteredSongs.value = songRes.data.data;
    return;
  }

  try {
    searchStore.setIsSearching(true);
    const searchRes = await getSongs(1, 50, query);
    filteredSongs.value = searchRes.data.data || [];
  } catch (error) {
    console.error("Lỗi khi tìm kiếm:", error);
    const songRes = await getSongs();
    const allSongs = songRes.data.data;
    filteredSongs.value = allSongs.filter(song => 
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase())
    );
  } finally {
    searchStore.setIsSearching(false);
  }
};

const debouncedSearch = debounce(searchSongs, 300);

// Watch cho search query
watch(() => searchStore.searchQuery, (newQuery) => {
  localFilters.value.songName = newQuery;
  debouncedSearch(newQuery);
});

const {
  showPlaylistModal,
  selectedSongForPlaylist,
  playlists,
  newPlaylistName,
  handleSongAction,
  addSongToPlaylist,
  createNewPlaylist,
  loadPlaylists
} = useSongActions();

const handleAlbumSelected = (album) => {
  selectedAlbum.value = album;
};

const handleViewArtist = (artist) => {
  activeTab.value = 'artist';
};

const handleViewPlaylist = (playlist) => {
  activeTab.value = 'playlist';
};

const currentTime = ref(0);
const duration = ref(0);
const showPlayerControls = ref(true);
const isPlayingFromAlbum = ref(false);

const updateTime = () => {
  if (audioPlayer.value && currentSong.value) {
    currentTime.value = audioPlayer.value.currentTime;
    if (isNaN(audioPlayer.value.duration) || audioPlayer.value.duration === 0) {
      const apiDuration = convertDurationToSeconds(currentSong.value.duration);
      if (apiDuration > 0) {
        duration.value = apiDuration;
      }
    } else {
      duration.value = audioPlayer.value.duration;
    }
  }
};

const seekAudio = (value) => {
  if (audioPlayer.value) {
    audioPlayer.value.currentTime = value;
    currentTime.value = value;
  }
};

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds <= 0) {
    if (currentSong.value?.duration) {
      const apiDuration = convertDurationToSeconds(currentSong.value.duration);
      if (apiDuration > 0 && seconds === duration.value) {
        return currentSong.value.duration;
      }
    }
    return "0:00";
  }
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const togglePlay = () => {
  if (!audioPlayer.value) {
    console.error("Audio player not available");
    message.error("Trình phát nhạc không khả dụng");
    return;
  }
  
  if (!currentSong.value) {
    console.error("No current song");
    message.error("Không có bài hát nào đang phát");
    return;
  }
  
  try {
    if (isPlaying.value) {
      audioPlayer.value.pause();
      isPlaying.value = false;
    } else {
      const playPromise = audioPlayer.value.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          isPlaying.value = true;
        }).catch(error => {
          console.error("Error playing audio:", error);
          message.error("Không thể phát nhạc");
          isPlaying.value = false;
        });
      } else {
        isPlaying.value = true;
      }
    }
  } catch (error) {
    console.error("Error toggling play:", error);
    message.error("Lỗi khi điều khiển phát nhạc");
    isPlaying.value = false;
  }
};

const convertDurationToSeconds = (durationStr) => {
  if (!durationStr) return 0;
  if (!isNaN(durationStr)) return parseFloat(durationStr);
  const parts = durationStr.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
  } else if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
  }
  console.log('Invalid duration format:', durationStr);
  return 0;
};

const isBrowserActive = () => {
  return !document.hidden && document.visibilityState === 'visible';
};

const playSong = async (song) => {
  console.log('Received song to play:', song);
  
  if (!isBrowserActive()) {
    console.log("Trình duyệt không active, không phát nhạc");
    return;
  }
  
  if (!song || !song.id || !song.audio) {
    message.error("Bài hát không có dữ liệu âm thanh");
    return;
  }

  if (!audioPlayer.value) {
    console.error("Audio player element not found");
    message.error("Trình phát nhạc chưa sẵn sàng");
    return;
  }

  if (loadingAbortController.value) {
    loadingAbortController.value.abort();
  }
  
  loadingAbortController.value = new AbortController();
  const signal = loadingAbortController.value.signal;

  emit('pause-play');

  if (currentSong.value?.id === song.id) {
    togglePlay();
    return;
  }

  try {
    isLoadingAudio.value = true;
    if (signal.aborted) {
      console.log("Play song đã bị abort");
      return;
    }
    
    if (audioPlayer.value) {
      audioPlayer.value.pause();
      audioPlayer.value.currentTime = 0;
      await new Promise(resolve => setTimeout(resolve, 100));
      if (signal.aborted) {
        console.log("Play song đã bị abort sau khi pause");
        return;
      }
    }
    
    currentSong.value = song;
    currentTime.value = 0;
    showPlayerControls.value = true;
    isPlayingFromAlbum.value = activeTab.value === 'album' && 
      selectedAlbum.value && 
      selectedAlbum.value.songs && 
      selectedAlbum.value.songs.some(s => s.id === song.id);
    const apiDuration = convertDurationToSeconds(song.duration);
    duration.value = apiDuration > 0 ? apiDuration : 0;
    await nextTick();
    if (signal.aborted) {
      console.log("Play song đã bị abort sau nextTick");
      return;
    }
    if (!audioPlayer.value) {
      throw new Error("Trình phát nhạc không khả dụng sau nextTick");
    }

    audioPlayer.value.removeEventListener('loadedmetadata', handleMetadataLoaded);
    audioPlayer.value.removeEventListener('error', handleAudioError);
    
    const handleMetadata = () => {
      if (!signal.aborted) {
        handleMetadataLoaded();
      }
    };
    
    const handleError = (error) => {
      if (!signal.aborted) {
        handleAudioError(error);
      }
    };
    
    audioPlayer.value.addEventListener('loadedmetadata', handleMetadata, { once: true });
    audioPlayer.value.addEventListener('error', handleError, { once: true });
    
    audioPlayer.value.src = song.audio;
    audioPlayer.value.currentTime = 0;
    
    audioPlayer.value.load();
    
    if (signal.aborted) {
      console.log("Play song đã bị abort trước khi play");
      return;
    }
    
    const playPromise = audioPlayer.value.play();
    
    if (playPromise !== undefined) {
      await playPromise;
      
      if (!signal.aborted) {
        isPlaying.value = true;
        isLoadingAudio.value = false;
      } else {
        audioPlayer.value.pause();
      }
    }
    
  } catch (error) {
    isLoadingAudio.value = false;
    if (error.name === 'AbortError' || 
        error.message.includes('aborted') || 
        signal.aborted) {
      console.log("Audio loading bị abort, không retry");
      return;
    }
    
    console.error("Lỗi khi phát nhạc:", error);
    handlePlayError(error, song);
  }
};

const handleMetadataLoaded = () => {
  if (audioPlayer.value && currentSong.value) {
    const audioDuration = audioPlayer.value.duration;
    
    if (isNaN(audioDuration) || audioDuration === 0) {
      const apiDuration = convertDurationToSeconds(currentSong.value.duration);
      duration.value = apiDuration > 0 ? apiDuration : 0;
    } else {
      duration.value = audioDuration;
    }
  }
};

const handleAudioError = () => {
  console.log("Lỗi khi tải bài hát");
  stopAudio();
};

const handlePlayError = (error, song) => {
  if (error.name === 'AbortError' || 
      error.message.includes('aborted') ||
      loadingAbortController.value?.signal.aborted) {
    console.log("Không retry vì đã bị abort");
    return;
  }
  if (!audioPlayer.value) {
    console.error("Audio player không tồn tại, không thể retry");
    message.error("Trình phát nhạc không khả dụng");
    stopAudio();
    return;
  }
  if (error.name === 'DOMException' && 
      (error.message.includes('fetching process') || 
       error.message.includes('aborted'))) {
    console.warn("Audio fetching bị abort, thử lại sau 500ms");
    setTimeout(() => {
      if (!loadingAbortController.value?.signal.aborted && audioPlayer.value) {
        playSong(song);
      }
    }, 500);
  } else {
    message.error("Không thể phát bài hát này");
    stopAudio();
    setTimeout(() => {
      if (!loadingAbortController.value?.signal.aborted && audioPlayer.value) {
        if (isPlayingFromAlbum.value && selectedAlbum.value) {
          playNextInAlbum();
        } else {
          playNext();
        }
      }
    }, 300);
  }
};

const playNext = async () => {
  if (!currentSong.value || !filteredSongs.value?.length) {
    stopAudio();
    return;
  }
  if (loadingAbortController.value) {
    loadingAbortController.value.abort();
  }

  if (isPlayingFromAlbum.value && selectedAlbum.value) {
    const currentIndex = selectedAlbum.value.songs.findIndex(song => song.id === currentSong.value.id);
    if (currentIndex < selectedAlbum.value.songs.length - 1) {
      await playSong(selectedAlbum.value.songs[currentIndex + 1]);
    } else {
      await playSong(selectedAlbum.value.songs[0]);
    }
    return;
  }
  
  const currentIndex = filteredSongs.value.findIndex(song => song.id === currentSong.value.id);
  let nextSong = null;
  
  if (currentIndex < filteredSongs.value.length - 1) {
    nextSong = filteredSongs.value[currentIndex + 1];
  } else {
    nextSong = filteredSongs.value[0];
  }
  
  if (nextSong) {
    await playSong(nextSong);
  } else {
    stopAudio();
  }
};

const playNextInAlbum = () => {
  if (!currentSong.value || !selectedAlbum.value?.songs?.length) {
    stopAudio();
    return;
  }
  
  const currentIndex = selectedAlbum.value.songs.findIndex(song => song.id === currentSong.value.id);
  let nextSong = null;
  
  if (currentIndex < selectedAlbum.value.songs.length - 1) {
    nextSong = selectedAlbum.value.songs[currentIndex + 1];
  } else {
    nextSong = selectedAlbum.value.songs[0];
  }
  
  if (nextSong) {
    playSong(nextSong);
  } else {
    stopAudio();
  }
};

const playPrevious = async () => {
  if (!currentSong.value) return;
  
  if (loadingAbortController.value) {
    loadingAbortController.value.abort();
  }
  
  if (isPlayingFromAlbum.value && selectedAlbum.value) {
    const currentIndex = selectedAlbum.value.songs.findIndex(song => song.id === currentSong.value.id);
    if (currentIndex > 0) {
      await playSong(selectedAlbum.value.songs[currentIndex - 1]);
    } else {
      await playSong(selectedAlbum.value.songs[selectedAlbum.value.songs.length - 1]);
    }
    return;
  }
  
  const currentIndex = filteredSongs.value.findIndex(song => song.id === currentSong.value.id);
  if (currentIndex > 0) {
    await playSong(filteredSongs.value[currentIndex - 1]);
  } else {
    await playSong(filteredSongs.value[filteredSongs.value.length - 1]);
  }
};

const handleSongEnded = () => {
  isPlaying.value = false;
  currentTime.value = 0;
  
  try {
    if (isPlayingFromAlbum.value && selectedAlbum.value) {
      playNextInAlbum();
    } else {
      playNext();
    }
  } catch (error) {
    console.error("Lỗi khi chuyển bài:", error);
    message.error("Không thể phát bài hát tiếp theo");
    stopAudio();
  }
};

const stopAudio = () => {
  if (loadingAbortController.value) {
    loadingAbortController.value.abort();
    loadingAbortController.value = null;
  }
  
  isLoadingAudio.value = false;
  
  if (!audioPlayer.value) return;
  
  audioPlayer.value.removeEventListener('loadedmetadata', handleMetadataLoaded);
  audioPlayer.value.removeEventListener('error', handleAudioError);
  
  try {
    audioPlayer.value.pause();
    audioPlayer.value.currentTime = 0;
  } catch (error) {
    console.error("Lỗi khi dừng audio:", error);
  } finally {
    isPlaying.value = false;
    currentSong.value = null;
  }
};

const handleCancel = () => {
  if (loadingAbortController.value) {
    loadingAbortController.value.abort();
  }
  stopAudio();
  searchStore.clearSearch();
  emit('update:modelValue', false);
};

watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    if (loadingAbortController.value) {
      loadingAbortController.value.abort();
    }
    stopAudio();
  }
}, { immediate: true });

watch(() => currentSong.value, (newSong) => {
  if (newSong) {
    duration.value = convertDurationToSeconds(newSong.duration) || 0;
  }
});

onMounted(async () => {
  try {
    const songRes = await getSongs();
    filteredSongs.value = songRes.data.data;
    
    if (props.filters.songName) {
      searchQuery.value = props.filters.songName;
      await searchSongs(props.filters.songName);
    }
    
    await loadPlaylists(); 
    
    if (audioPlayer.value) {
      audioPlayer.value.addEventListener('timeupdate', updateTime);
      audioPlayer.value.addEventListener('loadedmetadata', () => {
        duration.value = audioPlayer.value.duration;
      });
      audioPlayer.value.addEventListener('ended', handleSongEnded);
    }
  } catch (error) {
    console.log(error);
  }
});

onBeforeUnmount(() => {
  if (loadingAbortController.value) {
    loadingAbortController.value.abort();
  }
  stopAudio();
  if (audioPlayer.value) {
    audioPlayer.value.removeEventListener('timeupdate', updateTime);
    audioPlayer.value.removeEventListener('loadedmetadata', () => {
      duration.value = audioPlayer.value.duration;
    });
    audioPlayer.value.removeEventListener('ended', handleSongEnded);
  }
});
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

/* Player controls */
.player-controls {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  padding: 25px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 25%;
}

.player-progress {
  flex: 1;
  padding: 0 20px;
}

.player-buttons {
  display: flex;
  gap: 15px;
  width: 25%;
  justify-content: flex-end;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.song-title {
  font-weight: bold;
  color: white;
}

.song-artist {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

/* Player close button */
.player-close {
  position: absolute;
  top: 10px;
  right: 10px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 5px;
  z-index: 1;
}

.player-close:hover {
  color: white;
}

/* Mini player */
.mini-player {
  position: fixed;
  bottom: 10px;
  left: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 15px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  z-index: 1000;
  backdrop-filter: blur(5px);
  max-width: 200px;
}

.mini-player:hover {
  background: rgba(0, 0, 0, 0.8);
}

.mini-player img {
  border-radius: 4px;
}

.mini-player-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
}

.mini-player-info span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
  font-size: 14px;
}

/* Modal chung */
.music-modal :global(.ant-modal-content) {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.music-modal :global(.ant-modal-header) {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 24px;
}

.music-modal :global(.ant-modal-title) {
  color: #fff;
  font-size: 1.5rem;
}

.modal-title {
  margin: 0;
  font-weight: 700;
  background: linear-gradient(90deg, #00dbde 0%, #fc00ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

:global(.ant-modal .ant-modal-close-x) {
  color: white !important;
  font-size: 18px;
  transition: all 0.3s;
}

/* Thanh tìm kiếm */
.search-container {
  padding: 0 20px;
  margin-bottom: 20px;
}

:deep(.ant-input-search > .ant-input-group > .ant-input-group-addon:last-child .ant-input-search-button) {
  background: transparent !important;
  border: none !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.ant-input-search > .ant-input-group > .ant-input-group-addon:last-child) {
  background: none !important;
  border: none !important;
}

.music-search-bar :deep(.ant-input) {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: none;
  color: #fff;
  height: 48px;
  border-radius: 24px 0 0 24px;
  padding-left: 20px;
}

.music-search-bar :deep(.ant-input-search-button) {
  height: 48px;
  border-radius: 0 24px 24px 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: none;
  font-weight: 600;
}

.music-search-bar :deep(.ant-input-search-button:hover) {
  opacity: 0.9;
}

.music-search-bar :deep(.ant-input::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

/* Tabs */
.music-tabs :deep(.ant-tabs-nav) {
  margin: 0;
}

.music-tabs :deep(.ant-tabs-tab) {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  padding: 12px 10px;
  transition: all 0.3s;
}

.music-tabs :deep(.ant-tabs-tab:hover) {
  color: #fff;
}

.music-tabs :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #fff;
  text-shadow: 0 0 10px rgba(0, 219, 222, 0.5);
}

.music-tabs :deep(.ant-tabs-ink-bar) {
  background: linear-gradient(90deg, #00dbde 0%, #fc00ff 100%);
  height: 3px;
}

/* Footer */
.music-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  gap: 12px;
}

.footer-btn {
  height: 40px;
  padding: 0 24px;
  border-radius: 20px;
  font-weight: 600;
  transition: all 0.3s;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

@media (max-width: 576px) {
  .music-modal :deep(.ant-modal-content) {
    height: 85vh;
    border-radius: 0;
  }

  .modal-title {
    font-size: 1.2rem;
  }

  .music-tabs :deep(.ant-tabs-tab) {
    padding: 8px 6px; 
    font-size: 12px;
    margin: 0;
    min-width: auto; 
    flex: 1; 
  }
  
  .music-tabs :deep(.ant-tabs-tab-btn) {
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .music-tabs :deep(.ant-tabs-nav) {
    margin: 0;
    padding: 0 10px;
  }

  .music-tabs :deep(.ant-tabs-nav-wrap) {
    overflow-x: auto;
    overflow-y: hidden;
  }

  .music-tabs :deep(.ant-tabs-nav-list) {
    display: flex;
    min-width: 100%;
  }

  .player-buttons {
    gap: 5px;
  }

  :deep(.anticon) {
    font-size: 0.85rem;
  }

  .song-title {
    font-size: 12px;
  }

  .song-artist {
    font-size: 10px;
  }

  .footer-btn {
    padding: 0 12px;
  }
}
</style>