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
      <p class="text-white">{{ $truncateWords(song.artist, 2) }}</p>
    </div>
    <span class="duration text-white">{{ song.duration }}</span>
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
  padding: 8px 20px;
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
  text-overflow: ellipsis;
}

.duration {
  color: #aaa;
  margin: 0 15px;
}
</style>