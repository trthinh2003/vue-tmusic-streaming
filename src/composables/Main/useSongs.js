// composables/Main/useSongs.js
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { getRandomSongs, getSongs, getSongByPlaylist } from '@/services/songService'
import { usePlayerStore } from '@/stores/playerStore'
import { useNextSongSignalStore } from '@/stores/nextSongSignalStore'

export function useSongs() {
  const playerStore = usePlayerStore()
  const nextSongSignalStore = useNextSongSignalStore()
  
  const songs = ref([])
  const originalPlaylist = ref([])
  const searchQuery = ref('')
  
  // Filtered songs based on search query
  const filteredSongs = computed(() => {
    if (!searchQuery.value) return songs.value
    const query = searchQuery.value.toLowerCase()
    return songs.value.filter(song => 
      song.title.toLowerCase().includes(query) || 
      song.artist.toLowerCase().includes(query) ||
      song.genre.toLowerCase().includes(query)
    )
  })
  
  // Load songs from server
  const getSongsFromServer = async () => {
    try {
      const response = await getRandomSongs(1, 21, 20)
      originalPlaylist.value = response.data.data
      songs.value = [...originalPlaylist.value]
      console.log('Songs loaded:', songs.value)
      return songs.value
    } catch (error) {
      console.error('Error loading songs:', error)
      message.error('Không thể tải danh sách bài hát')
      return []
    }
  }
  
  // Load all songs
  const loadAllSongs = async () => {
    try {
      const response = await getSongs(1, 100)
      songs.value = response.data.data
      return songs.value
    } catch (error) {
      console.error('Error loading all songs:', error)
      message.error('Không thể tải danh sách bài hát')
      return []
    }
  }
  
  // Load songs from specific playlist
  const loadPlaylistSongs = async (playlistId) => {
    try {
      const response = await getSongByPlaylist(playlistId)
      originalPlaylist.value = response.data.data
      songs.value = [...originalPlaylist.value]
      return songs.value
    } catch (error) {
      console.error('Error loading playlist songs:', error)
      message.error('Không thể tải bài hát trong playlist')
      return []
    }
  }
  
  // Select a song
  const selectSong = (song, currentSong, isPlaying) => {
    currentSong.value = song
    playerStore.setCurrentSongId(song.id)
    playerStore.setPlayingState(true)
    isPlaying.value = true
  }
  
  // Play next song
  const nextSong = (currentSong, isPlaying) => {
    const currentIndex = filteredSongs.value.findIndex(song => song.id === currentSong.value.id)
    const nextIndex = (currentIndex + 1) % filteredSongs.value.length
    currentSong.value = filteredSongs.value[nextIndex]
    isPlaying.value = true
    nextSongSignalStore.triggerRefresh(currentSong.value.id)
  }
  
  // Play previous song
  const prevSong = (currentSong, isPlaying) => {
    const currentIndex = filteredSongs.value.findIndex(song => song.id === currentSong.value.id)
    const prevIndex = (currentIndex - 1 + filteredSongs.value.length) % filteredSongs.value.length
    currentSong.value = filteredSongs.value[prevIndex]
    isPlaying.value = true
    nextSongSignalStore.triggerRefresh(currentSong.value.id)
  }
  
  // Shuffle playlist using Fisher-Yates algorithm
  const shufflePlaylist = () => {
    const shuffled = [...filteredSongs.value.length > 0 ? filteredSongs.value : songs.value]
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    songs.value = shuffled
    return shuffled
  }
  
  // Restore original playlist
  const restorePlaylist = () => {
    songs.value = [...originalPlaylist.value]
  }
  
  // Handle search
  const handleSearch = () => {
    // Search logic is handled by computed filteredSongs
    console.log('Searching for:', searchQuery.value)
  }
  
  return {
    // State
    songs,
    originalPlaylist,
    searchQuery,
    filteredSongs,
    
    // Methods
    getSongsFromServer,
    loadAllSongs,
    loadPlaylistSongs,
    selectSong,
    nextSong,
    prevSong,
    shufflePlaylist,
    restorePlaylist,
    handleSearch
  }
}