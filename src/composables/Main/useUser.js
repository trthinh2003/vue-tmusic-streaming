import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/useProfile'
import axiosInstance from '@/configs/axios'
import { message } from 'ant-design-vue'

export function useUser() {
  const router = useRouter()
  const profileStore = useProfileStore()
  const currentUser = ref(profileStore.getProfile())
  const logoutModalVisible = ref(false)

  const handleLogout = () => {
    logoutModalVisible.value = true
  }

  const confirmLogout = async () => {
    try {
      const response = await axiosInstance.get('/auth/logout')
      if (response.status === 200) {
        message.success(response.data.message)
        setTimeout(() => {
          router.push({ name: 'login' })
        }, 1000)
      }
    } catch (error) {
      message.error("Đã có lỗi xảy ra!")
    } finally {
      logoutModalVisible.value = false
    }
  }

  return {
    currentUser,
    logoutModalVisible,
    handleLogout,
    confirmLogout
  }
}