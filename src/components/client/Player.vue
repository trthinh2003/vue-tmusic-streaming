<template>
	<div class="player">
		<div class="disc-container">
			<div class="disc" :class="{ 'is-playing': props.isPlaying }">
				<img :src="currentSong.cover" alt="Album cover" class="album-cover" />
			</div>
			<div class="song-info">
				<h2>{{ currentSong.title }}</h2>
				<p>{{ currentSong.artist }}</p>
			</div>
			<button class="download-btn position-absolute" 
				@click.stop="showDownloadModal" 
				:class="{ 'downloaded': hasDownloaded }"
				:disabled="downloadLoading"
				style="top:0; right:0;"
				:title="hasDownloaded ? 'Đã tải xuống' : 'Tải xuống'"
			>
				<i class="fa-solid fa-spinner fa-spin" v-if="downloadLoading"></i>
				<i class="fa-solid fa-download" v-else-if="!hasDownloaded"></i>
				<i class="fa-solid fa-check" v-else></i>
			</button>
			<button
				class="favorite-btn position-absolute"
				@click.stop="handleToggleFavorite"
				:class="{ 'is-favorite': props.isFavorite }"
				:disabled="favoriteLoading"
				title="Yêu thích"
			>
				<i class="fa-solid fa-heart" v-if="!favoriteLoading"></i>
				<i class="fa-solid fa-spinner fa-spin" v-else></i>
			</button>
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
				<i :class="isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'"></i>
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
			<span class="volume-icon"><i class="fa-solid fa-volume-high"></i></span>
			<input type="range" min="0" max="1" step="0.01" v-model="volume" @input="changeVolume" class="volume-slider">
			<span class="volume-percent">{{ Math.round(volume * 100) }}%</span>
		</div>

		<div v-if="isLyricsVisible" class="lyrics-container">
			<p>{{ currentSong.lyrics }}</p>
		</div>

		<audio ref="audioPlayer" :src="currentSong.audio" @ended="handleSongEnd" @timeupdate="updateProgress"
			@loadedmetadata="updateDuration" @volumechange="updateVolume">
		</audio>

		<!-- Modal tải xuống -->
		<DownloadModal :is-visible="isDownloadModalVisible" :song="currentSong" @close="closeDownloadModal"
			@download="handleDownload" />
	</div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { Icon } from '@iconify/vue';
import DownloadModal from '@/components/client/modals/DownloadModal.vue';
import { toggleFavorite as toggleFavoriteAPI } from '@/services/favoriteService';
import { historyService } from '@/services/historyService'
import { useFavoriteStore } from '@/stores/useFavoriteStore'
import { downloadService } from '@/services/downloadService'
import { usePlayerStore } from '@/stores/playerStore';

const props = defineProps({
	currentSong: Object,
	isPlaying: Boolean,
	playlist: Array,
	isFavorite: Boolean
})

const emit = defineEmits([
	'toggle-play',
	'next-song',
	'prev-song',
	'update-shuffle',
	'update-playlist',
	'timeupdate',
	'update-song',
	'favorite-updated',
	'update-favorite'
])

let hasSentHistory = false;

const audioPlayer = ref(null)
const progressBar = ref(null)
const currentTime = ref(0)
const duration = ref(0)
const progressPercentage = ref(0)
const volume = ref(0.7)
const isLooping = ref(false)
const isShuffled = ref(false)
const isLyricsVisible = ref(false)
const isDownloadModalVisible = ref(false)

const playerStore = usePlayerStore();
const isPlaying = computed({
  get: () => playerStore.isPlaying,
  set: (value) => playerStore.setPlayingState(value)
});

const favoriteStore = useFavoriteStore()

const isCurrentSongFavorite = computed(() => {
  if (!props.currentSong?.id) return false
  return favoriteStore.isFavorite(props.currentSong.id)
})
const favoriteLoading = computed(() => favoriteStore.loading);
const handleToggleFavorite = async () => {
  if (!props.currentSong?.id) return

  try {
    const newStatus = await favoriteStore.toggle(props.currentSong.id)
    emit('favorite-updated', props.currentSong.id, newStatus)
  } catch (error) {
    console.error('Toggle favorite error:', error)
  }
}
// Format thời gian (phút:giây)
const formatTime = (time) => {
	const minutes = Math.floor(time / 60)
	const seconds = Math.floor(time % 60)
	return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

// Cập nhật tiến trình khi phát nhạc
const updateProgress = () => {
	if (!audioPlayer.value) return;
	if (!audioPlayer.value.duration) return; 
	
	currentTime.value = audioPlayer.value.currentTime
	progressPercentage.value = (currentTime.value / audioPlayer.value.duration) * 100
	emit('timeupdate', currentTime.value)
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
	if (!audioPlayer.value) return;
	audioPlayer.value.currentTime = (percentage / 100) * duration.value
}

// Toggle favorite với BE
const toggleFavorite = async () => {
	if (!props.currentSong?.id) return
	favoriteLoading.value = true
	try {
		await favoriteStore.toggle(props.currentSong.id)
	} finally {
		favoriteLoading.value = false
	}
}

/******** Xử lý tải bài hát ********/
const hasDownloaded = ref(false)
const downloadLoading = ref(false)

const checkDownloadStatus = async (songId) => {
  if (!songId) return
  
  try {
    const response = await downloadService.checkDownloadStatus(songId)
    hasDownloaded.value = response.hasDownloaded
  } catch (error) {
    console.error('Error checking download status:', error)
    hasDownloaded.value = false
  }
}

// Hiển thị modal tải xuống
const showDownloadModal = () => {
	isDownloadModalVisible.value = true
}

// Đóng modal tải xuống
const closeDownloadModal = () => {
	isDownloadModalVisible.value = false
}

// Xử lý tải bài hát với chất lượng được chọn
const handleDownload = async (downloadInfo) => {
  const { song, quality } = downloadInfo
  const fileName = `${song.title} - ${song.artist} (${quality}).mp3`
  let downloadUrl = song.audio
  try {
    downloadLoading.value = true
    // Ghi lại download vào database TRƯỚC khi tải file
    await downloadService.recordDownload(song.id)
    console.log('Download recorded successfully')
    hasDownloaded.value = true
    // Tạo một thẻ a ẩn để tải file
    const downloadLink = document.createElement('a')
    downloadLink.href = downloadUrl
    downloadLink.download = fileName
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    console.log(`Đang tải xuống: ${fileName}`)
  } catch (error) {
    console.error('Download error:', error)
  } finally {
    downloadLoading.value = false
  }
}

// Tua nhanh 10 giây
const seekForward = () => {
	if (!audioPlayer.value) return;
	audioPlayer.value.currentTime += 10
}

// Tua lùi 10 giây
const seekBackward = () => {
	if (!audioPlayer.value) return;
	audioPlayer.value.currentTime = Math.max(0, audioPlayer.value.currentTime - 10)
}

// Điều chỉnh âm lượng
const changeVolume = () => {
	if (!audioPlayer.value) return;
	audioPlayer.value.volume = volume.value
}

// Cập nhật âm lượng
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

let songEndedHandled = false;
// Xử lý khi bài hát kết thúc
const handleSongEnd = () => {
  if (songEndedHandled) return;
  songEndedHandled = true;
  if (!isLooping.value) {
    emit('next-song');
  }
  setTimeout(() => {
    songEndedHandled = false;
  }, 500);
};
// Xử lý khi component được mount
onMounted(() => {
	if (audioPlayer.value) {
		audioPlayer.value.volume = volume.value;

		audioPlayer.value.addEventListener('timeupdate', updateProgress);
		audioPlayer.value.addEventListener('loadedmetadata', updateDuration);
		audioPlayer.value.addEventListener('volumechange', updateVolume);
		audioPlayer.value.addEventListener('ended', handleSongEnd);
	}
})

// Dọn dẹp khi component unmount
onUnmounted(() => {
	if (audioPlayer.value) {
		audioPlayer.value.pause();
		audioPlayer.value.removeEventListener('timeupdate', updateProgress);
		audioPlayer.value.removeEventListener('loadedmetadata', updateDuration);
		audioPlayer.value.removeEventListener('volumechange', updateVolume);
		audioPlayer.value.removeEventListener('ended', handleSongEnd);
		audioPlayer.value = null;
	}
})

watch(() => props.isFavorite, (newVal) => {
  console.log('Favorite status from parent:', newVal)
}, { immediate: true })

// Watch khi bài hát thay đổi
watch(() => props.currentSong, (newSong, oldSong) => {
	hasSentHistory = false;
  if (!audioPlayer.value) return
  // Reset progress khi chuyển bài
  currentTime.value = 0
  progressPercentage.value = 0

  if (props.isPlaying) {
    setTimeout(() => {
      audioPlayer.value.play().catch(e => {
        console.error("Lỗi phát nhạc:", e)
        emit('toggle-play')
      })
    }, 100)
  }
  console.log('Current song changed:', newSong?.title)
  console.log('Is favorite:', isCurrentSongFavorite.value)
})

watch(() => props.currentSong?.id, (newSongId) => {
  if (newSongId) {
    checkDownloadStatus(newSongId)
  }
}, { immediate: true })

watch(currentTime, async (newTime) => {
  if (!props.currentSong || !audioPlayer.value || hasSentHistory) return;

  const duration = audioPlayer.value.duration || 1;
  const percentage = newTime / duration;

  if (percentage >= 0.7) {
    hasSentHistory = true;

    try {
      await historyService.createHistory(
        props.currentSong.id,
        newTime,
        duration
      );
      console.log('Đã gửi lịch sử nghe thành công');
    } catch (error) {
      console.error('Gửi lịch sử thất bại:', error);
    }
  }
});

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

const seekTo = (time) => {
	if (audioPlayer.value) {
		audioPlayer.value.currentTime = time;
		currentTime.value = time;
		progressPercentage.value = (time / duration.value) * 100;
	}
};

defineExpose({
	seekTo
});
</script>


<style scoped>
.player {
	text-align: center;
	padding: 23px;
	max-width: 600px;
	margin: 0 auto;
	background: rgba(30, 30, 46, 0.8);
	border-radius: 16px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(10px);
}

.disc-container {
	position: relative;
	margin-bottom: 30px;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.disc {
	width: 250px;
	height: 250px;
	border-radius: 50%;
	background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	box-shadow:
		0 0 0 8px rgba(67, 97, 238, 0.2),
		0 0 30px rgba(0, 0, 0, 0.5);
	transition: transform 0.3s ease;
	margin-bottom: 20px;
}

.disc::before {
	content: '';
	position: absolute;
	width: 30px;
	height: 30px;
	border-radius: 50%;
	z-index: 2;
}

.disc::after {
	content: '';
	position: absolute;
	width: 15px;
	height: 15px;
	border-radius: 50%;
	z-index: 3;
}

.disc.is-playing {
	animation: rotate 20s linear infinite;
}

.album-cover {
	width: 75%;
	height: 75%;
	border-radius: 50%;
	object-fit: cover;
	position: relative;
	z-index: 1;
	transition: all 0.3s ease;
	border: 2px solid rgba(255, 255, 255, 0.1);
}

@keyframes rotate {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}

.song-info {
	text-align: center;
	margin-top: 15px;
}

.song-info h2 {
	margin: 10px 0 5px;
	font-size: 1.5rem;
	color: #f8f9fa;
}

.song-info p {
	color: rgba(255, 255, 255, 0.7);
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
	background: rgba(255, 255, 255, 0.1);
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
	background: #4cc9f0;
	border-radius: 3px;
	transition: width 0.1s linear;
}

.time {
	font-size: 0.9rem;
	color: rgba(255, 255, 255, 0.6);
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
	background: rgba(255, 255, 255, 0.05);
	color: #f8f9fa;
	border: 1px solid rgba(255, 255, 255, 0.1);
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
	background: rgba(67, 97, 238, 0.3);
	transform: scale(1.05);
	box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.controls button:active {
	transform: scale(0.95);
}

.controls button.active {
	background: #4361ee;
	color: white;
}

.play-pause {
	width: 60px !important;
	height: 60px !important;
	font-size: 24px !important;
	background: #4361ee !important;
	color: white !important;
	border: none !important;
	box-shadow: 0 0 15px rgba(67, 97, 238, 0.5);
}

.volume-control {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 20px;
	gap: 10px;
	background: rgba(255, 255, 255, 0.05);
	padding: 10px 15px;
	border-radius: 20px;
}

.volume-icon {
	font-size: 1.2rem;
	color: rgba(255, 255, 255, 0.7);
}

.volume-slider {
	width: 100px;
	height: 6px;
	-webkit-appearance: none;
	appearance: none;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 3px;
	outline: none;
	cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
	-webkit-appearance: none;
	width: 15px;
	height: 15px;
	background: #4cc9f0;
	border-radius: 50%;
	cursor: pointer;
	box-shadow: 0 0 5px rgba(76, 201, 240, 0.5);
}

.volume-percent {
	font-size: 0.9rem;
	color: rgba(255, 255, 255, 0.6);
	min-width: 40px;
	text-align: left;
}

.download-btn {
	background: transparent;
	border: none;
	color: #4cc9f0;
	font-size: 1.2rem;
	cursor: pointer;
	border-radius: 50%;
	padding: 8px;
	transition: all 0.2s;
}

.download-btn.downloaded {
  background-color: #28a745;
  color: white;
}

.download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.download-btn:hover {
	color: #f8f9fa;
	background: rgba(76, 201, 240, 0.2);
	transform: scale(1.1);
}

.favorite-btn {
	top: 0;
	left: 0;
	background: transparent;
	border: none;
	color: rgba(255, 255, 255, 0.6);
	font-size: 1.2rem;
	cursor: pointer;
	border-radius: 50%;
	padding: 8px;
	transition: all 0.2s;
}

.favorite-btn:hover {
	color: #ff6b6b;
	transform: scale(1.1);
}

.favorite-btn.is-favorite {
	color: #ff6b6b;
	text-shadow: 0 0 10px rgba(255, 107, 107, 0.7);
}

.favorite-btn.is-favorite:hover {
	color: #ff8787;
}

.favorite-btn:disabled {
	opacity: 0.7;
	cursor: not-allowed;
	transform: none;
}

.favorite-btn:disabled:hover {
	transform: none;
	color: rgba(255, 255, 255, 0.6);
}

.favorite-btn.is-favorite:disabled:hover {
	color: #ff6b6b;
}

@media (max-width: 576px) {
	div.player {
		margin-top: 10px;
		padding: 30px;
	}

	.disc {
		width: 200px;
		height: 200px;
	}

	.album-cover {
		width: 65%;
		height: 65%;
	}

	.controls button {
		width: 30px;
		height: 30px;
		font-size: 1rem;
	}

	.play-pause {
		width: 50px !important;
		height: 50px !important;
	}

	.song-info h2 {
		font-size: 1.3rem;
	}

	.song-info p {
		font-size: 1rem;
	}
}
</style>