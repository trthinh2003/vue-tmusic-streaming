import { defineStore } from "pinia";

export const useProfileStore = defineStore("profile", {
    state: () => ({
        profile: {},
    }),
    actions: {
        setProfile(profile) {
            this.profile = profile;
        },
        clearProfile() {
            this.profile = {};
        },
    },
});