<template>
  <div class="lyric-container">
    <div
      class="lyric-line"
      v-for="(line, index) in parsedLyrics"
      :key="index"
      :class="{ active: currentLineIndex === index }"
      @click="handleLyricClick(line.time)"
    >
      <span class="lyric-text">
        <span
          class="lyric-part"
          v-for="(part, partIndex) in line.parts"
          :key="partIndex"
          :style="{
            color: currentLineIndex === index && partIndex < currentPartIndex
              ? highlightedColor
              : normalColor,
            textShadow: currentLineIndex === index && partIndex < currentPartIndex
              ? '0 0 10px rgba(67, 97, 238, 0.8)'
              : '',
            'white-space': part.isWord ? 'normal' : 'pre'
          }"
        >
          {{ part.text }}
        </span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  lyrics: String,
  currentTime: Number,
});

const emit = defineEmits(['seek']); //->Truy vết dòng click để hiển thị mốc thời gian của bài hát

const normalColor = ref('#ffffff');
const highlightedColor = ref('#4361ee');
const parsedLyrics = ref([]);
const currentLineIndex = ref(-1);
const currentPartIndex = ref(0);

const handleLyricClick = (time) => {
  emit('seek', time); // Phát ra sự kiện seek với thời gian tương ứng
  console.log(time);
};

const parseLyrics = (lrcText) => {
  const lines = lrcText.split('\n');
  const result = [];

  lines.forEach(line => {
    if (!line.trim()) return;

    // Xử lý nhiều timestamp (cho các dòng lặp lại)
    const timeMatches = [...line.matchAll(/\[(\d+):(\d+\.\d+)\]/g)];
    if (!timeMatches.length) return;

    const text = line.replace(/\[(\d+):(\d+\.\d+)\]/g, '').trim();
    if (!text) return; // Bỏ qua dòng chỉ có timestamp không có lời

    timeMatches.forEach(match => {
      const minutes = parseFloat(match[1]);
      const seconds = parseFloat(match[2]);
      const time = minutes * 60 + seconds;

      // Chia thành các từ và giữ lại khoảng trắng
      const words = text.split(/(\s+)/).filter(part => part);
      const parts = words.map(word => ({
        text: word,
        isSpace: /^\s+$/.test(word)
      }));

      result.push({ time, text, parts });
    });
  });

  // Sắp xếp theo thời gian
  result.sort((a, b) => a.time - b.time);
  
  // Gộp các dòng trùng lặp
  const uniqueResult = [];
  result.forEach(item => {
    const existing = uniqueResult.find(i => i.time === item.time);
    if (!existing) {
      uniqueResult.push(item);
    }
  });
  
  return uniqueResult;
};

watch(() => props.lyrics, (newVal) => {
  if (newVal) {
    parsedLyrics.value = parseLyrics(newVal);
  }
}, { immediate: true });

watch(() => props.currentTime, (time) => {
  if (!parsedLyrics.value.length) return;

  // Tìm dòng có thời gian lớn nhất nhưng nhỏ hơn currentTime
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
    currentPartIndex.value = 0; // Reset phần từ khi chuyển dòng
  }

  if (lineIndex >= 0) {
    const line = parsedLyrics.value[lineIndex];
    const nextLine = lineIndex < parsedLyrics.value.length - 1 
      ? parsedLyrics.value[lineIndex + 1] 
      : null;

    const lineDuration = nextLine 
      ? nextLine.time - line.time 
      : 4; // Thời gian mặc định cho dòng cuối

    const elapsedInLine = time - line.time;
    const progress = Math.min(1, elapsedInLine / lineDuration);

    const totalParts = line.parts.filter(p => !p.isSpace).length;
    let partsShown = Math.round(totalParts * progress);
    partsShown = Math.max(0, Math.min(totalParts, partsShown));

    // Tính currentPartIndex bao gồm cả khoảng trắng
    let charCount = 0;
    let actualPartIndex = 0;
    for (let i = 0; i < line.parts.length; i++) {
      if (!line.parts[i].isSpace) charCount++;
      if (charCount >= partsShown) {
        actualPartIndex = i + 1;
        break;
      }
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

@media (max-width: 576px) {
  .lyric-line {
    font-size: 14px;
  }
}
</style>