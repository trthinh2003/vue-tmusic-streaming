import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'

export function useFilters(originalPlaylist, songs, currentSong) {
  const searchQuery = ref('')
  const filters = ref({ 
    songName: '', 
    artistName: '', 
    genres: [] 
  })
  const visibleFilterModal = ref(false)

  // Computed property to check if any filters are active
  const hasActiveFilters = computed(() => {
    return Object.values(filters.value).some(val => {
      if (Array.isArray(val)) {
        return val.length > 0
      }
      return val !== ''
    })
  })

  // Computed property for active filters
  const activeFilters = computed(() => {
    return Object.fromEntries(
      Object.entries(filters.value).filter(([_, value]) => {
        if (Array.isArray(value)) {
          return value.length > 0
        }
        return value !== ''
      })
    )
  })

  // Filtered songs based on search query
  const filteredSongs = computed(() => {
    if (!searchQuery.value) return songs.value
    const query = searchQuery.value.toLowerCase()
    return songs.value.filter(song => 
      song.title.toLowerCase().includes(query) || 
      song.artist.toLowerCase().includes(query) ||
      song.genre.toLowerCase().includes(query)
    )
  })

  const openFilterModal = () => {
    visibleFilterModal.value = true
  }

  const applyFilter = (appliedFilters) => {
    try {
      const safeFilters = appliedFilters || { 
        songName: '', 
        artistName: '', 
        genres: [] 
      }
      
      if (!safeFilters.songName && !safeFilters.artistName && 
          (!safeFilters.genres || safeFilters.genres.length === 0)) {
        songs.value = [...originalPlaylist.value]
      } else {
        songs.value = originalPlaylist.value.filter(song => {
          const matchesSongName = safeFilters.songName 
            ? song.title.toLowerCase().includes(safeFilters.songName.toLowerCase())
            : true
          const matchesArtistName = safeFilters.artistName 
            ? song.artist.toLowerCase().includes(safeFilters.artistName.toLowerCase())
            : true
          const matchesGenres = safeFilters.genres?.length > 0
            ? safeFilters.genres.some(genre => 
                song.genre.toLowerCase().includes(genre.toLowerCase()))
            : true
          return matchesSongName && matchesArtistName && matchesGenres
        })
      }
      
      if (songs.value.length > 0 && !songs.value.some(s => s.id === currentSong.value?.id)) {
        currentSong.value = songs.value[0]
      }
      
      visibleFilterModal.value = false
    } catch (error) {
      console.error('Filter error:', error)
      message.error('Có lỗi khi áp dụng bộ lọc')
    }
  }

  const clearAllFilters = () => {
    filters.value = { songName: '', artistName: '', genres: [] }
    songs.value = [...originalPlaylist.value]
  }

  const removeFilter = (filterKey) => {
    if (filterKey === 'genres') {
      filters.value.genres = []
    } else {
      filters.value[filterKey] = ''
    }
    applyFilter(filters.value)
  }

  const getFilterLabel = (key) => {
    const labels = {
      songName: 'Tên bài hát',
      artistName: 'Nghệ sĩ',
      genre: 'Thể loại',
      genres: 'Thể loại'
    }
    return labels[key] || key
  }

  const updateFilters = (newFilters) => {
    filters.value = newFilters
  }

  const handleSearch = () => {
    // Search logic if needed
  }

  return {
    // State
    searchQuery,
    filters,
    visibleFilterModal,
    hasActiveFilters,
    activeFilters,
    filteredSongs,
    
    // Methods
    openFilterModal,
    applyFilter,
    clearAllFilters,
    removeFilter,
    getFilterLabel,
    updateFilters,
    handleSearch
  }
}