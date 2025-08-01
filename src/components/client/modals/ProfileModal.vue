<template>
  <a-modal
    :open="open"
    @cancel="handleClose"
    :footer="null"
    centered
    wrap-class-name="professional-profile-modal"
    :width="520"
  >
    <div class="modal-header">
      <div class="header-icon">
        <UserOutlined />
      </div>
      <h2 class="modal-title">Hồ sơ cá nhân</h2>
      <p class="modal-subtitle">Quản lý thông tin tài khoản của bạn</p>
    </div>

    <a-spin :spinning="loading" class="loading-spinner">
      <div class="modal-body">
        <!-- Avatar Section -->
        <div class="avatar-section">
          <div class="avatar-container">
            <a-upload
              v-model:file-list="fileList"
              name="avatar"
              list-type="picture-card"
              class="avatar-uploader"
              :show-upload-list="false"
              :before-upload="beforeUpload"
              @change="handleChangeAvatar"
              :max-count="1"
            >
              <div class="avatar-wrapper">
                <a-avatar
                  :size="120"
                  :src="avatarPreviewUrl || profileForm.avatar || '/placeholder-avatar.png'"
                  alt="Avatar"
                  class="user-avatar"
                >
                  <UserOutlined v-if="!avatarPreviewUrl && !profileForm.avatar" />
                </a-avatar>
                <div class="avatar-overlay">
                  <CameraOutlined class="camera-icon" />
                  <span class="upload-text">Thay đổi</span>
                </div>
              </div>
            </a-upload>
            
            <a-button
              v-if="profileForm.avatar || avatarPreviewUrl"
              type="text"
              size="small"
              danger
              @click="removeAvatar"
              class="remove-avatar-btn"
            >
              <DeleteOutlined />
              Xóa ảnh
            </a-button>
          </div>
        </div>

        <!-- Form Section -->
        <div class="form-section">
          <a-form
            :model="profileForm"
            name="profile_form"
            layout="vertical"
            @finish="handleUpdateProfile"
            class="profile-form"
          >
            <div class="form-grid">
              <a-form-item
                label="Tên hiển thị"
                name="name"
                :rules="[{ required: true, message: 'Vui lòng nhập tên hiển thị!' }]"
                class="form-item"
              >
                <a-input 
                  v-model:value="profileForm.name" 
                  placeholder="Nhập tên hiển thị"
                  size="large"
                  class="custom-input"
                >
                  <template #prefix>
                    <UserOutlined class="input-icon" />
                  </template>
                </a-input>
              </a-form-item>

              <a-form-item
                label="Email"
                name="email"
                :rules="[{ required: true, message: 'Vui lòng nhập Email!', type: 'email' }]"
                class="form-item"
              >
                <a-input 
                  v-model:value="profileForm.email" 
                  placeholder="Nhập địa chỉ email"
                  size="large"
                  class="custom-input"
                >
                  <template #prefix>
                    <MailOutlined class="input-icon" />
                  </template>
                </a-input>
              </a-form-item>
            </div>

            <a-form-item 
              label="Giới tính" 
              name="gender"
              class="form-item gender-item"
            >
              <a-radio-group 
                v-model:value="profileForm.gender"
                class="gender-radio-group"
              >
                <a-radio :value="true" class="gender-radio">
                  <ManOutlined class="gender-icon" />
                  Nam
                </a-radio>
                <a-radio :value="false" class="gender-radio">
                  <WomanOutlined class="gender-icon" />
                  Nữ
                </a-radio>
              </a-radio-group>
            </a-form-item>
          </a-form>
        </div>
      </div>
    </a-spin>

    <!-- Footer Actions -->
    <div class="modal-footer">
      <a-button 
        @click="handleClose"
        size="large"
        class="cancel-btn"
      >
        Hủy bỏ
      </a-button>
      <a-button 
        type="primary" 
        @click="handleUpdateProfile"
        :loading="submitting"
        size="large"
        class="submit-btn"
      >
        <SaveOutlined />
        Lưu thay đổi
      </a-button>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, h } from 'vue';
import { message, Upload, Modal, Avatar, Form, Input, Radio, Button, Spin, Tooltip } from 'ant-design-vue';
import { 
  CameraOutlined, 
  DeleteOutlined, 
  UserOutlined, 
  MailOutlined, 
  ManOutlined, 
  WomanOutlined,
  SaveOutlined 
} from '@ant-design/icons-vue';
import { getUserProfile, updateUserProfile } from '@/services/profileService';
import { useProfileStore } from '@/stores/useProfileStore.js';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:open', 'profileUpdated']);

const profileStore = useProfileStore();

const loading = ref(false);
const submitting = ref(false);
const profileForm = ref({
  name: '',
  email: '',
  gender: true, // true cho Nam, false cho Nữ
  avatar: '',
});
const fileList = ref([]);
const avatarPreviewUrl = ref('');

// Watch để fetch profile khi modal mở
watch(() => props.open, async (newVal) => {
  if (newVal) {
    await fetchUserProfile();
  } else {
    // Reset form và fileList khi đóng modal
    fileList.value = [];
    avatarPreviewUrl.value = '';
  }
});

const fetchUserProfile = async () => {
  loading.value = true;
  try {
    const response = await getUserProfile();
    // console.log("User profile:", response);
    if (response) {
      profileForm.value = {
        name: response.name,
        email: response.email,
        gender: response.gender,
        avatar: response.avatar,
      };
    }
  } catch (error) {
    message.error('Không thể tải thông tin hồ sơ.');
    console.error('Lỗi khi tải hồ sơ:', error);
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  emit('update:open', false);
};

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
  if (!isJpgOrPng) {
    message.error('Bạn chỉ có thể tải lên file JPG/PNG/WEBP!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Ảnh phải nhỏ hơn 2MB!');
  }
  return isJpgOrPng && isLt2M;
};

const handleChangeAvatar = (info) => {
  if (info.file.status === 'done' || info.file.status === 'uploading') {
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreviewUrl.value = e.target.result;
    };
    reader.readAsDataURL(info.file.originFileObj);
    fileList.value = [info.file]; // Giữ lại file đang được chọn
  } else if (info.file.status === 'removed') {
    fileList.value = [];
    avatarPreviewUrl.value = '';
    // Nếu avatar cũ là một URL từ server, và người dùng xóa nó
    // thì profileForm.avatar cần được set về rỗng để gửi lên server
    profileForm.value.avatar = '';
  }
};

const removeAvatar = () => {
  Modal.confirm({
    title: h('div', { style: { color: 'white' } }, 'Xác nhận xóa ảnh đại diện'),
    content: h('div', { style: { color: 'white' } }, 'Bạn có chắc chắn muốn xóa ảnh đại diện hiện tại?'),
    okText: 'Xóa',
    cancelText: 'Hủy',
    onOk: () => {
      fileList.value = [];
      avatarPreviewUrl.value = '';
      profileForm.value.avatar = ''; // Đặt avatar về rỗng để báo hiệu xóa trên BE
      message.success('Ảnh đại diện đã được xóa (sẽ lưu khi bạn cập nhật hồ sơ).');
    },
  });
};

const handleUpdateProfile = async () => {
  submitting.value = true;
  try {
    const formData = new FormData();
    formData.append('name', profileForm.value.name);
    formData.append('email', profileForm.value.email);
    formData.append('gender', profileForm.value.gender);

    // Xử lý file avatar
    if (fileList.value.length > 0 && fileList.value[0].originFileObj) {
      formData.append('avatarFile', fileList.value[0].originFileObj);
    } else if (profileForm.value.avatar === '' && !avatarPreviewUrl.value) {
      // Nếu người dùng đã xóa ảnh đại diện hoặc không có ảnh nào
      // Gửi một chuỗi rỗng để báo hiệu xóa avatar trên backend
      formData.append('avatarUrl', '');
    }
    // Nếu người dùng không chọn file mới và không xóa, không cần gửi avatarFile hay avatarUrl

    const response = await updateUserProfile(formData);
    message.success(response.message);
    // Cập nhật profile trong store sau khi cập nhật thành công
    profileStore.setProfile({
      ...profileStore.getProfile(),
      name: response.user.name,
      email: response.user.email,
      avatar: response.user.avatar,
      gender: response.user.gender,
    });
    emit('profileUpdated', response.user);
    handleClose();
  } catch (error) {
    console.error('Lỗi khi cập nhật hồ sơ:', error);
    if (error.response && error.response && error.response.message) {
      message.error(error.response.message);
    } else {
      message.error('Có lỗi xảy ra khi cập nhật hồ sơ.');
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
/* Header */
.modal-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 20px 20px 10px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 28px;
  color: white;
}

.modal-title {
  color: white;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.modal-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  margin: 0;
  font-weight: 400;
}

/* Body */
.modal-body {
  background: white;
  padding: 20px 25px;
}

.loading-spinner {
  min-height: 300px;
}

/* Avatar Section */
.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.avatar-container {
  text-align: center;
}

.avatar-uploader .ant-upload-select-picture-card {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #f0f2f5;
  background: #fafafa;
  transition: all 0.3s ease;
  overflow: hidden;
}

.avatar-uploader .ant-upload-select-picture-card:hover {
  border-color: #1890ff;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(24, 144, 255, 0.2);
}

.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.user-avatar {
  width: 100% !important;
  height: 100% !important;
  border-radius: 50%;
  object-fit: cover;
  font-size: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: all 0.3s ease;
  border-radius: 50%;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.camera-icon {
  font-size: 24px;
  color: white;
  margin-bottom: 4px;
}

.upload-text {
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.remove-avatar-btn {
  margin-top: 12px;
  color: #ff4d4f;
  font-size: 12px;
  border: none;
  padding: 0;
  height: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.remove-avatar-btn:hover {
  color: #ff7875;
  background: transparent;
}

/* Form Section */
.form-section {
  max-width: 480px;
  margin: 0 auto;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.form-item {
  margin-bottom: 0;
}

:deep(.form-item .ant-form-item-label > label) {
  color: #262626;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
}

.custom-input {
  border-radius: 8px;
  border: 1px solid #d9d9d9;
  transition: all 0.3s ease;
}

.custom-input:hover,
.custom-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.input-icon {
  color: #8c8c8c;
}

/* Gender Section */
.gender-item {
  margin-bottom: 0;
}

.gender-radio-group {
  display: flex;
  gap: 24px;
  margin-top: 8px;
}

.gender-radio {
  flex: 1;
  margin: 0;
  padding: 16px;
  background: #fafafa;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.gender-radio:hover {
  background: #f0f9ff;
  border-color: #bae7ff;
}

:deep(.gender-radio.ant-radio-wrapper-checked) {
  background: #e6f7ff;
  border-color: #1890ff;
  color: #1890ff;
}

.gender-icon {
  margin-right: 8px;
  font-size: 16px;
}

/* Footer */
.modal-footer {
  padding: 24px 32px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  border-radius: 8px;
  border: 1px solid #d9d9d9;
  color: #595959;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Responsive */
@media (max-width: 576px) {
  .modal-header {
    padding: 20px 20px 15px;
  }
  
  .modal-body {
    padding: 20px 25px;
  }
  
  .modal-footer {
    padding: 20px;
    flex-direction: column;
  }
  
  .modal-title {
    font-size: 24px;
  }
  
  .gender-radio-group {
    flex-direction: column;
    gap: 12px;
  }

  .submit-btn {
    justify-content: center;
  }
}

/* Loading Overlay */
:deep(.ant-spin-container) {
  transition: opacity 0.3s ease;
}

:deep(.ant-spin-spinning .ant-spin-container) {
  opacity: 0.6;
}

:deep(.ant-spin .ant-spin-dot) {
  font-size: 24px;
}

:deep(.ant-spin .ant-spin-dot-item) {
  background-color: #1890ff;
}
</style>

<style>
.professional-profile-modal .ant-modal-content {
  border-radius: 16px;
  padding: 0;
  overflow: hidden;
}
.professional-profile-modal .ant-modal {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
.professional-profile-modal .ant-modal-body {
  padding: 0;
}
</style>