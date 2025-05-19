<template>
  <router-view></router-view>
</template>

<script setup>
import { onMounted } from 'vue'
import { useProfileStore } from '@/stores/useProfile'
import { getProfile, startRefreshTokenTimer } from '@/services/authService'
import axiosInstance from '@/configs/axios'

onMounted(async () => {
  const profileStore = useProfileStore()
  if (Object.keys(profileStore.profile).length !== 0) {
    try {
      const res = await axiosInstance.get('/auth/me')
      profileStore.setProfile(res.data)
      startRefreshTokenTimer()
      console.log('Đã kích hoạt refresh token định kỳ sau reload')
    } catch (err) {
      console.log('Chưa đăng nhập hoặc token hết hạn')
    }
  }
})
</script>