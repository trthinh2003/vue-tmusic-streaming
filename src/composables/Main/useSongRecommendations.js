import { ref, watch } from 'vue'
import { getSongByArtist } from '@/services/songService'
import { getRecommendSongs } from '@/services/recommendService'

export function useSongRecommendations(currentSong, openSongDetail) {
  const sameArtistSongs = ref([])
  const suggestedSongs = ref([])

  const fetchSameArtistSongs = async (artistName) => {
    if (!artistName) {
      sameArtistSongs.value = []
      return
    }
    
    try {
      const response = await getSongByArtist(artistName)
      sameArtistSongs.value = response.data.data.filter(
        song => song.id !== currentSong.value?.id
      )
    } catch (error) {
      console.error('Error fetching songs by artist:', error)
      sameArtistSongs.value = []
    }
  }

  const fetchRecommendedSongs = async () => {
    try {
      const response = await getRecommendSongs(10) // Get 10 recommended songs
      suggestedSongs.value = response.data.data || []
    } catch (error) {
      console.error('Error fetching recommended songs:', error)
      suggestedSongs.value = []
    }
  }

  // Watch for song detail modal open/close
  watch(() => openSongDetail.value, (newVal) => {
    if (newVal && currentSong.value) {
      fetchSameArtistSongs(currentSong.value.artist)
      fetchRecommendedSongs()
    } else {
      sameArtistSongs.value = []
      suggestedSongs.value = []
    }
  })

  // Watch for current song changes
  watch(currentSong, (newSong, oldSong) => {
    if (openSongDetail.value && newSong && newSong.artist !== oldSong?.artist) {
      fetchSameArtistSongs(newSong.artist)
    }
    if (openSongDetail.value && newSong) {
      fetchRecommendedSongs()
    }
  }, { deep: true })

  return {
    // State
    sameArtistSongs,
    suggestedSongs,
    
    // Methods
    fetchSameArtistSongs,
    fetchRecommendedSongs
  }
}