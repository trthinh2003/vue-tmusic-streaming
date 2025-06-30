// composables/useFilters.js
import { ref, computed } from 'vue'

export function useFilters() {
  const visibleModalFilter = ref(false)
  const filters = ref({ 
    songName: '', 
    artistName: '', 
    genre: '' 
  })
  
  // Check if any filters are active
  const hasActiveFilters = computed(() => {
    return Object.values(filters.value).some(val => val !== '')
  })
  
  // Get currently active filters
  const activeFilters = computed(() => {
    return Object.fromEntries(
      Object.entries(filters.value).filter(([_, value]) => value !== '')
    )
  })
  
  // Apply filters to songs
  const applyFilter = (originalPlaylist, songs) => {
    // If no filters are active, restore original playlist
    if (!hasActiveFilters.value) {
      songs.value = [...originalPlaylist.value]
      return
    }
    
    // Apply filters
    songs.value = originalPlaylist.value.filter(song => {
      const matchesSongName = filters.value.songName 
        ? song.title.toLowerCase().includes(filters.value.songName.toLowerCase())
        : true
      
      const matchesArtistName = filters.value.artistName 
        ? song.artist.toLowerCase().includes(filters.value.artistName.toLowerCase())
        : true
      
      const matchesGenre = filters.value.genre 
        ? song.genre.toLowerCase().includes(filters.value.genre.toLowerCase())
        : true
      
      return matchesSongName && matchesArtistName && matchesGenre
    })
  }
  
  // Remove a specific filter
  const removeFilter = (filterKey, originalPlaylist, songs) => {
    filters.value[filterKey] = ''
    applyFilter(originalPlaylist, songs)
  }
  
  // Get filter label for display
  const getFilterLabel = (key) => {
    const labels = {
      songName: 'Tên bài hát',
      artistName: 'Nghệ sĩ',
      genre: 'Thể loại'
    }
    return labels[key] || key
  }
  
  // Update filters
  const updateFilters = (newFilters) => {
    filters.value = newFilters
  }
  
  return {
    // State
    visibleModalFilter,
    filters,
    hasActiveFilters,
    activeFilters,
    
    // Methods
    applyFilter,
    removeFilter,
    getFilterLabel,
    updateFilters
  }
}