import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getFavoriteSongIds, toggleFavorite } from '@/services/favoriteService'
import { message } from 'ant-design-vue'

export const useFavoriteStore = defineStore('favorite', () => {
  const favoriteSongIds = ref(new Set())
  const loading = ref(false)
  const initialized = ref(false)

  // Computed để có thể reactive
  const favoriteCount = computed(() => favoriteSongIds.value.size)

  const fetchFavoriteIds = async () => {
    if (loading.value) return // Tránh gọi nhiều lần cùng lúc
    
    loading.value = true
    try {
      const response = await getFavoriteSongIds()
      const songIds = response.SongIds || response.data || []
      favoriteSongIds.value = new Set(songIds)
      initialized.value = true
      
      console.log('Favorite songs loaded:', Array.from(favoriteSongIds.value))
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bài hát yêu thích:', error)
      message.error('Không thể tải danh sách yêu thích')
    } finally {
      loading.value = false
    }
  }

  const isFavorite = (songId) => {
    if (!initialized.value) {
      console.warn('Favorite store chưa được khởi tạo')
      return false
    }
    return favoriteSongIds.value.has(songId)
  }

  const toggle = async (songId) => {
    if (!songId) {
      console.error('Song ID is required')
      return false
    }

    const wasLoading = loading.value
    loading.value = true
    
    try {
      const response = await toggleFavorite(songId)
      
      // Cập nhật state dựa trên response từ API
      if (response.isFavorite) {
        favoriteSongIds.value.add(songId)
        message.success(response.Message || 'Đã thêm vào yêu thích')
      } else {
        favoriteSongIds.value.delete(songId)
        message.info(response.Message || 'Đã bỏ yêu thích')
      }
      
      console.log(`Toggle favorite for song ${songId}: ${response.isFavorite}`)
      return response.isFavorite
      
    } catch (error) {
      console.error('Error toggling favorite:', error)
      
      if (error.response?.status === 401) {
        message.warning('Vui lòng đăng nhập để sử dụng tính năng này')
      } else {
        message.error('Có lỗi xảy ra, vui lòng thử lại')
      }
      throw error
    } finally {
      loading.value = wasLoading
    }
  }

  const addFavorite = (songId) => {
    favoriteSongIds.value.add(songId)
  }

  // Method để xóa favorite mà không cần gọi API
  const removeFavorite = (songId) => {
    favoriteSongIds.value.delete(songId)
  }

  const reset = () => {
    favoriteSongIds.value.clear()
    loading.value = false
    initialized.value = false
  }

  const getFavoriteIds = () => {
    return Array.from(favoriteSongIds.value)
  }

  return {
    favoriteSongIds,
    loading,
    initialized,
    favoriteCount,
    fetchFavoriteIds,
    isFavorite,
    toggle,
    addFavorite,
    removeFavorite,
    reset,
    getFavoriteIds
  }
})