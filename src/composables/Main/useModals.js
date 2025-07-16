import { ref } from 'vue'
import { message } from 'ant-design-vue'

export function useModals() {
  const visibleExploreModal = ref(false)
  const showFavoriteModal = ref(false)
  const helpModalVisible = ref(false)
  const logoutModalVisible = ref(false)

  const helpSteps = ref([
    {
      id: 1,
      title: "Tìm kiếm bài hát",
      description: "Sử dụng ô tìm kiếm để tìm bài hát theo tên, nghệ sĩ hoặc thể loại",
      image: '/path/to/guide1.png'
    },
    {
      id: 2,
      title: "Phát nhạc",
      description: "Nhấn vào bài hát trong danh sách để phát, sử dụng các nút điều khiển để play/pause, chuyển bài",
      image: '/path/to/guide2.png'
    }
  ])

  const openExploreModal = () => {
    visibleExploreModal.value = true
  }

  const handleOpenFavoriteModal = () => {
    showFavoriteModal.value = true
  }

  const handleCloseFavoriteModal = () => {
    showFavoriteModal.value = false
  }

  const showHelpModal = (e) => {
    try {
      e?.stopPropagation()
      e?.preventDefault()
      
      if (!helpSteps.value || helpSteps.value.length === 0) {
        console.error('Help steps data is empty')
        return
      }
      
      helpModalVisible.value = true
      console.log('Modal opened successfully')
    } catch (error) {
      console.error('Error opening help modal:', error)
      message.error('Có lỗi khi mở hướng dẫn')
    }
  }

  const handleHelpModalClose = () => {
    helpModalVisible.value = false
  }

  const handleLogout = () => {
    logoutModalVisible.value = true
  }

  return {
    visibleExploreModal,
    showFavoriteModal,
    helpModalVisible,
    logoutModalVisible,
    helpSteps,
    openExploreModal,
    handleOpenFavoriteModal,
    handleCloseFavoriteModal,
    showHelpModal,
    handleHelpModalClose,
    handleLogout
  }
}