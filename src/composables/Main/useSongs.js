import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { getRandomSongs, getSongByPlaylist } from '@/services/songService'

export function useSongs() {
  const originalPlaylist = ref([])
  const songs = ref([])
  const searchQuery = ref('')

  const filteredSongs = computed(() => {
    if (!searchQuery.value) return songs.value
    const query = searchQuery.value.toLowerCase()
    return songs.value.filter(song => 
      song.title.toLowerCase().includes(query) || 
      song.artist.toLowerCase().includes(query) ||
      song.genre.toLowerCase().includes(query)
    )
  })

  const getSongsFromServer = async () => {
    try {
      const response = await getRandomSongs(1, 21, 20)
      originalPlaylist.value = response.data.data
      songs.value = [...originalPlaylist.value]
      console.log('Songs loaded:', songs.value)
      return songs.value
    } catch (error) {
      console.error('Error loading songs:', error)
      message.error('Không thể tải danh sách bài hát')
      return []
    }
  }

  const shufflePlaylist = () => {
    const shuffled = [...filteredSongs.value.length > 0 ? filteredSongs.value : songs.value]
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    songs.value = shuffled
  }

  const restorePlaylist = () => {
    songs.value = [...originalPlaylist.value]
  }

  const handleSearch = () => {
    // Search logic if needed
  }

  // Watch for original playlist changes
  watch(originalPlaylist, (newVal) => {
    if (newVal.length > 0) {
      songs.value = [...newVal]
    }
  }, { deep: true })

  return {
    songs,
    originalPlaylist,
    filteredSongs,
    searchQuery,
    getSongsFromServer,
    shufflePlaylist,
    restorePlaylist,
    handleSearch
  }
}