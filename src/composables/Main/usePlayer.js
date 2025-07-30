import { ref, computed, watch } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useNextSongSignalStore } from '@/stores/nextSongSignalStore'

export function usePlayer() {
  const playerStore = usePlayerStore()
  const nextSongSignalStore = useNextSongSignalStore()
  
  const currentSong = ref(null)
  const currentAudioTime = ref(0)
  const currentLyric = ref('')
  const karaokeMode = ref(false)
  const playerRef = ref(null)
  
  const isPlaying = computed({
    get: () => playerStore.isPlaying,
    set: (value) => playerStore.setPlayingState(value)
  })

  const selectSong = (song) => {
    currentSong.value = song
    playerStore.setCurrentSongId(song.id)
    playerStore.setPlayingState(true)
  }

  const togglePlay = () => {
    isPlaying.value = !isPlaying.value
  }

  const handlePausePlay = () => {
    isPlaying.value = false
  }

  const updateAudioTime = (time) => {
    currentAudioTime.value = time
    playerStore.setCurrentTime(time)
  }

  const handleSeek = (time) => {
    if (playerRef.value) {
      playerRef.value.seekTo(time)
    }
  }

  const handleKaraokeToggle = (checked) => {
    karaokeMode.value = checked
  }

  // Load lyrics when song changes
  watch(currentSong, async (newSong) => {
    if (!newSong || !newSong.lyric) {
      currentLyric.value = ''
      return
    }

    try {
      if (typeof newSong.lyric === 'string') {
        const response = await fetch(newSong.lyric)
        currentLyric.value = await response.text()
      } else {
        currentLyric.value = newSong.lyric
      }
    } catch (error) {
      console.error('Error loading lyric:', error)
      currentLyric.value = ''
    }
  }, { immediate: true })

  return {
    // State
    currentSong,
    currentAudioTime,
    currentLyric,
    karaokeMode,
    playerRef,
    isPlaying,
    
    // Methods
    selectSong,
    togglePlay,
    handlePausePlay,
    updateAudioTime,
    handleSeek,
    handleKaraokeToggle
  }
}