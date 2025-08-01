<template>
  <div class="song-preview">
    <a-card>
      <div class="preview-content">
        <div class="media-section">
          <img v-if="imageUrl" :src="imageUrl" alt="Background" class="preview-image" />
          <img v-if="coverUrl" :src="coverUrl" alt="Cover" class="preview-cover" />
        </div>

        <div class="controls-section">
          <div class="color-picker">
            <span>Lyric Color:</span>
            <button 
              v-for="color in lyricColors" 
              :key="color.value"
              :class="['color-btn', { active: selectedColor === color.value }]"
              :style="{ backgroundColor: color.hex }"
              @click="selectedColor = color.value"
            />
          </div>
        </div>
        
        <div class="audio-section">
          <audio 
            ref="audioRef" 
            v-if="audioUrl" 
            controls 
            :src="audioUrl" 
            class="audio-player"
            @timeupdate="onTimeUpdate"
          />
          <div v-else class="no-audio">No audio file available</div>
        </div>
        
        <div class="lyrics-section" v-if="lyrics">
          <div class="lyrics-display">
            <LyricDisplay :lyrics="lyrics" :currentTime="currentTime" :theme="selectedColor" @seek="handleSeek"/>
          </div>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';
import LyricDisplay from '@/components/admin/songs/LyricDisplay.vue';

const props = defineProps({
  image: [File, String],
  cover: [File, String],
  audio: [File, String],
  lyrics: String
});

const lyricColors = ref([
  { value: 'neon-blue', hex: '#4361ee', name: 'Blue' },
  { value: 'neon-pink', hex: '#ff3e96', name: 'Pink' },
  { value: 'neon-green', hex: '#39ff14', name: 'Green' },
  { value: 'neon-purple', hex: '#9d4edd', name: 'Purple' },
  { value: 'neon-orange', hex: '#ff9e00', name: 'Orange' },
  { value: 'neon-red', hex: '#ff0054', name: 'Red' }
]);

const selectedColor = ref('neon-blue');

const audioUrl = ref('');
const audioRef = ref(null);
const imageUrl = ref('');
const coverUrl = ref('');
const currentTime = ref(0);
let timeInterval = null;

const handleSeek = (time) => {
  if (audioRef.value) {
    audioRef.value.currentTime = time;
    audioRef.value.play();
  }
};

// Hàm tạo URL từ file hoặc string
const createObjectUrl = (file) => {
  if (!file) return '';
  if (typeof file === 'string') return file; // Nếu đã là URL string
  if (file instanceof File || file instanceof Blob) {
    return URL.createObjectURL(file);
  }
  return '';
};

// Hàm giải phóng URL
const revokeUrl = (url) => {
  if (url && typeof url === 'string' && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

const onTimeUpdate = () => {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime;
  }
};

// Xử lý khi props thay đổi
watch(() => props.audio, (newAudio) => {
  // Giải phóng URL cũ
  revokeUrl(audioUrl.value);
  
  // Tạo URL mới
  audioUrl.value = createObjectUrl(newAudio);
  
  // Reset và tạo interval mới
  if (timeInterval) clearInterval(timeInterval);
  currentTime.value = 0;
  
  if (newAudio) {
    timeInterval = setInterval(() => {
      currentTime.value += 0.5;
    }, 500);
  }
}, { immediate: true });

watch(() => props.image, (newImage) => {
  revokeUrl(imageUrl.value);
  imageUrl.value = createObjectUrl(newImage);
}, { immediate: true });

watch(() => props.cover, (newCover) => {
  revokeUrl(coverUrl.value);
  coverUrl.value = createObjectUrl(newCover);
}, { immediate: true });

// Dọn dẹp khi component unmount
onUnmounted(() => {
  revokeUrl(audioUrl.value);
  revokeUrl(imageUrl.value);
  revokeUrl(coverUrl.value);
  if (timeInterval) clearInterval(timeInterval);
});
</script>

<style scoped>
.song-preview {
  max-width: 800px; 
  margin: 0; 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.25); 
  overflow: hidden; 
  transition: all 0.3s ease-in-out; 
}

.song-preview:hover {
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.35); 
  transform: translateY(-2px);
}

:deep(.ant-card) {
  background: transparent; 
  border: none; 
}

:deep(.ant-card-body) {
  padding: 0; 
  background: linear-gradient(145deg, #1a1f36, #2d3561);
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 24px; 
  padding: 24px; 
  background: linear-gradient(145deg, #1a1f36, #2d3561);
}

.media-section {
  position: relative;
  display: flex;
  justify-content: center; 
  align-items: center;
  min-height: 280px; 
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, #4a5568, #2d3748);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute; 
  top: 0;
  left: 0;
  filter: brightness(40%) blur(8px); 
  transform: scale(1.1); 
  transition: all 0.5s ease-in-out; 
}

.media-section:hover .preview-image {
  filter: brightness(50%) blur(6px); 
  transform: scale(1.05); 
}

.preview-cover {
  width: 180px; 
  height: 180px;
  object-fit: cover;
  border-radius: 50%; 
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6); 
  position: relative; 
  z-index: 10; 
  border: 4px solid rgba(255, 255, 255, 0.15);
  transition: transform 0.4s ease-in-out, box-shadow 0.4s ease-in-out;
}

.media-section:hover .preview-cover {
  transform: scale(1.08) rotate(3deg);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.7); 
  border-color: rgba(255, 255, 255, 0.25);
}

/* Phần Audio */
.audio-section {
  width: 100%;
  padding: 0; 
}

.audio-player {
  width: 100%;
  border-radius: 12px; 
  background: linear-gradient(145deg, #2a2f4a, #363c5a);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); 
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.audio-player::-webkit-media-controls-panel {
  background-color: #2a2f4a;
}

.no-audio {
  text-align: center;
  color: #a0aec0; 
  font-style: italic;
  padding: 25px;
  border: 2px dashed #4a5568;
  border-radius: 12px;
  background: linear-gradient(145deg, #2d3748, #4a5568);
  font-size: 1.1em;
  font-weight: 500;
}

.lyrics-section {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1); 
  border-radius: 16px; 
  padding: 0; 
  background: linear-gradient(145deg, #2a2f4a, #363c5a); 
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3); 
  line-height: 1.8;
  font-size: 1.05em;
  color: #e2e8f0;
  transition: box-shadow 0.3s ease;
}

.lyrics-section:hover {
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4), 0 4px 15px rgba(102, 126, 234, 0.2); 
}

.lyrics-section::-webkit-scrollbar {
  width: 8px; 
}

.lyrics-section::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.lyrics-section::-webkit-scrollbar-thumb {
  background: linear-gradient(145deg, #667eea, #764ba2);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1); 
}

.lyrics-section::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(145deg, #764ba2, #667eea);
}

.controls-section {
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-picker span {
  color: white;
  font-size: 14px;
}

.color-btn {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-btn:hover {
  transform: scale(1.1);
}

.color-btn.active {
  border-color: white;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
}
</style>