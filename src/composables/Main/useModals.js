import { ref } from 'vue'
import { message } from 'ant-design-vue'
import axiosInstance from '@/configs/axios'
import { useRouter } from 'vue-router'

export function useModals() {
  const router = useRouter()
  
  // Modal states
  const visible = ref(false) // Mobile drawer
  const showModal = ref(false) // Playlist modal
  const showFavoriteModal = ref(false)
  const shareModalVisible = ref(false)
  const showProfileModal = ref(false)
  const visibleExploreModal = ref(false)
  const openSongDetail = ref(false)
  const openRightDrawer = ref(false)
  const showRightDrawer = ref(true)
  const drawerLyricWidth = ref('50vw')

  const showMobileSearch = ref(false)

  // Drawer methods
  const showDrawer = () => {
    visible.value = true
  }

  const toggleRightDrawer = () => {
    showRightDrawer.value = !showRightDrawer.value
    openRightDrawer.value = true
  }

  const onCloseRightDrawer = () => {
    openRightDrawer.value = false
  }

  // Modal open/close methods
  const openExploreModal = () => {
    visibleExploreModal.value = true
    visible.value = false // Close mobile drawer if open
  }

  const handleOpenFavoriteModal = () => {
    showFavoriteModal.value = true
  }

  const handleCloseFavoriteModal = () => {
    showFavoriteModal.value = false
  }

  const openProfileModal = () => {
    showProfileModal.value = true
  }

  const showShareModal = () => {
    shareModalVisible.value = true
  }

  const toggleSongDetail = () => {
    openSongDetail.value = !openSongDetail.value
  }

  // Logout methods
  const handleLogout = async () => {
    try {
      const response = await axiosInstance.get('/auth/logout')
      if (response.status === 200) {
        message.success(response.data.message)
        setTimeout(() => {
          router.push({ name: 'login' })
        }, 1000)
      }
    } catch (error) {
      message.error("Đã có lỗi xảy ra!")
    } 
  }

  // Profile update handler
  const handleProfileUpdated = (updatedUser) => {
    console.log("Profile updated successfully:", updatedUser)
    message.success('Hồ sơ đã được cập nhật!')
    // Return updated user for parent component to handle
    return updatedUser
  }

  // Responsive drawer width
  const updateDrawerWidth = () => {
    const width = window.innerWidth
    if (width < 576) drawerLyricWidth.value = Math.round(width * 0.9) + 'px'     // Mobile
    else if (width < 768) drawerLyricWidth.value = Math.round(width * 0.8) + 'px' // Tablet
    else drawerLyricWidth.value = '350px'                                         // Desktop
  }

  return {
    // State
    visible,
    showModal,
    showFavoriteModal,
    shareModalVisible,
    showProfileModal,
    visibleExploreModal,
    openSongDetail,
    openRightDrawer,
    showRightDrawer,
    drawerLyricWidth,
    showMobileSearch,
    
    // Methods
    showDrawer,
    toggleRightDrawer,
    onCloseRightDrawer,
    openExploreModal,
    handleOpenFavoriteModal,
    handleCloseFavoriteModal,
    openProfileModal,
    showShareModal,
    toggleSongDetail,
    handleLogout,
    handleProfileUpdated,
    updateDrawerWidth
  }
}