<template>
  <a-modal
    :open="modelValue"
    :footer="false"
    class="music-modal"
    @cancel="handleCancel"
    :width="800"
    style="top: 50px;"
  >
    <h2 class="modal-title mb-3">🎵 Khám phá âm nhạc</h2>

    <div class="search-container">
      <a-input-search
        v-model:value="localFilters.songName"
        placeholder="Tìm kiếm bài hát, nghệ sĩ, album..."
        size="large"
        class="music-search-bar"
        @search="handleApply"
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
      <a-tab-pane key="all" tab="🎼 Tất cả"></a-tab-pane>
      <a-tab-pane key="songs" tab="🎵 Bài hát"></a-tab-pane>
      <a-tab-pane key="playlist" tab="🎧 Playlist"></a-tab-pane>
      <a-tab-pane key="album" tab="💿 Album"></a-tab-pane>
      <a-tab-pane key="artist" tab="🌟 Nghệ sĩ"></a-tab-pane>
      <a-tab-pane key="option" tab="⚙️ Tùy chọn"></a-tab-pane>
    </a-tabs>

    <!-- Danh sách bài hát với hiệu ứng hover -->
    <div class="music-list-container" v-if="activeTab === 'all' || activeTab === 'songs'">
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
            <a-dropdown :trigger="['click']" placement="bottomRight">
              <a class="action-btn" @click.prevent>
                <more-outlined />
              </a>
              <template #overlay>
                <a-menu @click="(e) => handleSongAction(e.key, song)">
                  <a-menu-item key="add"><template #icon><plus-outlined /></template>Thêm vào playlist</a-menu-item>
                  <a-menu-item key="favorite"><template #icon><heart-outlined /></template>Yêu thích</a-menu-item>
                  <a-menu-item key="download"><template #icon><download-outlined /></template>Tải xuống</a-menu-item>
                  <a-menu-item key="share"><template #icon><share-alt-outlined /></template>Chia sẻ</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Danh sách album -->
    <div class="album-list-container" v-if="activeTab === 'album' && !selectedAlbum">
      <a-spin :spinning="isLoadingAlbums">
        <div class="album-grid">
          <div 
            class="album-item" 
            v-for="(album, index) in albums" 
            :key="index"
            @click="selectAlbum(album)"
          >
            <div class="album-cover">
              <img :src="album.imageUrl" alt="album cover"/>
              <div class="album-play-icon">
                <play-circle-filled />
              </div>
            </div>
            <div class="album-info">
              <h3 class="album-title">{{ album.title }}</h3>
              <p class="album-artist">{{ album.artist }}</p>
              <p class="album-year">{{ album.realeaseDate }} • {{ album.songs.length }} bài hát</p>
            </div>
          </div>
        </div>
        <div class="album-pagination">
          <a-pagination
            v-model:current="currentAlbumPage"
            :total="totalAlbums"
            :pageSize="albumPageSize"
            :showSizeChanger="false"
            @change="fetchAlbums"
            :disabled="isLoadingAlbums"
          />
        </div>
      </a-spin>
    </div>
    <audio 
      ref="audioPlayer" 
      @ended="handleSongEnded"
      style="display: none;"
    />

    <!-- Danh sách bài hát trong album đã chọn -->
    <div class="album-songs-container" v-if="activeTab === 'album' && selectedAlbum">
      <div class="album-header">
        <a-button class="back-button" @click="selectedAlbum = null">
          <arrow-left-outlined /> Quay lại
        </a-button>
        <div class="album-detail">
          <img :src="selectedAlbum.imageUrl" alt="album cover" class="album-detail-cover"/>
          <div class="album-detail-info">
            <h2 class="album-detail-title">{{ selectedAlbum.title }}</h2>
            <p class="album-detail-artist">{{ selectedAlbum.artist }}</p>
            <p class="album-detail-meta">{{ selectedAlbum.realeaseDate }} • {{ selectedAlbum.songs.length }} bài hát</p>
          </div>
        </div>
      </div>

      <div class="album-songs-list">
        <div
          class="music-item"
          v-for="(song, index) in selectedAlbum.songs"
          :key="index"
          @click="playSong(song)"
          :class="{ 'active-song': currentSong?.id === song.id }"
        >
          <div class="music-item-content">
            <div class="music-number">{{ index + 1 }}</div>
            <div class="music-info">
              <h3 class="music-title">{{ song.title }}</h3>
              <p class="music-artist">{{ song.artist }}</p>
            </div>
            <div class="music-duration">{{ song.duration }}</div>
            <div class="music-actions">
              <a-dropdown :trigger="['click']" placement="bottomRight">
                <a class="action-btn" @click.prevent>
                  <more-outlined />
                </a>
                <template #overlay>
                  <a-menu @click="(e) => handleSongAction(e.key, song)">
                    <a-menu-item key="add"><template #icon><plus-outlined /></template>Thêm vào playlist</a-menu-item>
                    <a-menu-item key="favorite"><template #icon><heart-outlined /></template>Yêu thích</a-menu-item>
                    <a-menu-item key="download"><template #icon><download-outlined /></template>Tải xuống</a-menu-item>
                    <a-menu-item key="share"><template #icon><share-alt-outlined /></template>Chia sẻ</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Bộ lọc tùy chọn -->
    <div class="filter-options" v-if="activeTab === 'option'">
      <a-form layout="vertical" class="music-filter-form">
        <a-form-item label="🎤 Tên nghệ sĩ">
          <a-input 
            v-model:value="localFilters.artistName" 
            placeholder="Nhập tên nghệ sĩ" 
            size="large"
            class="filter-input"
          >
            <template #prefix><user-outlined /></template>
          </a-input>
        </a-form-item>
        <a-form-item label="🎶 Thể loại">
          <a-select 
            v-model:value="localFilters.genre" 
            placeholder="Chọn thể loại" 
            allowClear
            size="large"
            class="filter-select"
          >
            <a-select-option value="pop"><template #icon><fire-outlined /></template>Pop</a-select-option>
            <a-select-option value="rock"><template #icon><thunderbolt-outlined /></template>Rock</a-select-option>
            <a-select-option value="jazz"><template #icon><star-outlined /></template>Jazz</a-select-option>
            <a-select-option value="hiphop"><template #icon><crown-outlined /></template>Hip Hop</a-select-option>
            <a-select-option value="edm"><template #icon><rocket-outlined /></template>EDM</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </div>
    
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
      <a-button v-if="activeTab === 'option'" class="footer-btn apply-btn" type="primary" @click="handleApply">
        <template #icon><check-outlined /></template>
        Áp dụng
      </a-button>
    </div>
  </a-modal>
  <!-- Modal chọn playlist -->
  <a-modal
    v-model:open="showPlaylistModal"
    :footer="null"
    width="400px"
    centered
  >
    <div class="playlist-modal-header mb-3" 
      style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); 
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 1.1rem;
        font-weight: bold; 
        color: white;
      "
    >
      <plus-outlined />
      Thêm vào playlist
    </div>
    <div class="playlist-modal-content">
      <h3 v-if="selectedSongForPlaylist" class="song-title">
        Thêm "<span>{{ selectedSongForPlaylist.title }}</span>" vào:
      </h3>
      
      <div class="playlist-list">
        <div 
          v-for="playlist in playlists" 
          :key="playlist.id"
          class="playlist-item"
          @click="addSongToPlaylist(playlist.id)"
        >
          <div class="playlist-info">
            <div class="playlist-name">{{ playlist.name }}</div>
            <div class="playlist-count">{{ playlist.songCount }} bài hát</div>
          </div>
          <div class="playlist-add-btn">
            <plus-outlined />
          </div>
        </div>
      </div>
      
      <div class="create-playlist">
        <a-input
          v-model:value="newPlaylistName"
          placeholder="Tạo playlist mới"
          size="large"
        >
          <template #addonAfter>
            <a-button 
              type="primary" 
              @click="createNewPlaylist"
              :disabled="!newPlaylistName.trim()"
            >
              Tạo
            </a-button>
          </template>
        </a-input>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, onBeforeUnmount, nextTick } from 'vue';
import { 
  PlayCircleFilled, SearchOutlined, ArrowLeftOutlined,
  MoreOutlined, PlusOutlined, HeartOutlined, 
  DownloadOutlined, ShareAltOutlined, UserOutlined,
  FireOutlined, ThunderboltOutlined, StarOutlined,
  CrownOutlined, RocketOutlined, CheckOutlined, PauseCircleFilled,
  StepBackwardOutlined, StepForwardOutlined, CloseOutlined
} from '@ant-design/icons-vue';

import { message } from 'ant-design-vue';
import { getSongs } from '@/services/songService';
import { getAlbumWithSongs } from '@/services/albumService';
import { getMyPlaylists, addSongsToPlaylist } from '@/services/playlistService';

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

const emit = defineEmits([
  'update:modelValue',
  'update:filters',
  'apply-filter',
  'pause-play'
]);

const localFilters = ref({ ...props.filters });
const activeTab = ref("all");
const selectedAlbum = ref(null);
const currentSong = ref(null);
const isPlaying = ref(false);
const audioPlayer = ref(null);
const isLoadingAudio = ref(false);
const loadingAbortController = ref(null);

const filteredSongs = ref([]);
const albums = ref([
  // {
  //   id: 1,
  //   title: "Những Bài Hát Hay Nhất",
  //   artist: "Sơn Tùng M-TP",
  //   imageUrl: "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",
  //   realeaseDate: "2023",
  //   songs: [
  //     {
  //       id: 101,
  //       title: "Chúng Ta Của Hiện Tại",
  //       artist: "Sơn Tùng M-TP",
  //       cover: "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",
  //       duration: "4:21"
  //     },
  //     {
  //       id: 102,
  //       title: "Muộn Rồi Mà Sao Còn",
  //       artist: "Sơn Tùng M-TP",
  //       cover: "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",
  //       duration: "3:45"
  //     },
  //     {
  //       id: 103,
  //       title: "Hãy Trao Cho Anh",
  //       artist: "Sơn Tùng M-TP ft. Snoop Dogg",
  //       cover: "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",
  //       duration: "4:05"
  //     }
  //   ]
  // },
]);
const showPlaylistModal = ref(false);
const selectedSongForPlaylist = ref(null);
const playlists = ref([
  // { id: 1, name: "Playlist yêu thích", songCount: 12 },
  // { id: 2, name: "Nhạc chill", songCount: 8 },
  // { id: 3, name: "Tập gym", songCount: 15 },
  // { id: 4, name: "Lái xe", songCount: 20 },
]);
const newPlaylistName = ref('');

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
  if (isPlaying.value) {
    audioPlayer.value.pause();
  } else {
    audioPlayer.value.play();
  }
  isPlaying.value = !isPlaying.value;
};

watch(() => props.filters, (newVal) => {
  localFilters.value = { ...newVal };
}, { deep: true });

watch(() => currentSong.value, (newSong) => {
  if (newSong) {
    const apiDuration = convertDurationToSeconds(newSong.duration);
    if (apiDuration > 0) {
      duration.value = apiDuration;
    }
  }
}, { immediate: true });

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
  if (!isBrowserActive()) {
    console.log("Trình duyệt không active, không phát nhạc");
    return;
  }
  
  if (!song || !song.audio) {
    message.error("Bài hát không có dữ liệu âm thanh");
    return;
  }

  // Hủy loading trước đó nếu có
  if (loadingAbortController.value) {
    loadingAbortController.value.abort();
  }
  
  // Tạo abort controller mới
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
      // Chờ một chút để đảm bảo audio đã dừng hoàn toàn
      await new Promise(resolve => setTimeout(resolve, 100));
      if (signal.aborted) {
        console.log("Play song đã bị abort sau khi pause");
        return;
      }
    }
    currentSong.value = song;
    currentTime.value = 0;
    showPlayerControls.value = true;
    isPlayingFromAlbum.value = selectedAlbum.value 
      ? selectedAlbum.value.songs.some(s => s.id === song.id)
      : false;
    
    // Set duration từ API trước
    const apiDuration = convertDurationToSeconds(song.duration);
    duration.value = apiDuration > 0 ? apiDuration : 0;
    
    await nextTick();
    
    if (signal.aborted) {
      console.log("Play song đã bị abort sau nextTick");
      return;
    }
    
    if (!audioPlayer.value) {
      throw new Error("Trình phát nhạc không khả dụng");
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
    
    // Load audio trước khi play
    audioPlayer.value.load();
    
    // Check abort trước khi play
    if (signal.aborted) {
      console.log("Play song đã bị abort trước khi play");
      return;
    }
    
    const playPromise = audioPlayer.value.play();
    
    if (playPromise !== undefined) {
      await playPromise;
      
      // Check lại abort sau khi play thành công
      if (!signal.aborted) {
        isPlaying.value = true;
        isLoadingAudio.value = false;
      } else {
        audioPlayer.value.pause();
      }
    }
    
  } catch (error) {
    isLoadingAudio.value = false;
    
    // Kiểm tra loại lỗi
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
  // message.error("Lỗi khi tải bài hát");
  consle.log("Lỗi khi tải bài hát");
  stopAudio();
};

const handlePlayError = (error, song) => {
  // Không retry nếu là abort error
  if (error.name === 'AbortError' || 
      error.message.includes('aborted') ||
      loadingAbortController.value?.signal.aborted) {
    console.log("Không retry vì đã bị abort");
    return;
  }
  
  if (error.name === 'DOMException' && 
      (error.message.includes('fetching process') || 
       error.message.includes('aborted'))) {
    console.warn("Audio fetching bị abort, thử lại sau 500ms");
    setTimeout(() => {
      // Chỉ retry nếu chưa bị abort
      if (!loadingAbortController.value?.signal.aborted) {
        playSong(song);
      }
    }, 500);
  } else {
    message.error("Không thể phát bài hát này");
    stopAudio();
    
    // Thử phát bài tiếp theo nếu có
    setTimeout(() => {
      if (!loadingAbortController.value?.signal.aborted) {
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

  // Nếu đang phát từ album
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
  
  // Hủy loading hiện tại
  if (loadingAbortController.value) {
    loadingAbortController.value.abort();
  }
  
  // Nếu đang phát từ album
  if (isPlayingFromAlbum.value && selectedAlbum.value) {
    const currentIndex = selectedAlbum.value.songs.findIndex(song => song.id === currentSong.value.id);
    if (currentIndex > 0) {
      await playSong(selectedAlbum.value.songs[currentIndex - 1]);
    } else {
      await playSong(selectedAlbum.value.songs[selectedAlbum.value.songs.length - 1]);
    }
    return;
  }
  
  // Phát bài trước đó trong danh sách chung
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

const handleSongAction = (action, song) => {
  if (action === 'add') {
    handleAddToPlaylist(song);
  } else {
    console.log(`Thao tác "${action}" trên bài hát:`, song);
    message.info(`Đã chọn thao tác "${action}" cho bài hát "${song.title}"`);
  }
};

const stopAudio = () => {
  // Hủy loading nếu đang load
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

const playWithRetry = async (song, retryCount = 0) => {
  if (retryCount > 2) {
    message.error("Không thể phát bài hát sau nhiều lần thử");
    stopAudio();
    return;
  }

  try {
    await playSong(song);
  } catch (error) {
    console.warn(`Thử lại phát nhạc (lần ${retryCount + 1})`, error);
    await new Promise(resolve => setTimeout(resolve, 300 * (retryCount + 1)));
    await playWithRetry(song, retryCount + 1);
  }
};


const handleCancel = () => {
  if (loadingAbortController.value) {
    loadingAbortController.value.abort();
  }
  stopAudio();
  emit('update:modelValue', false);
};

const handleApply = () => {
  emit('update:filters', { ...localFilters.value });
  emit('apply-filter');
  emit('update:modelValue', false);
};

const selectAlbum = (album) => {
  selectedAlbum.value = album;
};

//Xử lý modal playlist
const handleAddToPlaylist = (song) => {
  selectedSongForPlaylist.value = song;
  showPlaylistModal.value = true;
};

const addSongToPlaylist = async (playlistId) => {
  try {
    console.log(playlistId, selectedSongForPlaylist.value.id);
    const res = await addSongsToPlaylist(playlistId, selectedSongForPlaylist.value.id);
    message.success(`Đã thêm "${selectedSongForPlaylist.value.title}" vào playlist`);
    
    const myPlaylistRes = await getMyPlaylists();
    playlists.value = myPlaylistRes.data;
    
    showPlaylistModal.value = false;
  } catch (error) {
    console.error("Lỗi khi thêm bài hát vào playlist:", error);
    message.error("Bài hát này đã có trong playlist của bạn.");
  }
};

const createNewPlaylist = () => {
  if (!newPlaylistName.value.trim()) {
    message.error('Vui lòng nhập tên playlist');
    return;
  }
  
  const newPlaylist = {
    id: playlists.value.length + 1,
    name: newPlaylistName.value.trim(),
    songCount: 0
  };
  
  playlists.value.push(newPlaylist);
  newPlaylistName.value = '';
  message.success(`Đã tạo playlist "${newPlaylist.name}"`);
};

//Xử lý phân trang album
const currentAlbumPage = ref(1);
const albumPageSize = ref(6); // Số album mỗi trang
const totalAlbums = ref(0);
const isLoadingAlbums = ref(false);
const fetchAlbums = async (page = 1, pageSize = albumPageSize.value) => {
  try {
    isLoadingAlbums.value = true;
    const albumRes = await getAlbumWithSongs(page, pageSize);
    console.log('API Response:', albumRes);
    
    if (albumRes.data && albumRes.data.pagination) {
      albums.value = albumRes.data.data;
      totalAlbums.value = albumRes.data.pagination.totalItems;
      currentAlbumPage.value = page;
    } else {
      console.error('Invalid API response structure', albumRes);
    }
  } catch (error) {
    console.error("Lỗi khi tải album:", error);
    message.error("Không thể tải danh sách album");
  } finally {
    isLoadingAlbums.value = false;
  }
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

watch(() => activeTab.value, (newTab) => {
  if (newTab === 'album') {
    if (currentAlbumPage.value !== 1) {
      fetchAlbums(1, 6);
    }
  }
});

onMounted(async () => {
  try {
    const songRes = await getSongs();
    filteredSongs.value = songRes.data.data;
    await fetchAlbums(1, 6);
    const myPlaylistRes = await getMyPlaylists();
    playlists.value = myPlaylistRes.data;
    
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

/* Danh sách nhạc */
.music-list-container, .album-songs-list {
  max-height: 50vh;
  overflow-y: auto;
  padding: 0 16px;
  margin-top: 16px;
}

.music-list-container::-webkit-scrollbar,
.album-songs-list::-webkit-scrollbar {
  width: 6px;
}

.music-list-container::-webkit-scrollbar-track,
.album-songs-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.music-list-container::-webkit-scrollbar-thumb,
.album-songs-list::-webkit-scrollbar-thumb {
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

/* Album list */
.album-list-container {
  padding: 16px;
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  padding: 10px;
}

.album-item {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
}

.album-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-5px);
}

.album-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-play-icon {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  background: rgba(0, 219, 222, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s;
}

.album-item:hover .album-play-icon {
  opacity: 1;
}

.album-play-icon :deep(svg) {
  font-size: 20px;
  color: white;
}

.album-info {
  padding: 12px;
}

.album-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-artist {
  margin: 4px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-year {
  margin: 4px 0 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

/* Album detail */
.album-songs-container {
  padding: 16px;
}

.album-header {
  margin-bottom: 20px;
}

.back-button {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15px;
  padding: 0;
  display: flex;
  align-items: center;
}

.back-button:hover {
  color: white;
}

.album-detail {
  display: flex;
  align-items: center;
  gap: 20px;
}

.album-detail-cover {
  width: 150px;
  height: 150px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.album-detail-info {
  flex: 1;
}

.album-detail-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.album-detail-artist {
  margin: 8px 0 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.album-detail-meta {
  margin: 8px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

/* Album songs list */
.album-songs-list .music-item-content {
  padding: 10px 15px;
}

.album-songs-list .music-number {
  width: 30px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-right: 10px;
}

.album-songs-list .music-duration {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin: 0 15px;
}

/* Bộ lọc */
.filter-input {
  padding: 0;
}

.filter-options {
  padding: 16px 24px;
}

.music-filter-form :deep(.ant-form-item-label label) {
  color: rgba(255, 255, 255, 0.8);
  font-size: 15px;
}

.filter-input :deep(.ant-input), 
.filter-select :deep(.ant-select-selector) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  height: 48px;
  border-radius: 12px;
}

.filter-input :deep(.ant-input-prefix) {
  color: rgba(255, 255, 255, 0.6);
  margin-right: 10px;
}

.filter-select :deep(.ant-select-arrow) {
  color: rgba(255, 255, 255, 0.6);
}

.filter-select :deep(.ant-select-selection-item) {
  display: flex;
  align-items: center;
}

.filter-select :deep(.ant-select-item-option-content) {
  display: flex;
  align-items: center;
}

.filter-select :deep(.ant-select-item-option-state) {
  display: none;
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

.apply-btn {
  background: linear-gradient(90deg, #00dbde 0%, #fc00ff 100%);
  border: none;
  display: flex;
  align-items: center;
}

.apply-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 219, 222, 0.3);
}

/* Hiệu ứng tổng thể */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.music-modal :deep(.ant-modal-body) > * {
  animation: fadeIn 0.3s ease-out forwards;
}

.music-item, .album-item {
  animation: fadeIn 0.3s ease-out forwards;
}

.music-item:nth-child(1) { animation-delay: 0.1s; }
.music-item:nth-child(2) { animation-delay: 0.15s; }
.music-item:nth-child(3) { animation-delay: 0.2s; }
.music-item:nth-child(4) { animation-delay: 0.25s; }
.music-item:nth-child(5) { animation-delay: 0.3s; }
.music-item:nth-child(6) { animation-delay: 0.35s; }

@media (max-width: 576px) {
  .music-modal :deep(.ant-modal-content) {
    height: 85vh;
    border-radius: 0;
  }

  .modal-title {
    font-size: 1.2rem;
  }

  .music-tabs :deep(.ant-tabs-tab) {
    padding: 0;
    font-size: 10px;
  }
  
  .music-tabs :deep(.ant-tabs-tab-btn) {
    display: flex;
    align-items: center;
  }

  .music-item-content {
    font-size: 10px;
  }

  .footer-btn {
    padding: 0 12px;
  }

  .album-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .album-detail {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .album-detail-cover {
    width: 100px;
    height: 100px;
  }
}
</style>

<style scoped>
/* Playlist modal styles */
.playlist-modal-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 10px;
}

.playlist-modal-content .song-title {
  color: white;
  margin-bottom: 20px;
  font-weight: 500;
}

.playlist-modal-content .song-title span {
  color: #00dbde;
  font-weight: 600;
}

.playlist-list {
  margin-bottom: 20px;
}

.playlist-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s;
}

.playlist-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.playlist-info {
  flex: 1;
}

.playlist-name {
  color: white;
  font-weight: 500;
  margin-bottom: 4px;
}

.playlist-count {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.playlist-add-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(0, 219, 222, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00dbde;
}

.create-playlist {
  margin-top: 20px;
}

.create-playlist :deep(.ant-input-group-addon) {
  background: transparent !important;
  border: none !important;
}

.create-playlist :deep(.ant-input) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}

.create-playlist :deep(.ant-btn) {
  height: 40px;
  background: linear-gradient(90deg, #00dbde 0%, #fc00ff 100%);
  border: none;
}

/* Modal header style */
:deep(.ant-modal .ant-modal-title) {
  color: white !important;
  font-weight: 600;
}

:deep(.ant-modal .ant-modal-content) {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
}

:deep(.ant-modal .ant-modal-close-x) {
  color: rgba(255, 255, 255, 0.7) !important;
}
</style>

<style scoped>
/* Album pagination */
.album-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.album-pagination :deep(.ant-pagination-item),
.album-pagination :deep(.ant-pagination-prev),
.album-pagination :deep(.ant-pagination-next),
.album-pagination :deep(.ant-pagination-jump-prev),
.album-pagination :deep(.ant-pagination-jump-next) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  min-width: 32px;
  height: 32px;
  line-height: 32px;
  border-radius: 8px;
  margin: 0 4px;
}

.album-pagination :deep(.ant-pagination-item a) {
  color: rgba(255, 255, 255, 0.8);
}

.album-pagination :deep(.ant-pagination-item:hover),
.album-pagination :deep(.ant-pagination-prev:hover),
.album-pagination :deep(.ant-pagination-next:hover) {
  border-color: #00dbde;
}

.album-pagination :deep(.ant-pagination-item-active) {
  background: linear-gradient(90deg, #00dbde 0%, #fc00ff 100%);
  border-color: transparent;
}

.album-pagination :deep(.ant-pagination-item-active a) {
  color: white;
}

.album-pagination :deep(.ant-pagination-item-link) {
  color: rgba(255, 255, 255, 0.8);
  background: transparent;
  border: none;
}

.album-pagination :deep(.ant-pagination-disabled .ant-pagination-item-link) {
  color: rgba(255, 255, 255, 0.3);
}

.album-pagination :deep(.ant-pagination-options) {
  display: none;
}
</style>