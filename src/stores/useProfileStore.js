import { defineStore } from 'pinia';

export const useProfileStore = defineStore('profile', {
  state: () => ({
    userProfile: {
      id: null,
      username: '',
      email: '',
      role: '',
      name: '',
      avatar: '',
      gender: true, 
      createdAt: null,
    },
  }),
  actions: {
    setProfile(profile) {
      this.userProfile = { ...this.userProfile, ...profile };
    },
    clearProfile() {
      this.userProfile = {
        id: null,
        username: '',
        email: '',
        role: '',
        name: '',
        avatar: '',
        gender: true,
        createdAt: null,
      };
    },
  },
  getters: {
    getProfile: (state) => state.userProfile,
    isLoggedIn: (state) => !!state.userProfile.id,
  },
});