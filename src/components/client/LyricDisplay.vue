<template>
  <div class="lyric-container" :class="effectiveTheme">
    <div
      class="lyric-line"
      v-for="(line, index) in parsedLyrics"
      :key="index"
      :class="{ 
        active: currentLineIndex === index,
        'pre-active': currentLineIndex === index - 1,
        'post-active': currentLineIndex === index + 1
      }"
      @click="handleLyricClick(line.time)"
    >
      <span class="lyric-text">
        <span
          class="lyric-part"
          v-for="(part, partIndex) in line.parts"
          :key="partIndex"
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
  <div class="is-playing-btn" @click="togglePlayPause">
    <i :class="[isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play']"></i>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue';

const props = defineProps({
  lyrics: String,
  currentTime: Number,
  theme: {
    type: String,
    default: '' // neon-blue, neon-pink, neon-green
  },
  karaokeMode: Boolean
});

const emit = defineEmits(['seek', 'toggle-play']);

const isPlaying = ref(true);
const parsedLyrics = ref([]);
const currentLineIndex = ref(-1);
const currentPartIndex = ref(0);
const animationInProgress = ref(false);

const togglePlayPause = () => {
  isPlaying.value = !isPlaying.value;
  emit('toggle-play', isPlaying.value);
};

const handleLyricClick = (time) => {
  emit('seek', time);
};

const effectiveTheme = computed(() => {
  if (props.karaokeMode) {
    return 'neon-blue'; // hoặc đổi thành theme khác nếu cần
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

  // Gom các dòng trùng thời gian
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

watch(() => props.lyrics, (newVal) => {
  if (newVal) {
    parsedLyrics.value = parseLyrics(newVal);
  }
}, { immediate: true });

watch(() => props.currentTime, (time) => {
  if (!parsedLyrics.value.length) return;

  // Tìm dòng có thời gian lớn nhất < currentTime
  let lineIndex = -1;
  for (let i = 0; i < parsedLyrics.value.length; i++) {
    if (parsedLyrics.value[i].time <= time) {
      lineIndex = i;
    } else {
      break;
    }
  }

  if (lineIndex !== currentLineIndex.value) {
    currentLineIndex.value = lineIndex;
    currentPartIndex.value = 0; // Reset từ khi chuyển dòng
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
    const progress = Math.min(1, elapsedInLine / lineDuration);

    // Tính số từ hiển thị dựa trên tiến độ
    const totalParts = line.parts.filter(p => p.isWord).length;
    let partsShown = Math.round(totalParts * progress);
    partsShown = Math.max(0, Math.min(totalParts, partsShown));

    // Tính currentPartIndex bao gồm cả khoảng trắng
    let wordCount = 0;
    let actualPartIndex = 0;
    for (let i = 0; i < line.parts.length; i++) {
      if (line.parts[i].isWord) wordCount++;
      if (wordCount > partsShown) break;
      actualPartIndex = i + 1;
    }

    currentPartIndex.value = actualPartIndex;

    // Tự động cuộn đến dòng hiện tại
    nextTick(() => {
      const activeLine = document.querySelector('.lyric-line.active');
      if (activeLine) {
        activeLine.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    });
  }
});
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
  transition: all 0.3s ease;
}

.lyric-translation {
  font-size: 14px;
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
  color: #4361ee;
  text-shadow: 0 0 10px rgba(67, 97, 238, 0.8),
               0 0 20px rgba(67, 97, 238, 0.6),
               0 0 30px rgba(67, 97, 238, 0.4);
  animation: pulsateBlue 1.5s infinite alternate;
}

.neon-blue .karaoke-fill {
  animation: fillTextBlue 0.8s ease-out forwards;
}

/* Theme: Neon Pink */
.neon-pink .lyric-line.active {
  background: rgba(112, 25, 80, 0.2);
  box-shadow: 0 0 15px rgba(255, 20, 147, 0.4);
}

.neon-pink .karaoke-done {
  color: #ff3e96;
  text-shadow: 0 0 10px rgba(255, 20, 147, 0.8),
               0 0 20px rgba(255, 20, 147, 0.6),
               0 0 30px rgba(255, 20, 147, 0.4);
  animation: pulsatePink 1.5s infinite alternate;
}

.neon-pink .karaoke-fill {
  animation: fillTextPink 0.8s ease-out forwards;
}

/* Theme: Neon Green */
.neon-green .lyric-line.active {
  background: rgba(25, 112, 25, 0.2);
  box-shadow: 0 0 15px rgba(57, 255, 20, 0.4);
}

.neon-green .karaoke-done {
  color: #39ff14;
  text-shadow: 0 0 10px rgba(57, 255, 20, 0.8),
               0 0 20px rgba(57, 255, 20, 0.6),
               0 0 30px rgba(57, 255, 20, 0.4);
  animation: pulsateGreen 1.5s infinite alternate;
}

.neon-green .karaoke-fill {
  animation: fillTextGreen 0.8s ease-out forwards;
}

/* Hover effects */
.lyric-line:hover {
  opacity: 0.8;
  transform: scale(1.02);
}

.lyric-line.active:hover {
  transform: scale(1.07);
}

/* Animation keyframes */
@keyframes pulsateBlue {
  0% {
    text-shadow: 0 0 10px rgba(67, 97, 238, 0.8),
                 0 0 20px rgba(67, 97, 238, 0.6),
                 0 0 30px rgba(67, 97, 238, 0.4);
  }
  100% {
    text-shadow: 0 0 15px rgba(67, 97, 238, 0.9),
                 0 0 25px rgba(67, 97, 238, 0.7),
                 0 0 35px rgba(67, 97, 238, 0.5),
                 0 0 45px rgba(67, 97, 238, 0.3);
  }
}

@keyframes pulsatePink {
  0% {
    text-shadow: 0 0 10px rgba(255, 20, 147, 0.8),
                 0 0 20px rgba(255, 20, 147, 0.6),
                 0 0 30px rgba(255, 20, 147, 0.4);
  }
  100% {
    text-shadow: 0 0 15px rgba(255, 20, 147, 0.9),
                 0 0 25px rgba(255, 20, 147, 0.7),
                 0 0 35px rgba(255, 20, 147, 0.5),
                 0 0 45px rgba(255, 20, 147, 0.3);
  }
}

@keyframes pulsateGreen {
  0% {
    text-shadow: 0 0 10px rgba(57, 255, 20, 0.8),
                 0 0 20px rgba(57, 255, 20, 0.6),
                 0 0 30px rgba(57, 255, 20, 0.4);
  }
  100% {
    text-shadow: 0 0 15px rgba(57, 255, 20, 0.9),
                 0 0 25px rgba(57, 255, 20, 0.7),
                 0 0 35px rgba(57, 255, 20, 0.5),
                 0 0 45px rgba(57, 255, 20, 0.3);
  }
}

@keyframes fillTextBlue {
  0% {
    color: rgba(255, 255, 255, 0.9);
    text-shadow: none;
  }
  100% {
    color: #4361ee;
    text-shadow: 0 0 10px rgba(67, 97, 238, 0.8),
                 0 0 20px rgba(67, 97, 238, 0.6),
                 0 0 30px rgba(67, 97, 238, 0.4);
  }
}

@keyframes fillTextPink {
  0% {
    color: rgba(255, 255, 255, 0.9);
    text-shadow: none;
  }
  100% {
    color: #ff3e96;
    text-shadow: 0 0 10px rgba(255, 20, 147, 0.8),
                 0 0 20px rgba(255, 20, 147, 0.6),
                 0 0 30px rgba(255, 20, 147, 0.4);
  }
}

@keyframes fillTextGreen {
  0% {
    color: rgba(255, 255, 255, 0.9);
    text-shadow: none;
  }
  100% {
    color: #39ff14;
    text-shadow: 0 0 10px rgba(57, 255, 20, 0.8),
                 0 0 20px rgba(57, 255, 20, 0.6),
                 0 0 30px rgba(57, 255, 20, 0.4);
  }
}

.is-playing-btn {
  position: fixed;
  color: var(--accent-color);
  bottom: 10px;
  right: 10px;
  z-index: 1000;
  padding: 12px 16px;
  border-radius: 50%;
  background: rgba(148, 209, 224, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.is-playing-btn:hover {
  background: rgba(148, 209, 224, 0.8);
  transform: scale(1.1);
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