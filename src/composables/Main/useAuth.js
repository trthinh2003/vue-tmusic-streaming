import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useProfileStore } from '@/stores/useProfile.js'
import axiosInstance from '@/configs/axios'

export function useAuth() {
  const router = useRouter()
  const currentUser = ref({})

  const initializeUser = () => {
    currentUser.value = useProfileStore().getProfile()
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
    }
  }

  return {
    currentUser,
    initializeUser,
    confirmLogout
  }
}