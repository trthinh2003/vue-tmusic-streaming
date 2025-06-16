<template>
  <div class="lyric-comment-container">
    <!-- Phần header với tabs -->
    <a-tabs v-model:activeKey="activeTab" class="header-tabs">
      <a-tab-pane key="lyric">
        <template #tab>
          <span class="custom-tab">
            <Icon icon="mdi:music-note" />
            <span>Lời bài hát</span>
          </span>
        </template>
        <LyricDisplay 
          v-if="currentLyric" 
          :lyrics="currentLyric" 
          :current-time="currentAudioTime"
          :karaoke-mode="karaokeMode"
          @seek="handleSeek"
        />
        <a-empty v-else description="Không có lời bài hát" />
      </a-tab-pane>
      
      
      <a-tab-pane key="comments">
        <template #tab>
          <span class="custom-tab">
            <Icon icon="mdi:comment-text-outline" />
            <span>Bình luận</span>
          </span>
        </template>
        <CommentSection 
          :song-id="currentSong.id"
          :current-user="currentUser"
        />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import LyricDisplay from './LyricDisplay.vue';
import CommentSection from './CommentSection.vue';

const props = defineProps({
  currentLyric: String,
  currentAudioTime: Number,
  currentSong: Object,
  karaokeMode: Boolean
});

const emit = defineEmits(['seek-lyric']);

const activeTab = ref('lyric');
const currentUser = ref({
  id: 1,
  name: 'Người dùng',
  avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
});

// const handleKaraokeToggle = (checked) => {
//   console.log('Karaoke mode:', checked);
//   // Tùy nhu cầu, có thể emit ra ngoài hoặc truyền cho LyricDisplay
// };
watch(() => props.karaokeMode, (newVal) => {
  // console.log('karaokeMode changed:', newVal);
  // Gọi logic hiệu ứng karaoke tại đây
});

const handleSeek = (time) => {
  emit('seek-lyric', time);
};
</script>

<style scoped>
:deep(.ant-tabs .ant-tabs-tab-btn) {
    color: #fff;
}

.lyric-comment-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header-tabs {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:deep(.ant-tabs-nav) {
  margin: 0;
  padding: 0 16px;
  position: sticky;
  top: 0;
  background: rgba(26, 26, 46, 0.9);
  z-index: 1;
}

:deep(.ant-tabs-content) {
  flex: 1;
  overflow: auto;
}

:deep(.ant-tabs-content) {
  overflow-y: scroll;
  height: 100%;
}

.custom-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.custom-tab .iconify {
  font-size: 16px;
  margin-right: 4px;
}
</style>