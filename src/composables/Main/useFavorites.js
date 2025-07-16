import { useFavoriteStore } from '@/stores/useFavoriteStore'

export function useFavorites() {
  const favoriteStore = useFavoriteStore()

  const isFavorite = (id, songs) => {
    const song = songs.find(s => s.id === id)
    if (song && typeof song.isFavorite === 'boolean') {
      return song.isFavorite
    }
    return favoriteStore.isFavorite(id)
  }

  const handleFavoriteUpdate = (songId, isFavorite, songs, currentSong) => {
    const song = songs.find(s => s.id === songId)
    if (song) song.isFavorite = isFavorite

    if (currentSong?.id === songId) {
      currentSong.isFavorite = isFavorite
    }
  }

  const toggleFavorite = async (id) => {
    try {
      return await favoriteStore.toggle(id)
    } catch (error) {
      console.error('Error toggling favorite:', error)
      throw error
    }
  }

  return {
    isFavorite,
    handleFavoriteUpdate,
    toggleFavorite
  }
}