<template>
  <a-dropdown :trigger="['click']" placement="bottomRight">
    <a class="action-btn" @click.prevent.stop>
      <more-outlined />
    </a>
    <template #overlay>
      <a-menu @click="(e) => handleAction(e.key)">
        <a-menu-item key="add" class="add-to-playlist-dropdown">
          <template #icon><plus-outlined /></template>
          Thêm vào playlist
        </a-menu-item>
        <a-menu-item key="download" :class="['download-dropdown', { 'downloaded': isDownloaded }]">
          <template #icon>
            <check-outlined v-if="isDownloaded"/>
            <download-outlined v-else />
          </template>
          {{ isDownloaded ? 'Đã tải xuống' : 'Tải xuống' }}
        </a-menu-item>
        <a-menu-item key="share" class="share-dropdown">
          <template #icon><share-alt-outlined /></template>
          Chia sẻ
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup>
import { 
  MoreOutlined, PlusOutlined, 
  DownloadOutlined, ShareAltOutlined, CheckOutlined 
} from '@ant-design/icons-vue';

const props = defineProps({
  song: {
    type: Object,
    required: true
  },
  isDownloaded: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['action']);

const handleAction = (actionKey) => {
  emit('action', actionKey, props.song);
};
</script>

<style scoped>
:deep(.anticon) {
  margin-right: 8px;
  font-size: 1.45rem;
  color: rgba(255, 255, 255, 0.65);
}

:deep(.anticon):hover {
  color: #fff;
}
</style>

<style>
.add-to-playlist-dropdown .anticon {
  color: #000;
}
.add-to-playlist-dropdown .anticon:hover {
  color: #968383;
}
.download-dropdown .anticon {
  color: #000;
}
.download-dropdown .anticon:hover {
  color: #968383;
}
.share-dropdown .anticon {
  color: #000;
}
.share-dropdown .anticon:hover {
  color: #968383;
}
</style>