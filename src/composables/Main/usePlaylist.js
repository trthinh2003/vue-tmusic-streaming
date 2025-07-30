import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { getSongByPlaylist, getSongsFromFavorites, getRandomSongs } from '@/services/songService'
import { getMyPlaylists } from '@/services/playlistService'
import { useNextSongSignalStore } from '@/stores/nextSongSignalStore'

export function usePlaylist(currentSong, isPlaying) {
  const nextSongSignalStore = useNextSongSignalStore()
  
  const originalPlaylist = ref([])
  const songs = ref([])
  const playlists = ref([])
  const currentPlaylistId = ref(null)
  const isShuffled = ref(false)
  const playlistRef = ref(null)

  const currentPlaylist = computed(() => {
    return playlists.value.find(p => p.id === currentPlaylistId.value)
  })

  const getSongsFromServer = async () => {
    try {
      const response = await getRandomSongs(1, 31, 30)
      originalPlaylist.value = response.data.data
      songs.value = [...originalPlaylist.value]
      if (currentSong.value === null && songs.value.length > 0) {
        currentSong.value = songs.value[0]
      }
      console.log('Songs loaded:', songs.value)
    } catch (error) {
      console.error('Error loading songs:', error)
    }
  }

  const fetchPlaylists = async () => {
    try {
      const response = await getMyPlaylists()
      playlists.value = response.data
    } catch (error) {
      console.error('Error fetching playlists:', error)
    }
  }

  const shufflePlaylist = () => {
    const shuffled = [...songs.value]
    
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    songs.value = shuffled
    
    if (!shuffled.some(song => song.id === currentSong.value?.id)) {
      currentSong.value = shuffled[0]
      isPlaying.value = true
    }
  }

  const restorePlaylist = () => {
    songs.value = [...originalPlaylist.value]
  }

  const handleShuffleUpdate = (shuffleStatus) => {
    isShuffled.value = shuffleStatus
    if (shuffleStatus) {
      shufflePlaylist()
    } else {
      restorePlaylist()
    }
  }

  const nextSong = (filteredSongs) => {
    try {
      // Validate input
      if (!filteredSongs || !Array.isArray(filteredSongs) || filteredSongs.length === 0) {
        console.warn('Invalid or empty filteredSongs array')
        return
      }

      if (!currentSong.value) {
        console.warn('No current song selected')
        currentSong.value = filteredSongs[0]
        isPlaying.value = true
        return
      }

      const currentIndex = filteredSongs.findIndex(song => song && song.id === currentSong.value.id)
      
      // Nếu không tìm thấy bài hát hiện tại trong danh sách, bắt đầu từ đầu
      if (currentIndex === -1) {
        console.warn('Current song not found in filtered songs, starting from beginning')
        currentSong.value = filteredSongs[0]
      } else {
        const nextIndex = (currentIndex + 1) % filteredSongs.length
        currentSong.value = filteredSongs[nextIndex]
      }
      
      isPlaying.value = true
      
      if (nextSongSignalStore && typeof nextSongSignalStore.triggerRefresh === 'function') {
        nextSongSignalStore.triggerRefresh(currentSong.value.id)
      }
    } catch (error) {
      console.error('Error in nextSong:', error)
      message.error('Không thể chuyển đến bài hát tiếp theo')
    }
  }

  const prevSong = (filteredSongs) => {
    try {
      // Validate input
      if (!filteredSongs || !Array.isArray(filteredSongs) || filteredSongs.length === 0) {
        console.warn('Invalid or empty filteredSongs array')
        return
      }

      if (!currentSong.value) {
        console.warn('No current song selected')
        currentSong.value = filteredSongs[filteredSongs.length - 1]
        isPlaying.value = true
        return
      }

      const currentIndex = filteredSongs.findIndex(song => song && song.id === currentSong.value.id)
      
      if (currentIndex === -1) {
        console.warn('Current song not found in filtered songs, starting from end')
        currentSong.value = filteredSongs[filteredSongs.length - 1]
      } else {
        const prevIndex = (currentIndex - 1 + filteredSongs.length) % filteredSongs.length
        currentSong.value = filteredSongs[prevIndex]
      }
      
      isPlaying.value = true
      
      if (nextSongSignalStore && typeof nextSongSignalStore.triggerRefresh === 'function') {
        nextSongSignalStore.triggerRefresh(currentSong.value.id)
      }
    } catch (error) {
      console.error('Error in prevSong:', error)
      message.error('Không thể chuyển đến bài hát trước đó')
    }
  }

  const handlePlayPlaylist = async (playlistId) => {
    try {
      currentPlaylistId.value = playlistId
      
      const response = await getSongByPlaylist(playlistId)
      console.log('Playlist songs:', response.data.data)
      
      originalPlaylist.value = response.data.data
      songs.value = [...originalPlaylist.value]
      
      if (songs.value.length > 0) {
        currentSong.value = songs.value[0]
        isPlaying.value = true
      }
    } catch (error) {
      console.error('Error playing playlist:', error)
      message.error('Không thể phát playlist')
    }
  }

  const handlePlayFavorites = async () => {
    try {
      const res = await getSongsFromFavorites()
      console.log('Danh sách bài hát yêu thích:', res.data.data)
      originalPlaylist.value = res.data.data
      songs.value = [...originalPlaylist.value]
      if (songs.value.length > 0) {
        currentSong.value = songs.value[0]
        isPlaying.value = true
      }
      
      if (playlistRef.value) {
        playlistRef.value.handlePlayFavorites()
      }
    } catch (error) {
      console.log('Không thể tải danh sách bài hát yêu thích', error)
    }
  }

  const handleClearFavorites = () => {
    getSongsFromServer()
  }

  const handleChangePlaylist = (playlistId) => {
    currentPlaylistId.value = playlistId
    
    if (!playlistId) {
      getSongsFromServer()
    }
  }

  const handlePlaylistChange = (playlist) => {
    currentPlaylistId.value = playlist?.id || null
    
    if (playlist) {
      handlePlayPlaylist(playlist.id)
    } else {
      getSongsFromServer()
    }
  }

  return {
    // State
    originalPlaylist,
    songs,
    playlists,
    currentPlaylistId,
    isShuffled,
    playlistRef,
    currentPlaylist,
    
    // Methods
    getSongsFromServer,
    fetchPlaylists,
    shufflePlaylist,
    restorePlaylist,
    handleShuffleUpdate,
    nextSong,
    prevSong,
    handlePlayPlaylist,
    handlePlayFavorites,
    handleClearFavorites,
    handleChangePlaylist,
    handlePlaylistChange
  }
}