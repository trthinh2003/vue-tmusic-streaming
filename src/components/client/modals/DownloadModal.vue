<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Chọn chất lượng tải xuống</h3>
        <button class="close-btn" @click="closeModal">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="song-info">
          <img :src="song.cover" alt="Album cover" class="mini-cover" />
          <div>
            <h4>{{ song.title }}</h4>
            <p>{{ song.artist }}</p>
          </div>
        </div>
        
        <div class="quality-options">
          <div 
            v-for="option in qualityOptions" 
            :key="option.quality" 
            class="quality-option"
            :class="{ selected: selectedQuality === option.quality }"
            @click="selectQuality(option.quality)"
          >
            <div class="option-info">
              <strong>{{ option.quality }}</strong>
              <span>{{ option.info }}</span>
            </div>
            <div class="option-icon">
              <i class="fa-solid fa-circle-check" v-if="selectedQuality === option.quality"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="cancel-btn" @click="closeModal">Huỷ</button>
        <button 
          class="download-btn" 
          @click="downloadWithSelectedQuality"
          :disabled="!selectedQuality"
        >
          <i class="fa-solid fa-download"></i> Tải xuống
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  isVisible: Boolean,
  song: Object
});

const emit = defineEmits(['close', 'download']);

const selectedQuality = ref('');

const qualityOptions = [
  { quality: '128 kbps', info: 'Chất lượng thấp - Kích thước nhỏ' },
  { quality: '320 kbps', info: 'Chất lượng cao - Kích thước trung bình' },
  { quality: 'FLAC', info: 'Chất lượng nguyên bản - Kích thước lớn' }
];

const selectQuality = (quality) => {
  selectedQuality.value = quality;
};

const closeModal = () => {
  selectedQuality.value = '';
  emit('close');
};

const downloadWithSelectedQuality = () => {
  if (!selectedQuality.value) return;
  
  emit('download', {
    song: props.song,
    quality: selectedQuality.value
  });
  
  closeModal();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: rgba(30, 30, 46, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 90%;
  max-width: 500px;
  overflow: hidden;
  animation: modal-appear 0.3s ease-out;
}

@keyframes modal-appear {
  from { 
    opacity: 0;
    transform: translateY(-20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  color: #f8f9fa;
  font-size: 1.3rem;
}

.close-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #f8f9fa;
}

.modal-body {
  padding: 20px;
}

.song-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mini-cover {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  margin-right: 15px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.song-info h4 {
  margin: 0 0 5px 0;
  color: #f8f9fa;
  font-size: 1.1rem;
}

.song-info p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.quality-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quality-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.2s;
  border: 1px solid transparent;
}

.quality-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.quality-option.selected {
  background: rgba(67, 97, 238, 0.2);
  border-color: #4361ee;
}

.option-info {
  display: flex;
  flex-direction: column;
}

.option-info strong {
  color: #f8f9fa;
  font-size: 1rem;
  margin-bottom: 3px;
}

.option-info span {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.option-icon {
  color: #4361ee;
  font-size: 1.2rem;
}

.modal-footer {
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn {
  padding: 10px 20px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #f8f9fa;
}

.download-btn {
  padding: 10px 20px;
  border-radius: 8px;
  background: #4361ee;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.download-btn:hover {
  background: #3a56d4;
  transform: translateY(-2px);
}

.download-btn:disabled {
  background: rgba(67, 97, 238, 0.5);
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 576px) {
  .modal-content {
    width: 95%;
  }
  
  .modal-header h3 {
    font-size: 1.1rem;
  }
  
  .song-info h4 {
    font-size: 1rem;
  }
  
  .cancel-btn, .download-btn {
    padding: 8px 15px;
  }
}
</style>