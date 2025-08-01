import axiosInstance from '@/configs/axios'

export const downloadService = {
  // Ghi lại download vào database
  async recordDownload(songId) {
    try {
      const response = await axiosInstance.post('/download/record', { songId })
      return response.data
    } catch (error) {
      console.error('Record download error:', error)
      throw error
    }
  },

  // Lấy danh sách download của user
  async getMyDownloads(page = 1, pageSize = 20) {
    try {
      const response = await axiosInstance.get(`/download/my-downloads?page=${page}&pageSize=${pageSize}`)
      return response.data
    } catch (error) {
      console.error('Get downloads error:', error)
      throw error
    }
  },

  // Kiểm tra user đã download bài hát chưa
  async checkDownloadStatus(songId) {
    try {
      const response = await axiosInstance.get(`/download/check/${songId}`)
      return response.data
    } catch (error) {
      console.error('Check download status error:', error)
      throw error
    }
  },

  // Lấy thống kê download của bài hát
  async getDownloadStats(songId) {
    try {
      const response = await axiosInstance.get(`/download/stats/${songId}`)
      return response.data
    } catch (error) {
      console.error('Get download stats error:', error)
      throw error
    }
  }
}