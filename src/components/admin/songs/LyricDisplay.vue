<template>
  <div class="lyric-container" :class="effectiveTheme" ref="lyricContainer">
    <div
      class="lyric-line"
      v-for="(line, index) in parsedLyrics"
      :key="index"
      :class="{ 
        active: currentLineIndex === index,
        'pre-active': currentLineIndex === index - 1,
        'post-active': currentLineIndex === index + 1
      }"
      :ref="el => { if (el && currentLineIndex === index) activeLineRef = el }"
      @click="handleLyricClick(line.time)"
    >
      <span class="lyric-text">
        <span
          class="lyric-part"
          v-for="(part, partIndex) in line.parts"
          :key="`${index}-${partIndex}`"
          :class="{
            'karaoke-fill': currentLineIndex === index && partIndex === currentPartIndex,
            'karaoke-done': currentLineIndex === index && partIndex < currentPartIndex,
            'karaoke-waiting': currentLineIndex === index && partIndex > currentPartIndex
          }"
          :style="{ 'white-space': part.isWord ? 'normal' : 'pre' }"
        >
          {{ part.text }}
        </span>
      </span>
      <div v-if="line.translation" class="lyric-translation">
        {{ line.translation }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';

const props = defineProps({
  lyrics: String,
  currentTime: Number,
  theme: {
    type: String,
    default: 'neon-blue',
    validator: (value) => [
      'neon-blue', 
      'neon-pink', 
      'neon-green',
      'neon-purple',
      'neon-orange',
      'neon-red',
      'default'
    ].includes(value)
  },
  karaokeMode: Boolean
});

const emit = defineEmits(['seek', 'toggle-play']);

const playerStore = usePlayerStore();

const parsedLyrics = ref([]);
const currentLineIndex = ref(-1);
const currentPartIndex = ref(0);
const animationInProgress = ref(false);
const lyricContainer = ref(null);
const activeLineRef = ref(null);
const userScrolling = ref(false);
let scrollTimeout = null;
let lastUpdateTime = 0; // Thêm debounce để tránh update quá thường xuyên

const handleLyricClick = (time) => {  
  emit('seek', time);
};

const effectiveTheme = computed(() => {
  if (props.karaokeMode) {
    return 'neon-blue';
  }
  return props.theme || 'default';
});

const parseLyrics = (lrcText) => {
  const lines = lrcText.split('\n');
  const temp = [];

  lines.forEach(line => {
    const timeMatches = [...line.matchAll(/\[(\d+):(\d+\.\d+)\]/g)];
    if (!timeMatches.length) return;

    const text = line.replace(/\[(\d+):(\d+\.\d+)\]/g, '').trim();
    timeMatches.forEach(match => {
      const minutes = parseFloat(match[1]);
      const seconds = parseFloat(match[2]);
      const time = minutes * 60 + seconds;

      temp.push({ time, text });
    });
  });

  const merged = [];
  temp.forEach(({ time, text }) => {
    const last = merged[merged.length - 1];
    if (last && last.time === time) {
      last.translation = text;
    } else {
      merged.push({
        time,
        text,
        translation: null,
        parts: processLyricText(text)
      });
    }
  });

  return merged;
};

const processLyricText = (text) => {
  return text.split(/(\s+)/).filter(Boolean).map(part => ({
    text: part,
    isWord: !/^\s+$/.test(part),
    isSpace: /^\s+$/.test(part)
  }));
};

// Detect user scrolling
const handleScroll = () => {
  userScrolling.value = true;
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    userScrolling.value = false;
  }, 2000);
};

watch(() => props.lyrics, (newVal) => {
  if (newVal) {
    parsedLyrics.value = parseLyrics(newVal);
  }
}, { immediate: true });

watch(() => props.currentTime, (time) => {
  if (!parsedLyrics.value.length) return;

  // Debounce để tránh update quá thường xuyên
  const now = Date.now();
  if (now - lastUpdateTime < 50) return; // Chỉ update tối đa 20 lần/giây
  lastUpdateTime = now;

  let lineIndex = -1;
  for (let i = 0; i < parsedLyrics.value.length; i++) {
    if (parsedLyrics.value[i].time <= time) {
      lineIndex = i;
    } else {
      break;
    }
  }

  // Chỉ cập nhật khi thực sự thay đổi dòng
  if (lineIndex !== currentLineIndex.value) {
    currentLineIndex.value = lineIndex;
    currentPartIndex.value = 0;
    animationInProgress.value = true;
    setTimeout(() => {
      animationInProgress.value = false;
    }, 600);
  }

  if (lineIndex >= 0) {
    const line = parsedLyrics.value[lineIndex];
    const nextLine = lineIndex < parsedLyrics.value.length - 1 
      ? parsedLyrics.value[lineIndex + 1] 
      : null;

    const lineDuration = nextLine 
      ? nextLine.time - line.time 
      : 4;

    const elapsedInLine = time - line.time;
    const progress = Math.min(1, Math.max(0, elapsedInLine / lineDuration));

    const totalParts = line.parts.filter(p => p.isWord).length;
    let partsShown = Math.floor(totalParts * progress); // Dùng Math.floor thay vì Math.round
    partsShown = Math.max(0, Math.min(totalParts, partsShown));

    let wordCount = 0;
    let actualPartIndex = 0;
    for (let i = 0; i < line.parts.length; i++) {
      if (line.parts[i].isWord) wordCount++;
      if (wordCount > partsShown) break;
      actualPartIndex = i + 1;
    }

    // Chỉ cập nhật khi có thay đổi thực sự
    if (actualPartIndex !== currentPartIndex.value) {
      currentPartIndex.value = actualPartIndex;
    }

    // Smart auto-scroll với debounce
    if (!userScrolling.value) {
      nextTick(() => {
        if (activeLineRef.value && lyricContainer.value) {
          const container = lyricContainer.value;
          const activeLine = activeLineRef.value;
          
          const containerRect = container.getBoundingClientRect();
          const activeLineRect = activeLine.getBoundingClientRect();
          
          const isAbove = activeLineRect.top < containerRect.top;
          const isBelow = activeLineRect.bottom > containerRect.bottom;
          
          if (isAbove || isBelow) {
            const containerScrollTop = container.scrollTop;
            const activeLineOffsetTop = activeLine.offsetTop;
            const containerHeight = container.clientHeight;
            const activeLineHeight = activeLine.clientHeight;
            
            const targetScrollTop = activeLineOffsetTop - (containerHeight / 3) + (activeLineHeight / 2);
            
            container.scrollTo({
              top: Math.max(0, targetScrollTop),
              behavior: 'smooth'
            });
          }
        }
      });
    }
  }
});

// Add scroll event listener when component mounts
watch(lyricContainer, (newVal) => {
  if (newVal) {
    newVal.addEventListener('scroll', handleScroll, { passive: true });
  }
}, { immediate: true });
</script>

<style scoped>
.lyric-container {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 20px 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.85);
  perspective: 1000px;
  scroll-behavior: smooth;
}

.lyric-line {
  width: 90%;
  margin: 10px 0;
  padding: 8px 15px;
  opacity: 0.4;
  transition: all 0.5s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  font-size: 16px;
  line-height: 1.8;
  text-align: center;
  word-break: break-word;
  font-family: 'Arial', sans-serif;
  border-radius: 8px;
  transform: translateZ(-10px);
  cursor: pointer;
  filter: blur(1px);
}

.lyric-line.active {
  opacity: 1;
  transform: scale(1.05) translateZ(0);
  font-weight: 600;
  filter: blur(0);
  padding: 12px 20px;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.15);
}

.lyric-line.pre-active,
.lyric-line.post-active {
  opacity: 0.6;
  filter: blur(0.5px);
  transform: scale(1.02) translateZ(-5px);
}

.lyric-text {
  display: inline;
  white-space: pre-wrap;
}

.lyric-part {
  position: relative;
  display: inline-block;
  color: rgba(255, 255, 255, 0.9);
  padding-right: 1px;
  transition: color 0.3s ease, text-shadow 0.3s ease; /* Rút ngắn transition */
}

.lyric-translation {
  font-size: 12px;
  color: rgba(204, 204, 204, 0.8);
  margin-top: 8px;
  font-style: italic;
}

.default .lyric-line.active {
  background: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
}

/* Theme: Neon Blue */
.neon-blue .lyric-line.active {
  background: rgba(25, 25, 112, 0.2);
  box-shadow: 0 0 15px rgba(67, 97, 238, 0.4);
}

.neon-blue .karaoke-done {
  color: #4361ee !important;
  text-shadow: 0 0 10px rgba(67, 97, 238, 0.8),
               0 0 20px rgba(67, 97, 238, 0.6),
               0 0 30px rgba(67, 97, 238, 0.4);
  animation: none; /* Tắt animation pulsate để tránh flicker */
}

.neon-blue .karaoke-fill {
  color: #4361ee !important;
  text-shadow: 0 0 10px rgba(67, 97, 238, 0.8),
               0 0 20px rgba(67, 97, 238, 0.6),
               0 0 30px rgba(67, 97, 238, 0.4);
  animation: none; /* Tắt animation fill để tránh flicker */
}

/* Theme: Neon Pink */
.neon-pink .lyric-line.active {
  background: rgba(112, 25, 80, 0.2);
  box-shadow: 0 0 15px rgba(255, 20, 147, 0.4);
}

.neon-pink .karaoke-done {
  color: #ff3e96 !important;
  text-shadow: 0 0 10px rgba(255, 20, 147, 0.8),
               0 0 20px rgba(255, 20, 147, 0.6),
               0 0 30px rgba(255, 20, 147, 0.4);
  animation: none;
}

.neon-pink .karaoke-fill {
  color: #ff3e96 !important;
  text-shadow: 0 0 10px rgba(255, 20, 147, 0.8),
               0 0 20px rgba(255, 20, 147, 0.6),
               0 0 30px rgba(255, 20, 147, 0.4);
  animation: none;
}

/* Theme: Neon Green */
.neon-green .lyric-line.active {
  background: rgba(25, 112, 25, 0.2);
  box-shadow: 0 0 15px rgba(57, 255, 20, 0.4);
}

.neon-green .karaoke-done {
  color: #39ff14 !important;
  text-shadow: 0 0 10px rgba(57, 255, 20, 0.8),
               0 0 20px rgba(57, 255, 20, 0.6),
               0 0 30px rgba(57, 255, 20, 0.4);
  animation: none;
}

.neon-green .karaoke-fill {
  color: #39ff14 !important;
  text-shadow: 0 0 10px rgba(57, 255, 20, 0.8),
               0 0 20px rgba(57, 255, 20, 0.6),
               0 0 30px rgba(57, 255, 20, 0.4);
  animation: none;
}

/* Theme: Neon Purple */
.neon-purple .lyric-line.active {
  background: rgba(77, 25, 112, 0.2);
  box-shadow: 0 0 15px rgba(157, 78, 221, 0.4);
}

.neon-purple .karaoke-done {
  color: #9d4edd !important;
  text-shadow: 0 0 10px rgba(157, 78, 221, 0.8),
               0 0 20px rgba(157, 78, 221, 0.6),
               0 0 30px rgba(157, 78, 221, 0.4);
  animation: none;
}

.neon-purple .karaoke-fill {
  color: #9d4edd !important;
  text-shadow: 0 0 10px rgba(157, 78, 221, 0.8),
               0 0 20px rgba(157, 78, 221, 0.6),
               0 0 30px rgba(157, 78, 221, 0.4);
  animation: none;
}

/* Theme: Neon Orange */
.neon-orange .lyric-line.active {
  background: rgba(112, 66, 25, 0.2);
  box-shadow: 0 0 15px rgba(255, 158, 0, 0.4);
}

.neon-orange .karaoke-done {
  color: #ff9e00 !important;
  text-shadow: 0 0 10px rgba(255, 158, 0, 0.8),
               0 0 20px rgba(255, 158, 0, 0.6),
               0 0 30px rgba(255, 158, 0, 0.4);
  animation: none;
}

.neon-orange .karaoke-fill {
  color: #ff9e00 !important;
  text-shadow: 0 0 10px rgba(255, 158, 0, 0.8),
               0 0 20px rgba(255, 158, 0, 0.6),
               0 0 30px rgba(255, 158, 0, 0.4);
  animation: none;
}

/* Theme: Neon Red */
.neon-red .lyric-line.active {
  background: rgba(112, 25, 25, 0.2);
  box-shadow: 0 0 15px rgba(255, 0, 84, 0.4);
}

.neon-red .karaoke-done {
  color: #ff0054 !important;
  text-shadow: 0 0 10px rgba(255, 0, 84, 0.8),
               0 0 20px rgba(255, 0, 84, 0.6),
               0 0 30px rgba(255, 0, 84, 0.4);
  animation: none;
}

.neon-red .karaoke-fill {
  color: #ff0054 !important;
  text-shadow: 0 0 10px rgba(255, 0, 84, 0.8),
               0 0 20px rgba(255, 0, 84, 0.6),
               0 0 30px rgba(255, 0, 84, 0.4);
  animation: none;
}

/* Hover effects */
.lyric-line:hover {
  opacity: 0.8;
}

.lyric-line.active:hover {
  transform: scale(1.07);
}

/* Responsive design */
@media (max-width: 768px) {
  .lyric-line {
    font-size: 16px;
    width: 95%;
  }
  
  .lyric-translation {
    font-size: 12px;
  }
}
</style>