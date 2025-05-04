<template>
  <a-modal
    :open="modelValue"
    :footer="false"
    class="music-modal"
		@click="handleCancel"
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

    <!-- Tabs với hiệu ứng âm nhạc -->
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
      >
        <div class="music-item-content">
          <div class="music-cover">
            <img :src="song.thumbnail" alt="thumbnail" width="25px"/>
            <div class="play-icon">
              <play-circle-filled />
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
      <a-button class="footer-btn cancel-btn" @click="handleCancel">Đóng</a-button>
      <a-button class="footer-btn apply-btn" type="primary" @click="handleApply">
        <template #icon><check-outlined /></template>
        Áp dụng
      </a-button>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { 
  PlayCircleFilled, SearchOutlined,
  MoreOutlined, PlusOutlined, HeartOutlined, 
  DownloadOutlined, ShareAltOutlined, UserOutlined,
  FireOutlined, ThunderboltOutlined, StarOutlined,
  CrownOutlined, RocketOutlined, CheckOutlined
} from '@ant-design/icons-vue';

import cover5 from '@/assets/client/covers/cover5.jpg';
import cover7 from '@/assets/client/covers/cover7.jpg';
import cover10 from '@/assets/client/covers/cover10.jpg';

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
  'apply-filter'
]);

const localFilters = ref({ ...props.filters });
const activeTab = ref("all");

const filteredSongs = ref([
  {
    title: "Cơn Mưa Ngang Qua",
    artist: "Sơn Tùng M-TP",
    thumbnail: cover7,
  },
  {
    title: "Tell Your World",
    artist: "Hatsune Miku",
    thumbnail: cover10,
  },
  {
    title: "Thêm Một Lần Đau",
    artist: "HKT",
    thumbnail: cover5,
  },
  {
    title: "Em Của Ngày Hôm Qua",
    artist: "Sơn Tùng M-TP",
    thumbnail: cover7,
  },
  {
    title: "Lạc Trôi",
    artist: "Sơn Tùng M-TP",
    thumbnail: cover7,
  },
  {
    title: "Nơi Này Có Anh",
    artist: "Sơn Tùng M-TP",
    thumbnail: cover7,
  },
]);

watch(() => props.filters, (newVal) => {
  localFilters.value = { ...newVal };
}, { deep: true });

const playSong = (song) => {
  console.log("Phát bài hát:", song.title);
};

const handleSongAction = (action, song) => {
  console.log(`Thao tác "${action}" trên bài hát:`, song);
};

const handleCancel = () => {
  emit('update:modelValue', false);
};

const handleApply = () => {
  emit('update:filters', { ...localFilters.value });
  emit('apply-filter');
  emit('update:modelValue', false);
};
</script>

<style scoped>
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

.music-item {
  animation: fadeIn 0.3s ease-out forwards;
}

.music-item:nth-child(1) { animation-delay: 0.1s; }
.music-item:nth-child(2) { animation-delay: 0.15s; }
.music-item:nth-child(3) { animation-delay: 0.2s; }
.music-item:nth-child(4) { animation-delay: 0.25s; }
.music-item:nth-child(5) { animation-delay: 0.3s; }
.music-item:nth-child(6) { animation-delay: 0.35s; }

@media (max-width: 576px) {
	/* .music-modal :deep(.ant-modal) {
    width: 100% !important;
    max-width: 100vw;
    margin: 0;
    top: 0;
    padding: 10px;
  } */
  
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
}
</style>