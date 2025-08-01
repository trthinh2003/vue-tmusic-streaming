import { ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { getMyPlaylists, addSongsToPlaylist } from '@/services/playlistService';
import { downloadService } from '@/services/downloadService';
import { usePlaylistSignalStore } from '@/stores/playlistSignalStore';

export function useSongActions() {
  const showPlaylistModal = ref(false);
  const selectedSongForPlaylist = ref(null);
  const playlists = ref([]);
  const newPlaylistName = ref('');
  const playlistSignalStore = usePlaylistSignalStore();

  const showDownloadModal = ref(false);
  const selectedSongForDownload = ref(null);
  const downloadStatuses = ref(new Map());

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
  const handleDownload = async (song) => {
    try {
      // Check nếu đã download rồi thì hiển thị modal để download lại hoặc chỉ thông báo
      const status = await downloadService.checkDownloadStatus(song.id);
      
      if (status.hasDownloaded) {
        message.info(`Bài hát "${song.title}" đã được tải xuống trước đó`);
      }
      
      selectedSongForDownload.value = song;
      showDownloadModal.value = true;
    } catch (error) {
      console.error('Error checking download status:', error);
      // Vẫn cho phép download nếu có lỗi check status
      selectedSongForDownload.value = song;
      showDownloadModal.value = true;
    }
  };
  const performDownload = async (downloadInfo) => {
    const { song, quality } = downloadInfo;
    const fileName = `${song.title} - ${song.artist} (${quality}).mp3`;
    
    try {
      await downloadService.recordDownload(song.id);
      downloadStatuses.value.set(song.id, true);
      const downloadLink = document.createElement('a');
      downloadLink.href = song.audio;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      message.success(`Đã tải xuống "${song.title}"`);
      showDownloadModal.value = false;
    } catch (error) {
      console.error('Download error:', error);
      message.error('Có lỗi xảy ra khi tải xuống');
    }
  };
  const checkMultipleDownloadStatus = async (songs) => {
    try {
      const promises = songs.map(song => 
        downloadService.checkDownloadStatus(song.id)
          .then(response => ({ songId: song.id, hasDownloaded: response.hasDownloaded }))
          .catch(() => ({ songId: song.id, hasDownloaded: false }))
      );
      
      const results = await Promise.all(promises);
      results.forEach(result => {
        downloadStatuses.value.set(result.songId, result.hasDownloaded);
      });
    } catch (error) {
      console.error('Error checking multiple download status:', error);
    }
  };
  const getDownloadStatus = (songId) => {
    return downloadStatuses.value.get(songId) || false;
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
      await loadPlaylists();
      showPlaylistModal.value = false;
    } catch (error) {
      console.error("Lỗi khi thêm bài hát vào playlist:", error);
      message.error("Bài hát này đã có trong playlist của bạn.");
    }
  };

  const createNewPlaylist = async () => {
    if (!newPlaylistName.value.trim()) {
      message.error('Vui lòng nhập tên playlist');
      return;
    }
    
    try {
      const newPlaylist = {
        id: Date.now(),
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

  const loadPlaylists = async () => {
    try {
      const myPlaylistRes = await getMyPlaylists();
      playlists.value = myPlaylistRes.data;
    } catch (error) {
      console.error("Lỗi khi tải playlists:", error);
    }
  };

  watch(() => playlistSignalStore.refreshFlag, (newVal) => {
    loadPlaylists();
  });

  return {
    // State
    showPlaylistModal,
    selectedSongForPlaylist,
    playlists,
    newPlaylistName,
    showDownloadModal,
    selectedSongForDownload,
    downloadStatuses,
    
    // Methods
    handleSongAction,
    addSongToPlaylist,
    createNewPlaylist,
    loadPlaylists,
    performDownload,
    checkMultipleDownloadStatus,
    getDownloadStatus
  };
}