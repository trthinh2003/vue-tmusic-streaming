import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  const currentSong = ref(null)
  const playlist = ref([])
  const originalPlaylist = ref([])
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const isShuffled = ref(false)
  const error = ref(null)
  
  // Actions
  const togglePlay = () => {
    isPlaying.value = !isPlaying.value
  }
  
  const nextSong = () => {
    // Logic chuyển bài tiếp theo
  }
  
  // Getters
  const progressPercentage = computed(() => {
    return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
  })
  
  return {
    currentSong,
    playlist,
    isPlaying,
    currentTime,
    duration,
    isShuffled,
    error,
    togglePlay,
    nextSong,
    progressPercentage
  }
})