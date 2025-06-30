<template>
  <a-modal
    v-model:open="visible"
    width="500px"
    centered
    class="filter-modal"
    :footer="null"
    @cancel="handleCancel"
  >
    <h2 class="filter-modal-title mb-3">Lọc nâng cao</h2>
    <div class="filter-content">
      <div class="filter-form">
        <!-- Genre Checkboxes -->
        <div class="form-group">
          <label class="filter-label">
            <i class="fa-solid fa-tags me-2"></i>
            Thể loại
          </label>
          <div class="genre-checkbox-group">
            <a-checkbox
              v-model:checked="selectAllGenres"
              @change="handleSelectAllGenres"
              class="genre-checkbox"
            >
              Tất cả thể loại
            </a-checkbox>
            <a-divider class="genre-divider" />
            <div class="genre-checkbox-container">
              <a-checkbox-group
                v-model:value="localFilters.genres"
                class="genre-checkbox-grid"
                @change="handleGenreChange"
              >
                <a-checkbox
                  v-for="genre in genres"
                  :key="genre.genre"
                  :value="genre.genre"
                  class="genre-checkbox"
                >
                  {{ genre.genre }}
                </a-checkbox>
              </a-checkbox-group>
            </div>
          </div>
        </div>

        <!-- Song Name -->
        <div class="form-group">
          <label class="filter-label">
            <i class="fa-solid fa-music me-2"></i>
            Tên bài hát
          </label>
          <a-input
            v-model:value="localFilters.songName"
            placeholder="Nhập tên bài hát..."
            class="filter-input"
            @input="handleFilterChange"
          />
        </div>

        <!-- Artist Name -->
        <div class="form-group">
          <label class="filter-label">
            <i class="fa-solid fa-microphone me-2"></i>
            Nghệ sĩ
          </label>
          <a-input
            v-model:value="localFilters.artistName"
            placeholder="Nhập tên nghệ sĩ..."
            class="filter-input"
            @input="handleFilterChange"
          />
        </div>

        <!-- Filter Preview -->
        <div class="filter-preview" v-if="hasActiveFilters">
          <h4 class="preview-title">
            <i class="fa-solid fa-eye me-2"></i>
            Bộ lọc đang áp dụng:
          </h4>
          <div class="active-filters">
            <a-tag
              v-for="(value, key) in activeFilters"
              :key="key"
              closable
              @close="removeFilter(key)"
              class="filter-tag"
            >
              {{ getFilterLabel(key) }}: {{ formatFilterValue(value) }}
            </a-tag>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="filter-actions">
        <a-button 
          type="default" 
          @click="handleClearAll"
          :disabled="!hasActiveFilters"
          class="clear-btn"
        >
          <i class="fa-solid fa-eraser me-2"></i>
          Xóa tất cả
        </a-button>
        
        <a-button 
          type="primary" 
          @click="handleApplyFilter"
          class="apply-btn"
        >
          <i class="fa-solid fa-filter me-2"></i>
          Áp dụng bộ lọc
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getGenresForFilter } from '@/services/genreService'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  filters: {
    type: Object,
    default: () => ({ 
      songName: '', 
      artistName: '', 
      genres: [] 
    })
  }
})

const emit = defineEmits([
  'update:modelValue',
  'update:filters', 
  'apply-filter',
  'clear-filters'
])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const localFilters = ref({ ...props.filters })
const genres = ref([])
const loadingGenres = ref(false)
const selectAllGenres = ref(false)

// Fetch genres when component is mounted
onMounted(async () => {
  try {
    loadingGenres.value = true
    const response = await getGenresForFilter()
    genres.value = response.data
    
    // Initialize select all if genres are already selected
    if (localFilters.value.genres?.length === genres.value.length) {
      selectAllGenres.value = true
    }
  } catch (error) {
    console.error('Error fetching genres:', error)
    message.error('Không thể tải danh sách thể loại')
  } finally {
    loadingGenres.value = false
  }
})

// Computed properties
const hasActiveFilters = computed(() => {
  return localFilters.value.songName !== '' || 
         localFilters.value.artistName !== '' || 
         localFilters.value.genres?.length > 0
})

const activeFilters = computed(() => {
  const filters = {}
  if (localFilters.value.songName) filters.songName = localFilters.value.songName
  if (localFilters.value.artistName) filters.artistName = localFilters.value.artistName
  if (localFilters.value.genres?.length > 0) filters.genres = localFilters.value.genres
  return filters
})

// Methods
const getFilterLabel = (key) => {
  const labels = {
    songName: 'Tên bài hát',
    artistName: 'Nghệ sĩ',
    genres: 'Thể loại'
  }
  return labels[key] || key
}

const formatFilterValue = (value) => {
  if (Array.isArray(value)) {
    if (value.length > 2) {
      return `${value[0]}, ${value[1]} +${value.length - 2} khác`;
    }
    return value.join(', ');
  }
  return value;
};

const removeFilter = (filterKey) => {
  if (filterKey === 'genres') {
    localFilters.value.genres = []
    selectAllGenres.value = false
  } else {
    localFilters.value[filterKey] = ''
  }
  handleFilterChange()
}

const handleFilterChange = () => {
  emit('update:filters', { ...localFilters.value })
}

const handleGenreChange = (checkedValues) => {
  selectAllGenres.value = checkedValues.length === genres.value.length
  handleFilterChange()
}

const handleSelectAllGenres = (e) => {
  if (e.target.checked) {
    localFilters.value.genres = genres.value.map(g => g.genre)
  } else {
    localFilters.value.genres = []
  }
  handleFilterChange()
}

const handleApplyFilter = () => {
  emit('apply-filter', { ...localFilters.value });
  visible.value = false;
  
  const activeCount = Object.values(activeFilters.value).filter(v => v && (Array.isArray(v) ? v.length > 0 : true)).length;
  if (activeCount > 0) {
    message.success(`Đã áp dụng ${activeCount} bộ lọc`);
  } else {
    message.info('Đã xóa tất cả bộ lọc');
  }
}

const handleClearAll = () => {
  localFilters.value = { songName: '', artistName: '', genres: [] }
  selectAllGenres.value = false
  emit('clear-filters')
  emit('update:filters', { ...localFilters.value })
  message.success('Đã xóa tất cả bộ lọc')
}

const handleCancel = () => {
  // Reset về giá trị ban đầu khi cancel
  localFilters.value = { ...props.filters }
  selectAllGenres.value = localFilters.value.genres?.length === genres.value.length
  visible.value = false
}

// Watch props.filters để sync với parent
watch(() => props.filters, (newFilters) => {
  localFilters.value = { 
    songName: newFilters.songName || '', 
    artistName: newFilters.artistName || '', 
    genres: Array.isArray(newFilters.genres) ? [...newFilters.genres] : [] 
  };
  selectAllGenres.value = newFilters.genres?.length === genres.value.length;
}, { deep: true });
</script>

<style scoped lang="scss">
.filter-modal :deep(.ant-modal-content) {
  background: linear-gradient(135deg, #121212 0%, #1a1a2e 100%);
  color: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.filter-modal :deep(.ant-modal-header) {
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 20px 24px;
}

.filter-modal :deep(.ant-modal-title) {
  color: white;
  font-weight: 600;
  font-size: 18px;
  display: flex;
  align-items: center;
}

.filter-modal :deep(.ant-modal-close) {
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s ease;
}

.filter-modal :deep(.ant-modal-close:hover) {
  color: white;
  transform: scale(1.1);
}

.filter-modal :deep(.ant-modal-body) {
  padding: 0;
}

/* Title styling */
.filter-modal-title {
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  padding: 20px 24px 0;
  background: linear-gradient(90deg, #ff4d4f 0%, #1890ff 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
}

/* Content layout */
.filter-content {
  padding: 0 24px 24px;
}

.filter-form {
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 24px;
  position: relative;
}

.filter-label {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.2px;
}

.filter-label i {
  color: #40a9ff;
  font-size: 14px;
  width: 20px;
  text-align: center;
}

/* Genre Checkbox Styles */
.genre-checkbox-group {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.genre-checkbox-container {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 8px;
}

.genre-checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.genre-checkbox {
  margin: 0;
  :deep(.ant-checkbox-inner) {
    background-color: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
  }
  :deep(.ant-checkbox-checked .ant-checkbox-inner) {
    background-color: #1890ff;
    border-color: #1890ff;
  }
  :deep(.ant-checkbox + span) {
    color: rgba(255, 255, 255, 0.85);
    font-size: 13px;
  }
  :deep(.ant-checkbox:hover .ant-checkbox-inner) {
    border-color: #1890ff;
  }
}

.genre-divider {
  margin: 12px 0;
  border-color: rgba(255, 255, 255, 0.08);
}

/* Input fields */
.filter-input {
  width: 100%;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.filter-input :deep(.ant-input) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  border-radius: 8px;
  padding: 10px 16px;
  height: 40px;
  font-size: 14px;
  transition: all 0.3s;
}

.filter-input :deep(.ant-input:hover) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.3);
}

.filter-input :deep(.ant-input:focus) {
  background: rgba(255, 255, 255, 0.1);
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.filter-input :deep(.ant-input::placeholder) {
  color: rgba(255, 255, 255, 0.4);
  font-weight: 400;
  font-style: italic;
  opacity: 1;
  transition: all 0.2s ease;
}

.filter-input :deep(.ant-input:focus::placeholder) {
  opacity: 0.5;
}

/* Filter preview section */
.filter-preview {
  margin-top: 28px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.preview-title {
  margin: 0 0 14px 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.preview-title i {
  color: #40a9ff;
  margin-right: 8px;
  font-size: 14px;
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Filter tags */
.filter-tag {
  background: rgba(24, 144, 255, 0.15);
  border: 1px solid rgba(24, 144, 255, 0.3);
  color: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 4px 12px;
  font-size: 13px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.filter-tag:hover {
  background: rgba(24, 144, 255, 0.25);
  transform: translateY(-1px);
}

.filter-tag :deep(.ant-tag-close-icon) {
  color: rgba(255, 255, 255, 0.6);
  margin-left: 6px;
  font-size: 12px;
  transition: all 0.2s;
}

.filter-tag :deep(.ant-tag-close-icon:hover) {
  color: white;
}

/* Action buttons */
.filter-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  gap: 16px;
}

.clear-btn,
.apply-btn {
  flex: 1;
  height: 42px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.clear-btn {
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.2);
  color: #ff7875;
}

.clear-btn:hover {
  background: rgba(255, 77, 79, 0.2);
  border-color: #ff7875;
  color: #ff7875;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.1);
}

.clear-btn:disabled {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.25);
  transform: none;
  box-shadow: none;
  cursor: not-allowed;
}

.apply-btn {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
  color: white;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.apply-btn:hover {
  background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.3);
}

.apply-btn:active {
  transform: translateY(0);
}

/* Custom scrollbar for checkbox container */
.genre-checkbox-container::-webkit-scrollbar {
  width: 6px;
}

.genre-checkbox-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.genre-checkbox-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.genre-checkbox-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .filter-modal {
    margin: 0;
  }
  
  .filter-modal :deep(.ant-modal) {
    max-width: none;
    width: 95vw !important;
    margin: 0 auto;
    top: 20px;
  }
  
  .filter-content {
    padding: 0 16px 16px;
  }
  
  .filter-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .clear-btn,
  .apply-btn {
    width: 100%;
  }
  
  .form-group {
    margin-bottom: 18px;
  }
  
  .filter-preview {
    padding: 14px;
  }
  
  .genre-checkbox-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}

/* Animation for modal appearance */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-modal :deep(.ant-modal-content) {
  animation: fadeIn 0.3s ease-out forwards;
}

/* Pulse animation for active elements */
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(24, 144, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0); }
}

.apply-btn:focus {
  animation: pulse 1.5s infinite;
}
</style>