import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSearchFilterModalStore = defineStore('search', () => {
  const searchQuery = ref('')
  const isSearching = ref(false)
  
  const setSearchQuery = (query) => {
    searchQuery.value = query
  }
  
  const setIsSearching = (status) => {
    isSearching.value = status
  }
  
  const clearSearch = () => {
    searchQuery.value = ''
    isSearching.value = false
  }
  
  return {
    searchQuery,
    isSearching,
    setSearchQuery,
    setIsSearching,
    clearSearch
  }
})