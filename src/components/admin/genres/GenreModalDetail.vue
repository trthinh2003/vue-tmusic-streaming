<template>
    <a-modal 
        :open="isModalVisible" 
        title="Chi tiết thể loại" 
        width="500px" 
        class="genre-modal" 
        @cancel="closeModal" 
        :footer="null"
        :maskClosable="false"
        :destroyOnClose="true"
    >
        <div class="genre-detail" v-if="genreData">
            <!-- Hiển thị ảnh -->
            <div class="detail-image-section" v-if="genreData.image">
                <label class="detail-label">Ảnh thể loại:</label>
                <div class="image-wrapper">
                    <img :src="genreData.image" :alt="genreData.name" class="detail-image" />
                </div>
            </div>
            
            <!-- Thông tin chi tiết -->
            <div class="detail-info">    
                <div class="detail-item">
                    <label class="detail-label">Tên thể loại:</label>
                    <span class="detail-value">{{ genreData.name }}</span>
                </div>
                
                <div class="detail-item">
                    <label class="detail-label">Số bài hát:</label>
                    <span class="detail-value">{{ genreData.songCount || 0 }}</span>
                </div>
                
                <div class="detail-item" v-if="genreData.createdAt">
                    <label class="detail-label">Ngày tạo:</label>
                    <span class="detail-value">{{ formatDate(genreData.createdAt) }}</span>
                </div>
            </div>
        </div>
        
        <template #footer>
            <div class="modal-footer">
                <a-button key="close" @click="closeModal" class="modal-btn close-btn">
                    Đóng
                </a-button>
            </div>
        </template>
    </a-modal>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    isModalVisible: Boolean,
    genreData: Object
});

const emit = defineEmits(["close-modal"]);

const closeModal = () => {
    emit("close-modal");
};

console.log(props.genreData);

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};
</script>

<style>
.genre-modal .ant-modal-content {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
    color: white !important;
    border-radius: 16px !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.genre-modal .ant-modal-header {
    background: transparent !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
    padding: 16px 24px !important;
}

.genre-modal .ant-modal-title {
    color: white !important;
    font-size: 1.25rem !important;
    font-weight: 600 !important;
}

.genre-modal .ant-modal-close {
    top: 16px !important;
    right: 16px !important;
}

.genre-modal .ant-modal-close-x {
    color: white !important;
    font-size: 16px !important;
    width: 32px !important;
    height: 32px !important;
    line-height: 32px !important;
}

.genre-modal .ant-modal-close:hover .ant-modal-close-x {
    color: #ff6b6b !important;
}

.genre-modal .ant-modal-body {
    padding: 0 24px 16px 24px !important;
}

.genre-modal .ant-modal-footer {
    background: transparent !important;
    border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
    padding: 16px 24px !important;
}
</style>

<style scoped>
/* Component specific styles */
.genre-detail {
    padding: 16px 0;
    color: white;
}

.detail-image-section {
    margin-bottom: 24px;
    text-align: center;
}

.image-wrapper {
    margin-top: 12px;
}

.detail-image {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    transition: transform 0.3s ease;
}

.detail-image:hover {
    transform: scale(1.05);
}

.detail-info {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: background 0.3s ease;
}

.detail-item:hover {
    background: rgba(255, 255, 255, 0.1);
}

.detail-label {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    min-width: 120px;
    font-size: 14px;
}

.detail-value {
    color: white;
    font-weight: 600;
    text-align: right;
    font-size: 14px;
}

.modal-footer {
    display: flex;
    justify-content: center;
    padding: 16px 0;
}

.modal-btn {
    border-radius: 8px;
    padding: 0 32px;
    height: 40px;
    font-weight: 500;
    font-size: 14px;
    transition: all 0.3s ease;
    border: none;
}

.close-btn {
    background: linear-gradient(90deg, #00dbde 0%, #fc00ff 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(0, 219, 222, 0.2);
}

.close-btn:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 219, 222, 0.4);
    color: white;
}

.close-btn:focus {
    color: white;
    background: linear-gradient(90deg, #00dbde 0%, #fc00ff 100%);
}
</style>