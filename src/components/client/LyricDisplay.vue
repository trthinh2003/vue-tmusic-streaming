<template>
  <div class="lyric-container">
    <div class="lyric-line" v-for="(line, index) in parsedLyrics" :key="index"
      :class="{ active: currentLineIndex === index }">
      <span class="lyric-text">
        <span class="lyric-part" v-for="(part, partIndex) in line.parts" :key="partIndex"
          :style="{ color: partIndex < currentPartIndex ? highlightedColor : normalColor, 
                   textShadow: partIndex < currentPartIndex ? '0 0 10px rgba(67, 97, 238, 0.8)' : '' }">
          {{ part.text }}
        </span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  lyrics: String,
  currentTime: Number,
});

const normalColor = ref('#ffffff');
const highlightedColor = ref('#4361ee');
const parsedLyrics = ref([]);
const currentLineIndex = ref(-1);
const currentPartIndex = ref(0);

const parseLyrics = (lrcText) => {
  const lines = lrcText.split('\n');
  const result = [];

  lines.forEach(line => {
    if (!line.trim() || !line.includes(']')) return;

    const timeMatch = line.match(/^\[(\d+):(\d+\.\d+)\]/);
    if (!timeMatch) return;

    const minutes = parseFloat(timeMatch[1]);
    const seconds = parseFloat(timeMatch[2]);
    const time = minutes * 60 + seconds;
    const text = line.replace(timeMatch[0], '').trim();

    const parts = text.split(/(\s+)/).map(part => {
      return { text: part };
    });

    result.push({ time, text, parts });
  });

  result.sort((a, b) => a.time - b.time);
  return result;
};

watch(() => props.lyrics, (newVal) => {
  if (newVal) {
    parsedLyrics.value = parseLyrics(newVal);
  }
}, { immediate: true });

watch(() => props.currentTime, (time) => {
  if (!parsedLyrics.value.length) return;

  let lineIndex = -1;
  for (let i = 0; i < parsedLyrics.value.length; i++) {
    if (parsedLyrics.value[i].time <= time) {
      lineIndex = i;
    } else {
      break;
    }
  }

  currentLineIndex.value = lineIndex;

  if (lineIndex >= 0) {
    const line = parsedLyrics.value[lineIndex];
    const lineDuration = lineIndex < parsedLyrics.value.length - 1
      ? parsedLyrics.value[lineIndex + 1].time - line.time
      : 2;

    const elapsedInLine = time - line.time;
    const progress = elapsedInLine / lineDuration;

    const totalChars = line.text.length;
    let charsShown = Math.floor(totalChars * progress);
    charsShown = Math.max(1, Math.min(totalChars, charsShown));

    let accumulated = 0;
    currentPartIndex.value = 0;

    for (let i = 0; i < line.parts.length; i++) {
      accumulated += line.parts[i].text.length;
      if (accumulated <= charsShown) {
        currentPartIndex.value = i + 1;
      } else {
        break;
      }
    }
    
    // Cập nhật phần cuối của lyric (để "tôi" cũng hiển thị)
    if (lineIndex === parsedLyrics.value.length - 1) {
      const remainingChars = totalChars - accumulated;
      if (remainingChars > 0) {
        currentPartIndex.value = line.parts.length; // Đảm bảo tất cả các phần cuối cùng được hiển thị.
      }
    }
  }
});
</script>

<style scoped>
.lyric-container {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lyric-line {
  margin: 10px 0;
  padding: 4px 12px;
  opacity: 0.6;
  transition: all 0.3s ease;
  font-size: 18px;
  line-height: 1.6;
  word-break: break-word;
  font-family: 'Arial', sans-serif;
}

.lyric-line.active {
  opacity: 1;
  transform: scale(1.03);
  font-weight: 600;
  color: #ffffff;
}

.lyric-text {
  display: inline;
  white-space: pre-wrap;
}

.lyric-part {
  display: inline;
  transition: color 0.3s ease, text-shadow 0.3s ease;
  white-space: pre-wrap;
}

.lyric-part:hover {
  text-decoration: underline;
}
</style>
