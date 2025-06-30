<template>
  <a-modal
    v-model:open="visible"
    title="Thông tin cá nhân"
    :width="600"
    :footer="null"
    centered
    class="profile-modal"
    @cancel="handleCancel"
  >
    <div class="profile-content">
      <!-- Loading state -->
      <div v-if="loading" class="text-center py-4">
        <a-spin size="large" />
        <p class="mt-2">Đang tải thông tin...</p>
      </div>

      <!-- Profile content -->
      <div v-else class="profile-info">
        <!-- Avatar section -->
        <div class="avatar-section text-center mb-4">
          <div class="avatar-container position-relative d-inline-block">
            <a-avatar 
              :size="120" 
              :src="userProfile.avatar || defaultAvatar" 
              class="profile-avatar"
            />
            <a-button 
              v-if="!isViewOnly"
              type="text" 
              class="edit-avatar-btn position-absolute"
              @click="handleAvatarEdit"
            >
              <i class="fa-solid fa-camera"></i>
            </a-button>
          </div>
          <h3 class="mt-3 mb-1">{{ userProfile.name || userProfile.userName || 'Người dùng' }}</h3>
          <p class="text-muted">{{ userProfile.email }}</p>
        </div>

        <!-- User info form -->
        <a-form 
          :model="editForm" 
          layout="vertical"
          :disabled="isViewOnly"
        >
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="Tên hiển thị">
                <a-input 
                  v-model:value="editForm.name" 
                  placeholder="Nhập tên hiển thị"
                  :disabled="!isEditing"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="Tên đăng nhập">
                <a-input 
                  v-model:value="editForm.userName" 
                  placeholder="Nhập tên đăng nhập"
                  :disabled="!isEditing"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="Email">
            <a-input 
              v-model:value="editForm.email" 
              type="email"
              placeholder="Nhập email"
              :disabled="!isEditing"
            />
          </a-form-item>

          <a-form-item label="Giới tính">
            <a-radio-group v-model:value="editForm.gender" :disabled="!isEditing">
              <a-radio :value="true">Nam</a-radio>
              <a-radio :value="false">Nữ</a-radio>
            </a-radio-group>
          </a-form-item>

          <!-- Statistics -->
          <div class="profile-stats">
            <h4>Thống kê</h4>
            <a-row :gutter="16" class="stats-row">
              <a-col :span="8">
                <div class="stat-item text-center">
                  <div class="stat-number">{{ userStats.totalPlaylists }}</div>
                  <div class="stat-label">Playlist</div>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="stat-item text-center">
                  <div class="stat-number">{{ userStats.totalFavorites }}</div>
                  <div class="stat-label">Yêu thích</div>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="stat-item text-center">
                  <div class="stat-number">{{ userStats.totalListened }}</div>
                  <div class="stat-label">Đã nghe</div>
                </div>
              </a-col>
            </a-row>
          </div>
        </a-form>

        <!-- Action buttons -->
        <div class="profile-actions mt-4 d-flex justify-content-end gap-2">
          <a-button @click="handleCancel">
            Đóng
          </a-button>
          <a-button 
            v-if="!isEditing && !isViewOnly" 
            type="primary" 
            @click="startEditing"
          >
            Chỉnh sửa
          </a-button>
          <template v-if="isEditing">
            <a-button @click="cancelEditing">
              Hủy
            </a-button>
            <a-button 
              type="primary" 
              @click="saveProfile"
              :loading="saving"
            >
              Lưu thay đổi
            </a-button>
          </template>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import { getUserProfile, updateUserProfile } from '@/services/userService'

// Props
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  userId: {
    type: Number,
    default: null
  },
  isViewOnly: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:open', 'close', 'profile-updated'])

// Reactive data
const visible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const loading = ref(false)
const saving = ref(false)
const isEditing = ref(false)

const userProfile = ref({
  id: null,
  name: '',
  userName: '',
  email: '',
  avatar: '',
  gender: true,
  role: 'User'
})

const editForm = ref({
  name: '',
  userName: '',
  email: '',
  gender: true
})

const userStats = ref({
  totalPlaylists: 0,
  totalFavorites: 0,
  totalListened: 0
})

const defaultAvatar = 'https://via.placeholder.com/120x120?text=Avatar'

const loadUserProfile = async () => {
  if (!props.userId) return
  
  loading.value = true
  try {
    const response = await getUserProfile(props.userId)
    userProfile.value = response.data
    editForm.value = {
      name: userProfile.value.name,
      userName: userProfile.value.userName,
      email: userProfile.value.email,
      gender: userProfile.value.gender
    }

    userStats.value = {
      totalPlaylists: Math.floor(Math.random() * 20) + 1,
      totalFavorites: Math.floor(Math.random() * 100) + 10,
      totalListened: Math.floor(Math.random() * 500) + 50
    }
  } catch (error) {
    console.error('Error loading user profile:', error)
    message.error('Không thể tải thông tin người dùng')
  } finally {
    loading.value = false
  }
}

const startEditing = () => {
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  editForm.value = {
    name: userProfile.value.name,
    userName: userProfile.value.userName,
    email: userProfile.value.email,
    gender: userProfile.value.gender
  }
}

const saveProfile = async () => {
  saving.value = true
  try {
    const updateData = {
      id: userProfile.value.id,
      ...editForm.value
    }
    
    const response = await updateUserProfile(updateData)
    
    userProfile.value = { ...userProfile.value, ...editForm.value }
    
    isEditing.value = false
    message.success('Cập nhật thông tin thành công!')
    
    emit('profile-updated', userProfile.value)
  } catch (error) {
    console.error('Error updating profile:', error)
    message.error('Không thể cập nhật thông tin')
  } finally {
    saving.value = false
  }
}

const handleAvatarEdit = () => {
  // TODO: Implement avatar upload
  message.info('Tính năng đổi avatar sẽ được cập nhật sau')
}

const handleCancel = () => {
  visible.value = false
  isEditing.value = false
  emit('close')
}

// Watch for modal open/close and userId changes
watch(() => props.open, (newVal) => {
  if (newVal && props.userId) {
    loadUserProfile()
  }
})

watch(() => props.userId, (newVal) => {
  if (newVal && props.open) {
    loadUserProfile()
  }
})
</script>

<style scoped>
.profile-modal :deep(.ant-modal-content) {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
}

.profile-modal :deep(.ant-modal-header) {
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-modal :deep(.ant-modal-title) {
  color: white;
  font-weight: 600;
}

.profile-modal :deep(.ant-modal-close) {
  color: white;
}

.profile-content {
  padding: 20px 0;
}

.avatar-container {
  position: relative;
}

.profile-avatar {
  border: 4px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.profile-avatar:hover {
  border-color: rgba(255, 255, 255, 0.4);
}

.edit-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #1890ff;
  color: white;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-avatar-btn:hover {
  background: #40a9ff;
  color: white;
}

.profile-info h3 {
  color: white;
  margin: 0;
}

.text-muted {
  color: rgba(255, 255, 255, 0.65) !important;
}

.profile-modal :deep(.ant-form-item-label > label) {
  color: white;
  font-weight: 500;
}

.profile-modal :deep(.ant-input) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.profile-modal :deep(.ant-input:focus) {
  background: rgba(255, 255, 255, 0.15);
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.profile-modal :deep(.ant-input:disabled) {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.5);
}

.profile-modal :deep(.ant-radio-wrapper) {
  color: white;
}

.profile-modal :deep(.ant-radio-checked .ant-radio-inner) {
  background-color: #1890ff;
  border-color: #1890ff;
}

.profile-stats {
  margin-top: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-stats h4 {
  color: white;
  margin-bottom: 16px;
  text-align: center;
}

.stats-row {
  margin: 0;
}

.stat-item {
  padding: 12px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  margin-top: 4px;
}

.profile-actions .gap-2 {
  gap: 8px;
}

.profile-modal :deep(.ant-btn-primary) {
  background: #1890ff;
  border-color: #1890ff;
}

.profile-modal :deep(.ant-btn-primary:hover) {
  background: #40a9ff;
  border-color: #40a9ff;
}

.profile-modal :deep(.ant-btn:not(.ant-btn-primary)) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.profile-modal :deep(.ant-btn:not(.ant-btn-primary):hover) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

.profile-modal :deep(.ant-spin) {
  color: white;
}
</style>