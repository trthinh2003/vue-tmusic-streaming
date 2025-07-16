import { ref, computed, watch } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useNextSongSignalStore } from '@/stores/nextSongSignalStore'

export function usePlayer() {
  const playerStore = usePlayerStore()
  const nextSongSignalStore = useNextSongSignalStore()
  
  const currentSong = ref(null)
  const isShuffled = ref(false)
  const currentAudioTime = ref(0)
  const currentLyric = ref('')
  const karaokeMode = ref(false)
  
  const isPlaying = computed({
    get: () => playerStore.isPlaying,
    set: (value) => playerStore.setPlayingState(value)
  })

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
    currentSong,
    isPlaying,
    isShuffled,
    currentAudioTime,
    currentLyric,
    karaokeMode,
    togglePlay,
    handlePausePlay,
    updateAudioTime,
    handleKaraokeToggle
  }
}