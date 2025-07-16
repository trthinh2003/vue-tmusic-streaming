import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useUI() {
  const visible = ref(false)
  const showMobileSearch = ref(false)
  const openRightDrawer = ref(false)
  const showRightDrawer = ref(true)
  const openSongDetail = ref(false)
  const drawerLyricWidth = ref('50vw')

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

  const toggleSongDetail = () => {
    openSongDetail.value = !openSongDetail.value
  }

  const updateDrawerWidth = () => {
    const width = window.innerWidth
    if (width < 576) drawerLyricWidth.value = '90vw'
    else if (width < 768) drawerLyricWidth.value = '80vw'
    else drawerLyricWidth.value = '350px'
  }

  onMounted(() => {
    updateDrawerWidth()
    window.addEventListener('resize', updateDrawerWidth)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateDrawerWidth)
  })

  return {
    visible,
    showMobileSearch,
    openRightDrawer,
    showRightDrawer,
    openSongDetail,
    drawerLyricWidth,
    showDrawer,
    toggleRightDrawer,
    onCloseRightDrawer,
    toggleSongDetail
  }
}