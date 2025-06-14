import { defineStore } from "pinia";
import { getProfile } from "@/services/authService";

export const useProfileStore = defineStore("profile", {
    state: () => ({
        profile: {},
    }),
    actions: {
        setProfile(profile) {
            this.profile = profile;
        },
        getProfile() {
            return this.profile;
        },
        clearProfile() {
            this.profile = {};
        },
    },
});