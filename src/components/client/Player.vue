<template>
    <div class="player">
        <div class="song-info">
            <img :src="currentSong.cover" alt="Album cover" class="album-cover">
            <h2>{{ currentSong.title }}</h2>
            <p>{{ currentSong.artist }}</p>
        </div>

        <div class="progress-container">
            <span class="time current">{{ formatTime(currentTime) }}</span>
            <div class="progress-bar" @click="seekAudio" ref="progressBar">
                <div class="progress" :style="{ width: progressPercentage + '%' }"></div>
            </div>
            <span class="time duration">{{ formatTime(duration) }}</span>
        </div>

        <div class="controls">
            <button @click="toggleShuffle" :class="{ active: isShuffled }" title="Phát ngẫu nhiên">
                <Icon icon="mdi:shuffle" width="32" height="32" />
            </button>

            <button @click="$emit('prev-song')" title="Bài trước">
                <i class="fa-solid fa-backward-fast"></i>
            </button>

            <button @click="seekBackward" title="Lùi 10 giây">
                <i class="fa-solid fa-backward"></i>
            </button>

            <button @click="$emit('toggle-play')" class="play-pause" title="Phát/Tạm dừng">
                {{ isPlaying ? '⏸' : '⏵' }}
            </button>

            <button @click="seekForward" title="Tới 10 giây">
                <i class="fa-solid fa-forward"></i>
            </button>

            <button @click="$emit('next-song')" title="Bài tiếp">
                <i class="fa-solid fa-forward-fast"></i>
            </button>

            <button @click="toggleLoop" :class="{ active: isLooping }" title="Lặp lại">
                <Icon :icon="isLooping ? 'mdi:repeat-once' : 'mdi:repeat'" width="32" height="32" />
            </button>
        </div>

        <div class="volume-control">
            <span class="volume-icon">🔊</span>
            <input type="range" min="0" max="1" step="0.01" v-model="volume" @input="changeVolume"
                class="volume-slider">
            <span class="volume-percent">{{ Math.round(volume * 100) }}%</span>
        </div>

        <audio ref="audioPlayer" :src="currentSong.audio" @ended="handleSongEnd" @timeupdate="updateProgress"
            @loadedmetadata="updateDuration" @volumechange="updateVolume"></audio>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue';

component: {
    Icon
}

const props = defineProps({
    currentSong: Object,
    isPlaying: Boolean,
    playlist: Array
})

const emit = defineEmits([
    'toggle-play',
    'next-song',
    'prev-song',
    'update-shuffle',
    'update-playlist'
])

const audioPlayer = ref(null)
const progressBar = ref(null)
const currentTime = ref(0)
const duration = ref(0)
const progressPercentage = ref(0)
const volume = ref(0.7)
const isLooping = ref(false)
const isShuffled = ref(false)

// Format thời gian (phút:giây)
const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

// Cập nhật tiến trình khi phát nhạc
const updateProgress = () => {
    currentTime.value = audioPlayer.value.currentTime
    progressPercentage.value = (currentTime.value / duration.value) * 100
}

// Cập nhật thời lượng bài hát
const updateDuration = () => {
    duration.value = audioPlayer.value.duration
}

// Nhảy đến vị trí click trên thanh progress
const seekAudio = (e) => {
    const progressBarWidth = progressBar.value.clientWidth
    const clickPosition = e.offsetX
    const percentage = (clickPosition / progressBarWidth) * 100
    progressPercentage.value = percentage
    audioPlayer.value.currentTime = (percentage / 100) * duration.value
}

// Tua nhanh 10 giây
const seekForward = () => {
    audioPlayer.value.currentTime += 10
}

// Tua lùi 10 giây
const seekBackward = () => {
    audioPlayer.value.currentTime = Math.max(0, audioPlayer.value.currentTime - 10)
}

// Điều chỉnh âm lượng
const changeVolume = () => {
    audioPlayer.value.volume = volume.value
}

// Cập nhật âm lượng khi thay đổi từ nguồn khác
const updateVolume = () => {
    volume.value = audioPlayer.value.volume
}

// Bật/tắt chế độ lặp
const toggleLoop = () => {
    isLooping.value = !isLooping.value
    audioPlayer.value.loop = isLooping.value
}

// Bật/tắt chế độ phát ngẫu nhiên
const toggleShuffle = () => {
    isShuffled.value = !isShuffled.value
    emit('update-shuffle', isShuffled.value)
}

// Xử lý khi bài hát kết thúc
const handleSongEnd = () => {
    if (!isLooping.value) {
        emit('next-song')
    }
}

// Xử lý khi component được mount
onMounted(() => {
    if (audioPlayer.value) {
        audioPlayer.value.volume = volume.value
    }
})

// Dọn dẹp khi component unmount
onUnmounted(() => {
    if (audioPlayer.value) {
        audioPlayer.value.pause()
        audioPlayer.value = null
    }
})

watch(() => props.isPlaying, (newVal) => {
    if (!audioPlayer.value) return

    if (newVal) {
        audioPlayer.value.play().catch(e => {
            console.error("Lỗi phát nhạc:", e)
            emit('toggle-play')
        })
    } else {
        audioPlayer.value.pause()
    }
})

watch(() => props.currentSong, () => {
    if (!audioPlayer.value) return

    // Reset progress khi chuyển bài
    currentTime.value = 0
    progressPercentage.value = 0

    if (props.isPlaying) {
        // Đợi DOM cập nhật trước khi phát
        setTimeout(() => {
            audioPlayer.value.play().catch(e => {
                console.error("Lỗi phát nhạc:", e)
                emit('toggle-play')
            })
        }, 100)
    }
})
</script>

<style scoped>
.player {
    text-align: center;
    padding: 20px;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    background: #fff;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.album-cover {
    width: 250px;
    height: 250px;
    border-radius: 10px;
    margin-bottom: 20px;
    object-fit: cover;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s;
}

.album-cover:hover {
    transform: scale(1.02);
}

.song-info h2 {
    margin: 10px 0 5px;
    font-size: 1.5rem;
    color: #333;
}

.song-info p {
    color: #666;
    margin-bottom: 20px;
    font-size: 1.1rem;
}

.progress-container {
    display: flex;
    align-items: center;
    margin: 25px 0;
}

.progress-bar {
    flex: 1;
    height: 6px;
    background: #e0e0e0;
    border-radius: 3px;
    cursor: pointer;
    margin: 0 15px;
    position: relative;
    transition: height 0.2s;
}

.progress-bar:hover {
    height: 8px;
}

.progress {
    height: 100%;
    background: #42b983;
    border-radius: 3px;
    transition: width 0.1s linear;
}

.time {
    font-size: 0.9rem;
    color: #666;
    min-width: 40px;
}

.controls {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 25px 0;
    flex-wrap: wrap;
    gap: 10px;
}

.controls button {
    background: #f5f5f5;
    color: #333;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.controls button:hover {
    background: #42b983;
    color: white;
    transform: scale(1.05);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.controls button:active {
    transform: scale(0.95);
}

.controls button.active {
    background: #42b983;
    color: white;
}

.play-pause {
    width: 60px !important;
    height: 60px !important;
    font-size: 24px !important;
    background: #42b983 !important;
    color: white !important;
}

.volume-control {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
    gap: 10px;
}

.volume-icon {
    font-size: 1.2rem;
    color: #666;
}

.volume-slider {
    width: 100px;
    height: 6px;
    --webkit-appearance: none;
    background: #e0e0e0;
    border-radius: 3px;
    outline: none;
    cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 15px;
    height: 15px;
    background: #42b983;
    border-radius: 50%;
    cursor: pointer;
}

.volume-percent {
    font-size: 0.9rem;
    color: #666;
    min-width: 40px;
    text-align: left;
}

@media (max-width: 600px) {
    .album-cover {
        width: 200px;
        height: 200px;
    }

    .controls {
        gap: 5px;
    }

    .controls button {
        width: 45px;
        height: 45px;
        font-size: 18px;
    }

    .play-pause {
        width: 55px !important;
        height: 55px !important;
    }
}
</style>