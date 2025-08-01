import { computed } from 'vue'
import { useFavoriteStore } from '@/stores/useFavoriteStore'

export function useFavorites(songs, currentSong) {
  const favoriteStore = useFavoriteStore()

  const isFavorite = (id) => {
    const song = songs.value.find(s => s.id === id)
    if (song && typeof song.isFavorite === 'boolean') {
      return song.isFavorite
    }
    // Fallback to favorite store
    return favoriteStore.isFavorite(id)
  }

  const handleFavoriteUpdate = (songId, isFavorite) => {
    const song = songs.value.find(s => s.id === songId)
    if (song) song.isFavorite = isFavorite

    if (currentSong.value?.id === songId) {
      currentSong.value.isFavorite = isFavorite
    }
  }

  const toggleFavorite = async (id) => {
    try {
      const status = await favoriteStore.toggle(id)
      handleFavoriteUpdate(id, status)
      return status
    } catch (error) {
      console.error('Error toggling favorite:', error)
      throw error
    }
  }

  const initializeFavorites = async () => {
    try {
      await favoriteStore.fetchFavoriteIds()
    } catch (error) {
      console.error('Error initializing favorites:', error)
    }
  }

  return {
    // State
    favoriteStore,
    
    // Methods
    isFavorite,
    handleFavoriteUpdate,
    toggleFavorite,
    initializeFavorites
  }
}