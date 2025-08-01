import axiosInstance from "@/configs/axios";

export async function getMyPlaylists() {
  return await axiosInstance.get(`/playlists/me`);
}

export async function getPlaylistsPopular(page = 1, pageSize = 10, query = '') {
  const response = await axiosInstance.get(`/playlists/popular?page=${page}&pageSize=${pageSize}&query=${query}`);
  return response;
}

export async function getSongsInPlaylist(playlistId) {
  return await axiosInstance.get(`/playlists/${playlistId}/songs`);
}

export const createPlaylist = async (playlistData) => {
  try {
    const response = await axiosInstance.post('/playlists', playlistData);
    return response.data;
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }
};


export const updatePlaylist = async (playlistId, playlistData) => {
  try {
    const response = await axiosInstance.patch(`/playlists/${playlistId}`, playlistData);
    return response.data;
  } catch (error) {
    console.error('Error updating playlist:', error);
    throw error;
  }
};

export async function uploadPlaylistImage(formData) {
  try {
    const response = await axiosInstance.post('/playlists/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading playlist image:', error);
    throw error;
  }
}

export const updatePrivacyPlaylist = async (playlistId, privacy) => {
  try {
    const response = await axiosInstance.patch(`/playlists/${playlistId}/privacy`, { isDisplay: privacy });
    return response.data;
  } catch (error) {
    console.error('Error updating playlist privacy:', error);
    throw new Error(error.response?.data?.message || 'Failed to update privacy');
  }
};

export const addSongsToPlaylist = async (playlistId, songId) => {
  try {
    const response = await axiosInstance.post(`/playlists/${playlistId}/songs`, {
      songId: songId
    });
    return response.data;
  } catch (error) {
    console.error('Error adding songs to playlist:', error);
    throw error;
  }
};

export const removeSongFromPlaylist = async (playlistId, songId) => {
  try {
    const response = await axiosInstance.delete(`/playlists/${playlistId}/songs`, {
      params: { songId }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing songs from playlist:', error);
    throw error;
  }
};

export const deletePlaylist = async (playlistId) => {
  try {
    const response = await axiosInstance.delete(`/playlists/${playlistId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting playlist:', error);
    throw error;
  }
};

