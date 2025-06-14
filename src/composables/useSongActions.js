import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { getMyPlaylists, addSongsToPlaylist } from '@/services/playlistService';

export function useSongActions() {
  const showPlaylistModal = ref(false);
  const selectedSongForPlaylist = ref(null);
  const playlists = ref([]);
  const newPlaylistName = ref('');

  // Xử lý các hành động với bài hát
  const handleSongAction = (action, song) => {
    switch (action) {
      case 'add':
        handleAddToPlaylist(song);
        break;
      case 'favorite':
        handleFavorite(song);
        break;
      case 'download':
        handleDownload(song);
        break;
      case 'share':
        handleShare(song);
        break;
      default:
        console.log(`Thao tác "${action}" trên bài hát:`, song);
        message.info(`Đã chọn thao tác "${action}" cho bài hát "${song.title}"`);
    }
  };

  // Xử lý thêm vào playlist
  const handleAddToPlaylist = (song) => {
    selectedSongForPlaylist.value = song;
    showPlaylistModal.value = true;
  };

  // Xử lý yêu thích
  const handleFavorite = (song) => {
    console.log('Yêu thích bài hát:', song);
    message.success(`Đã thêm "${song.title}" vào danh sách yêu thích`);
  };

  // Xử lý tải xuống
  const handleDownload = (song) => {
    console.log('Tải xuống bài hát:', song);
    message.info(`Đang tải xuống "${song.title}"`);
  };

  // Xử lý chia sẻ
  const handleShare = (song) => {
    console.log('Chia sẻ bài hát:', song);
    message.info(`Đã sao chép link chia sẻ "${song.title}"`);
  };

  // Thêm bài hát vào playlist
  const addSongToPlaylist = async (playlistId) => {
    try {
      await addSongsToPlaylist(playlistId, selectedSongForPlaylist.value.id);
      message.success(`Đã thêm "${selectedSongForPlaylist.value.title}" vào playlist`);
      
      // Refresh danh sách playlist
      await loadPlaylists();
      
      showPlaylistModal.value = false;
    } catch (error) {
      console.error("Lỗi khi thêm bài hát vào playlist:", error);
      message.error("Bài hát này đã có trong playlist của bạn.");
    }
  };

  // Tạo playlist mới
  const createNewPlaylist = async () => {
    if (!newPlaylistName.value.trim()) {
      message.error('Vui lòng nhập tên playlist');
      return;
    }
    
    try {
      // Tạo playlist mới (cần implement API)
      const newPlaylist = {
        id: Date.now(), // Temporary ID
        name: newPlaylistName.value.trim(),
        songCount: 0
      };
      
      playlists.value.push(newPlaylist);
      newPlaylistName.value = '';
      message.success(`Đã tạo playlist "${newPlaylist.name}"`);
    } catch (error) {
      console.error("Lỗi khi tạo playlist:", error);
      message.error("Không thể tạo playlist mới");
    }
  };

  // Load danh sách playlist
  const loadPlaylists = async () => {
    try {
      const myPlaylistRes = await getMyPlaylists();
      playlists.value = myPlaylistRes.data;
    } catch (error) {
      console.error("Lỗi khi tải playlists:", error);
    }
  };

  return {
    // State
    showPlaylistModal,
    selectedSongForPlaylist,
    playlists,
    newPlaylistName,
    
    // Methods
    handleSongAction,
    addSongToPlaylist,
    createNewPlaylist,
    loadPlaylists
  };
}