<template>
    <a-modal :open="isModalVisible" title="Thêm thể loại mới" width="500px" class="genre-modal-create" @cancel="closeModal">
        <a-form layout="vertical">
            <a-form-item label="Tên thể loại">
                <a-input v-model:value="name" placeholder="Nhập tên thể loại" />
                <span class="error-text text-danger">{{ errors.name }}</span>
            </a-form-item>
            
            <!-- Thêm field upload ảnh -->
            <a-form-item label="Ảnh thể loại">
                <a-upload
                    :file-list="fileList"
                    :before-upload="beforeUpload"
                    @remove="handleRemove"
                    list-type="picture-card"
                    :max-count="1"
                    accept="image/*"
                >
                    <div v-if="fileList.length < 1">
                        <i class="fa-solid fa-plus"></i>
                        <div style="margin-top: 8px">Upload</div>
                    </div>
                </a-upload>
                <span class="error-text text-danger">{{ errors.image }}</span>
            </a-form-item>
        </a-form>
        <template #footer>
            <a-button key="cancel" @click="closeModal" class="modal-btn cancel-btn">Hủy</a-button>
            <a-button key="reset" @click="resetForm" class="modal-btn reset-btn">Đặt lại</a-button>
            <a-button key="submit" type="primary" @click="submitForm" class="modal-btn submit-btn">Lưu</a-button>
        </template>
    </a-modal>
</template>

<script setup>
import { ref } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { message } from 'ant-design-vue';

const props = defineProps({
    isModalVisible: Boolean
});

const emit = defineEmits(["close-modal", "submit-form"]);

const schema = yup.object({
    name: yup.string().required("Vui lòng nhập tên thể loại."),
});

const { handleSubmit, errors } = useForm({ validationSchema: schema });
const { value: name } = useField("name", "", { initialValue: "" });

// File upload states
const fileList = ref([]);
const imageFile = ref(null);

const closeModal = () => {
    resetForm();
    emit("close-modal");
};

const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
        message.error('Chỉ được tải lên file ảnh!');
        return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
        message.error('Ảnh phải nhỏ hơn 5MB!');
        return false;
    }
    
    imageFile.value = file;
    fileList.value = [{
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: URL.createObjectURL(file),
    }];
    
    return false; // Prevent automatic upload
};

const handleRemove = () => {
    fileList.value = [];
    imageFile.value = null;
};

const submitForm = handleSubmit((values) => {
    const formData = {
        name: values.name,
        image: imageFile.value
    };
    emit("submit-form", formData);
});

const resetForm = () => {
    name.value = "";
    fileList.value = [];
    imageFile.value = null;
};
</script>

<style scoped>
.genre-modal-create :deep(.ant-modal-content) {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
    color: white;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.genre-modal-create :deep(.ant-modal-header) {
    background: transparent !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.genre-modal-create :deep(.ant-modal-title) {
    color: white !important;
    font-size: 1.25rem;
    font-weight: 600;
}

.genre-modal-create :deep(.ant-modal-close-x) {
    color: white !important;
}

.genre-modal-create :deep(.ant-form-item-label > label) {
    color: rgba(255, 255, 255, 0.85) !important;
}

.genre-modal-create :deep(.ant-input) {
    background: rgba(255, 255, 255, 0.1) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    color: white !important;
}

.genre-modal-create :deep(.ant-input::placeholder) {
    color: rgba(255, 255, 255, 0.4) !important;
}

.genre-modal-create :deep(.ant-upload-list-picture-card .ant-upload-list-item) {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.genre-modal-create :deep(.ant-upload.ant-upload-select-picture-card) {
    background: rgba(255, 255, 255, 0.1);
    border: 1px dashed rgba(255, 255, 255, 0.3);
    color: white;
}

.genre-modal-create :deep(.ant-modal-footer) {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 16px 24px;
}

.modal-btn {
    border-radius: 6px;
    padding: 0 24px;
    height: 36px;
    font-weight: 500;
    transition: all 0.3s;
}

.cancel-btn,
.reset-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(11, 11, 11, 0.2);
    color: black;
}

.cancel-btn:hover,
.reset-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(51, 41, 41, 0.4);
    color: rgb(77, 68, 68);
}

.submit-btn {
    background: linear-gradient(90deg, #00dbde 0%, #fc00ff 100%);
    border: none;
}

.submit-btn:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 219, 222, 0.3);
}
</style>