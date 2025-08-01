import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    isPlaying: false,
    currentSongId: null,
    currentTime: 0
  }),
  actions: {
    togglePlay() {
      this.isPlaying = !this.isPlaying
    },
    setPlayingState(state) {
      this.isPlaying = state
    },
    setCurrentSongId(id) {
      this.currentSongId = id
    },
    setCurrentTime(time) {
      this.currentTime = time
    }
  }
})