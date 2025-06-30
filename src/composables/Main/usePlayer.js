// composables/Main/usePlayer.js
import { ref, computed, watch } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useNextSongSignalStore } from '@/stores/nextSongSignalStore'

export function usePlayer() {
  const playerStore = usePlayerStore()
  const nextSongSignalStore = useNextSongSignalStore()
  
  const currentSong = ref(null)
  const currentAudioTime = ref(0)
  const currentLyric = ref('')
  const isShuffled = ref(false)
  const karaokeMode = ref(false)
  const playerRef = ref(null)
  
  const isPlaying = computed({
    get: () => playerStore.isPlaying,
    set: (value) => playerStore.setPlayingState(value)
  })
  
  // Play/Pause bài hát
  const togglePlay = () => {
    isPlaying.value = !isPlaying.value
  }
  
  // Xử lý khi dừng bài hát
  const handlePausePlay = () => {
    isPlaying.value = false
  }
  
  // Cập nhật audio time
  const updateAudioTime = (time) => {
    currentAudioTime.value = time
    playerStore.setCurrentTime(time)
  }
  
  // Seek to specific time
  const handleSeek = (time) => {
    if (playerRef.value) {
      playerRef.value.seekTo(time)
    }
  }
  
  // Hàm xử lý khi user bật/tắt karaoke mode
  const handleKaraokeToggle = (checked) => {
    karaokeMode.value = checked
  }
  
  const handleShuffleUpdate = (shuffleStatus) => {
    isShuffled.value = shuffleStatus
  }
  
  const loadLyrics = async (song) => {
    if (!song || !song.lyric) {
      currentLyric.value = ''
      return
    }
    
    try {
      if (typeof song.lyric === 'string') {
        const response = await fetch(song.lyric)
        currentLyric.value = await response.text()
      } else {
        currentLyric.value = song.lyric
      }
    } catch (error) {
      console.error('Error loading lyric:', error)
      currentLyric.value = ''
    }
  }
  
  // Theo dõi thay đổi bài hát để load lyrics
  watch(currentSong, async (newSong) => {
    await loadLyrics(newSong)
  }, { immediate: true })
  
  return {
    // State
    currentSong,
    currentAudioTime,
    currentLyric,
    isShuffled,
    karaokeMode,
    isPlaying,
    playerRef,
    
    // Methods
    togglePlay,
    handlePausePlay,
    updateAudioTime,
    handleSeek,
    handleKaraokeToggle,
    handleShuffleUpdate,
    loadLyrics
  }
}