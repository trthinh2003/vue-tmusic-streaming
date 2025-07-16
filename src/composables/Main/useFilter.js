import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'

export function useFilter() {
  const visibleFilterModal = ref(false)
  const filters = ref({ songName: '', artistName: '', genres: [] })

  const hasActiveFilters = computed(() => {
    return Object.values(filters.value).some(val => 
      Array.isArray(val) ? val.length > 0 : val !== ''
    )
  })

  const activeFilters = computed(() => {
    return Object.fromEntries(
      Object.entries(filters.value).filter(([_, value]) => 
        Array.isArray(value) ? value.length > 0 : value !== ''
      )
    )
  })

  const openFilterModal = () => {
    visibleFilterModal.value = true
  }

  const applyFilter = (appliedFilters, originalPlaylist) => {
    try {
      const safeFilters = appliedFilters || { 
        songName: '', 
        artistName: '', 
        genres: [] 
      }
      
      if (!safeFilters.songName && !safeFilters.artistName && 
          (!safeFilters.genres || safeFilters.genres.length === 0)) {
        return [...originalPlaylist]
      }
      
      const filtered = originalPlaylist.filter(song => {
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
      
      visibleFilterModal.value = false
      message.success(`Đã lọc được ${filtered.length} bài hát`)
      return filtered
    } catch (error) {
      console.error('Filter error:', error)
      message.error('Có lỗi khi áp dụng bộ lọc')
      return originalPlaylist
    }
  }

  const clearAllFilters = () => {
    filters.value = { songName: '', artistName: '', genres: [] }
  }

  const removeFilter = (filterKey) => {
    if (filterKey === 'genres') {
      filters.value.genres = []
    } else {
      filters.value[filterKey] = ''
    }
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

  return {
    visibleFilterModal,
    filters,
    hasActiveFilters,
    activeFilters,
    openFilterModal,
    applyFilter,
    clearAllFilters,
    removeFilter,
    getFilterLabel,
    updateFilters
  }
}