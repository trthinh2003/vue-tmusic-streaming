import { defineStore } from "pinia";

export const useNextSongSignalStore = defineStore('nextSongSignal', {
  state: () => ({
    refreshFlag: false,
    currentSongId: null
  }),
  actions: {
    triggerRefresh(songId) {
      this.currentSongId = songId;
      this.refreshFlag = !this.refreshFlag;
    }
  }
});