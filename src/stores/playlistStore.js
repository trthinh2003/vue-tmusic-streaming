import { defineStore } from 'pinia';

export const usePlaylistStore = defineStore('playlist', {
  state: () => ({
    playlists: [],
  }),
  actions: {
    setPlaylists(playlists) {
      this.playlists = playlists;
    },
    addPlaylist(playlist) {
      this.playlists.push(playlist);
    },
    updatePlaylist(updated) {
      const index = this.playlists.findIndex(p => p.id === updated.id);
      if (index !== -1) this.playlists[index] = updated;
    },
    deletePlaylist(id) {
      this.playlists = this.playlists.filter(p => p.id !== id);
    }
  }
});