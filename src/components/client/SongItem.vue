<!-- SongItem.vue -->
<template>
  <li 
    class="song-item" 
    :class="{ 'active': isCurrent }"
    @click.stop="emitSelectSong"
  >
    <img :src="song.cover" alt="Cover" class="song-cover">
    <div class="song-details">
      <h3>{{ song.title }}</h3>
      <p class="text-white">{{ song.artist }}</p>
    </div>
    <span class="duration text-white">{{ song.duration }}</span>
    
    <div class="song-actions">
      <button 
        class="action-btn"
        @click.stop="toggleActionsMenu"
        aria-label="Song actions"
      >
        <Icon icon="mdi:dots-vertical" />
      </button>
      
      <div v-if="showActionsMenu" class="actions-menu" v-click-outside="closeActionsMenu">
        <button 
          class="menu-item"
          @click.stop="emitRemoveFromPlaylist"
        >
          <Icon icon="mdi:delete" class="mr-1" />
          Xóa khỏi playlist
        </button>
        <button 
          class="menu-item"
          @click.stop="emitAddToPlaylist"
        >
          <Icon icon="mdi:playlist-plus" class="mr-1" />
          Thêm vào playlist khác
        </button>
        <button 
          class="menu-item"
          @click.stop="emitPlayNext"
        >
          <Icon icon="mdi:play-next" class="mr-1" />
          Phát tiếp theo
        </button>
      </div>
    </div>
  </li>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { ref } from 'vue';

const props = defineProps({
  song: Object,
  isCurrent: Boolean
});

const emit = defineEmits([
  'select-song',
  'remove-from-playlist',
  'add-to-playlist',
  'play-next'
]);

const showActionsMenu = ref(false);

const toggleActionsMenu = () => {
  showActionsMenu.value = !showActionsMenu.value;
};

const closeActionsMenu = () => {
  showActionsMenu.value = false;
};

const emitSelectSong = () => {
  emit('select-song', props.song);
};

const emitRemoveFromPlaylist = () => {
  emit('remove-from-playlist', props.song);
  closeActionsMenu();
};

const emitAddToPlaylist = () => {
  emit('add-to-playlist', props.song);
  closeActionsMenu();
};

const emitPlayNext = () => {
  emit('play-next', props.song);
  closeActionsMenu();
};

// Directive để đóng menu khi click bên ngoài
const vClickOutside = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent);
  }
};
</script>

<style scoped>
.song-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin: 5px -15px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.song-item.active {
  background: rgba(66, 185, 131, 0.3);
}

.song-cover {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  margin-right: 15px;
  object-fit: cover;
}

.song-details {
  flex: 1;
  min-width: 0;
}

.song-details h3 {
  font-size: 16px;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-details p {
  font-size: 14px;
  color: #aaa;
}

.duration {
  color: #aaa;
  margin: 0 15px;
}

.song-actions {
  position: relative;
}

.action-btn {
  background: transparent;
  border: none;
  color: #aaa;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.actions-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: #333;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  z-index: 100;
  min-width: 180px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: white;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-item .mr-1 {
  margin-right: 8px;
}
</style>