import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { getMyPlaylists, getSongsInPlaylist } from '@/services/playlistService'

export function usePlaylist() {
  const playlists = ref([])
  const currentPlaylistId = ref(null)
  const showModal = ref(false)

  const currentPlaylist = computed(() => {
    return playlists.value.find(p => p.id === currentPlaylistId.value)
  })

  const fetchPlaylists = async () => {
    try {
      const response = await getMyPlaylists()
      playlists.value = response.data
    } catch (error) {
      console.error('Error fetching playlists:', error)
      message.error('Không thể tải danh sách playlist')
    }
  }

  const handlePlaylistChange = (playlist) => {
    currentPlaylistId.value = playlist?.id || null
  }

  const handlePlayPlaylist = async (playlistId) => {
    try {
      currentPlaylistId.value = playlistId
      const response = await getSongsInPlaylist(playlistId)
      console.log('Playlist songs:', response.data.data)
      showModal.value = false
      return response.data.data
    } catch (error) {
      console.error('Error playing playlist:', error)
      message.error('Không thể phát playlist')
      return []
    }
  }

  const handleChangePlaylist = (playlistId) => {
    currentPlaylistId.value = playlistId
  }

  return {
    playlists,
    currentPlaylistId,
    currentPlaylist,
    showModal,
    fetchPlaylists,
    handlePlaylistChange,
    handlePlayPlaylist,
    handleChangePlaylist
  }
}