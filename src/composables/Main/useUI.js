import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useProfileStore } from '@/stores/useProfile.js'

export function useUI() {
  const currentUser = ref({})
  const drawerLyricWidth = ref('50vw')
  
  // Background management
  const currentBackground = computed(() => {
    return (song) => song?.background || 'linear-gradient(135deg, var(--dark-bg) 0%, #0f3460 100%)'
  })

  // Responsive drawer width management
  const updateDrawerWidth = () => {
    const width = window.innerWidth
    if (width < 576) drawerLyricWidth.value = '90vw'       // Mobile
    else if (width < 768) drawerLyricWidth.value = '80vw'   // Tablet
    else drawerLyricWidth.value = '350px'                   // Desktop
  }

  // Initialize user profile
  const initializeUserProfile = () => {
    currentUser.value = useProfileStore().getProfile()
  }

  // Update user profile
  const updateUserProfile = () => {
    currentUser.value = useProfileStore().getProfile()
  }

  // Setup responsive handlers
  const setupResponsiveHandlers = () => {
    updateDrawerWidth()
    window.addEventListener('resize', updateDrawerWidth)
  }

  // Cleanup responsive handlers
  const cleanupResponsiveHandlers = () => {
    window.removeEventListener('resize', updateDrawerWidth)
  }

  return {
    // State
    currentUser,
    drawerLyricWidth,
    currentBackground,
    
    // Methods
    updateDrawerWidth,
    initializeUserProfile,
    updateUserProfile,
    setupResponsiveHandlers,
    cleanupResponsiveHandlers
  }
}