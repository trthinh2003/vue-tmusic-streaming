import axiosInstance from '@/configs/axios'
export const historyService = {
  // Lấy lịch sử nghe nhạc
  async getHistory(page = 1, pageSize = 20) {
    try {
      const response = await axiosInstance.get('/history', {
        params: { page, pageSize }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching history:', error)
      throw error
    }
  },
  // Lấy lịch sử gần đây
  async getRecentHistory(limit = 10) {
    try {
      const response = await axiosInstance.get('/history/recent', {
        params: { limit }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching recent history:', error)
      throw error
    }
  },
  // Tạo lịch sử nghe nhạc đơn lẻ
  async createHistory(songId, listenDuration, songDuration) {
    try {
      const response = await axiosInstance.post('/history', {
        songId,
        listenDuration,
        songDuration
      })
      return response.data
    } catch (error) {
      console.error('Error creating history:', error)
      throw error
    }
  },
  // Tạo lịch sử nghe nhạc hàng loạt
  async createBulkHistory(histories) {
    try {
      const response = await axiosInstance.post('/history/bulk', {
        histories
      })
      return response.data
    } catch (error) {
      console.error('Error creating bulk history:', error)
      throw error
    }
  },
  // Xóa lịch sử
  async deleteHistory(historyId) {
    try {
      const response = await axiosInstance.delete(`/history/${historyId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting history:', error)
      throw error
    }
  },
  // Lấy thống kê nghe nhạc
  async getListeningStats() {
    try {
      const response = await axiosInstance.get('/history/stats')
      return response.data
    } catch (error) {
      console.error('Error fetching listening stats:', error)
      throw error
    }
  }
}