<template>
    <a-modal :open="isModalVisible" title="Chỉnh sửa thể loại" width="500px" class="genre-modal" @cancel="closeModal">
        <a-form layout="vertical">
            <a-form-item label="Tên thể loại">
                <a-input v-model:value="name" placeholder="Nhập tên thể loại" />
                <span class="error-text text-danger">{{ errors.name }}</span>
            </a-form-item>
        </a-form>
        <template #footer>
            <a-button key="cancel" @click="closeModal" class="modal-btn cancel-btn">Hủy</a-button>
            <a-button key="submit" type="primary" @click="submitForm" class="modal-btn submit-btn">Cập nhật</a-button>
        </template>
    </a-modal>
</template>

<script setup>
import { watch } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";

const props = defineProps({
    isModalVisible: Boolean,
    genreData: Object
});

const emit = defineEmits(["close-modal", "submit-form"]);

const schema = yup.object({
    name: yup.string().required("Vui lòng nhập tên thể loại."),
});

const { handleSubmit, errors } = useForm({ validationSchema: schema });
const { value: name } = useField("name", "", { initialValue: "" });

// Watch for changes in genreData prop
watch(() => props.genreData, (newData) => {
    if (newData) {
        name.value = newData.name;
    }
}, { immediate: true });

const closeModal = () => emit("close-modal");

const submitForm = handleSubmit((values) => {
    emit("submit-form", values);
});
</script>

<style scoped>
.genre-modal :deep(.ant-modal-content) {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
    color: white;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.genre-modal :deep(.ant-modal-header) {
    background: transparent !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.genre-modal :deep(.ant-modal-title) {
    color: white !important;
    font-size: 1.25rem;
    font-weight: 600;
}

.genre-modal :deep(.ant-modal-close-x) {
    color: white !important;
}

.genre-modal :deep(.ant-form-item-label > label) {
    color: rgba(255, 255, 255, 0.85) !important;
}

.genre-modal :deep(.ant-input) {
    background: rgba(255, 255, 255, 0.1) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    color: white !important;
}

.genre-modal :deep(.ant-input::placeholder) {
    color: rgba(255, 255, 255, 0.4) !important;
}

.genre-modal :deep(.ant-modal-footer) {
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