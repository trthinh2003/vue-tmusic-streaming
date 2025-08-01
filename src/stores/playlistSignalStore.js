import { defineStore } from 'pinia';

export const usePlaylistSignalStore = defineStore('playlistSignal', {
  state: () => ({
    refreshFlag: false
  }),
  actions: {
    triggerRefresh() {
      this.refreshFlag = !this.refreshFlag;
    }
  }
});