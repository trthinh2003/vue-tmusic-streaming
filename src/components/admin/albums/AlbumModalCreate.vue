<template>
	<a-modal 
        :open="isModalVisible" 
        title="Thêm album mới" 
        width="800px" 
        class="album-modal" 
        @cancel="closeModal"
    >
		<a-form layout="vertical">
            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="Tiêu đề album">
                        <a-input v-model:value="title" placeholder="Nhập tiêu đề album" />
                        <span class="error-text text-danger">{{ errors.title }}</span>
                    </a-form-item>
                    <a-form-item label="Năm phát hành">
                        <a-date-picker v-model:value="releaseDate" picker="year" placeholder="Chọn năm" style="width: 100%" />
                    </a-form-item>
                    <a-form-item label="Chọn nghệ sĩ">
                        <a-select
                            v-model:value="artistIds"
                            show-search
                            :filter-option="false"
                            placeholder="Chọn nghệ sĩ"
                            @search="onSearchArtist"
                            :loading="loadingArtists"
                            >
                            <a-select-option
                                v-for="artist in artists"
                                :key="artist.id"
                                :value="artist.id"
                            >
                                {{ artist.name }}
                            </a-select-option>
                        </a-select>
                        <span class="error-text text-danger">{{ errors.artistIds }}</span>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="Avatar">
                        <div class="upload-container text-center">
                            <a-upload 
                                v-model:file-list="fileList" 
                                list-type="picture-card" 
                                class="avatar-uploader"
                                :show-upload-list="false" 
                                :before-upload="beforeUpload" 
                                @change="handleFileUpload"
                            >
                                <img v-if="previewImage" :src="previewImage" alt="Avatar" class="avatar-preview" />
                                <div v-else class="upload-placeholder">
                                    <plus-outlined class="text-dark"/>
                                    <div class="ant-upload-text text-dark">Tải ảnh lên</div>
                                </div>
                            </a-upload>
                        </div>
			        </a-form-item>
                </a-col>
            </a-row>
        </a-form>
		<template #footer>
			<a-button key="cancel" @click="closeModal" class="modal-btn cancel-btn">Hủy</a-button>
			<a-button key="reset" @click="resetForm" class="modal-btn reset-btn">Đặt lại</a-button>
			<a-button key="submit" type="primary" @click="submitForm" class="modal-btn submit-btn">Lưu</a-button>
		</template>
	</a-modal>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { PlusOutlined } from '@ant-design/icons-vue';
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { getArtists, searchArtists } from '@/services/artistService';

const props = defineProps({
    isModalVisible: Boolean,
    newAlbum: Object,
    previewImage: String
})

const emit = defineEmits(["close-modal", "submit-form", "handle-file-upload"])

const artists = ref("");
const loadingArtists = ref(false);

const fileList = ref([]);
const schema = yup.object({
	title: yup.string().required("Vui lòng nhập tiêu đề album."),
    artistIds: yup.string().required("Vui lòng chọn nghệ sĩ.")
});

const previewImage = ref("");
const { handleSubmit, errors } = useForm({ validationSchema: schema });
const { value: title } = useField("title", "", { initialValue: "" });
const { value: releaseDate } = useField("releaseDate", "", { initialValue: null });
const { value: artistIds } = useField("artistIds", "", { initialValue: [] });

const closeModal = () => emit("close-modal");

const onSearchArtist = async (value) => {
  loadingArtists.value = true;
  console.log(value);
  try {
    const res = await searchArtists(1, 20, value);
    artists.value = res.data.data;
  } finally {
    loadingArtists.value = false;
  }
};

const submitForm = handleSubmit((values) => {
	emit("submit-form", values)
    // console.log(values);
	closeModal();
});

const beforeUpload = () => {
	return false;
};

const handleFileUpload = (info) => {
	const file = info.file;
	if (file) {
		const reader = new FileReader();
		reader.onload = (e) => {
			previewImage.value = e.target.result;
			emit("handle-file-upload", { file, preview: e.target.result });
		};
		reader.readAsDataURL(file);
	}
};

const resetForm = () => {
	title.value = "";
    releaseDate.value = null;
    previewImage.value = "";
    artistIds.value = "";
    fileList.value = [];
};


onMounted(async () => {

});
</script>

<style scoped>
.avatar-preview {
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 8px;
}

.upload-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: rgba(255, 255, 255, 0.65);
}

.upload-placeholder :deep(svg) {
	font-size: 20px;
	margin-bottom: 8px;
}

.upload-container {
	display: flex;
	justify-content: center;
	margin-top: 8px;
}

.avatar-uploader :deep(.ant-upload.ant-upload-select-picture-card) {
	width: 200px;
	height: 200px;
	background: rgba(255, 255, 255, 0.1);
	border: 1px dashed rgba(36, 35, 35, 0.3);
	border-radius: 8px;
}

.avatar-uploader :deep(.ant-upload.ant-upload-select-picture-card:hover) {
	border-color: #fc00ff;
}

@media (max-width: 576px) {
	.avatar-uploader :deep(.ant-upload.ant-upload-select-picture-card) {
		width: 150px;
		height: 150px;
	}
}
</style>

<style scoped>
.album-modal :deep(.ant-modal-content) {
	background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
	color: white;
	border-radius: 16px;
	border: 1px solid rgba(255, 255, 255, 0.1);
}

.album-modal :deep(.ant-modal-header) {
	background: transparent !important;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.album-modal :deep(.ant-modal-title) {
	color: white !important;
	font-size: 1.25rem;
	font-weight: 600;
}

.album-modal :deep(.ant-modal-close-x) {
	color: white !important;
}

.album-modal :deep(.ant-form-item-label > label) {
	color: rgba(255, 255, 255, 0.85) !important;
}

.album-modal :deep(.ant-input),
.album-modal :deep(.ant-input-affix-wrapper),
.album-modal :deep(.ant-picker),
.album-modal :deep(.ant-input-textarea) {
	background: rgba(255, 255, 255, 0.1) !important;
	border: 1px solid rgba(255, 255, 255, 0.2) !important;
	color: white !important;
}

.album-modal :deep(.ant-input::placeholder),
.album-modal :deep(.ant-input-affix-wrapper input::placeholder),
.album-modal :deep(.ant-input-textarea::placeholder) {
	color: rgba(255, 255, 255, 0.4) !important;
}

.album-modal :deep(.ant-picker-suffix),
.album-modal :deep(.ant-input-suffix) {
	color: rgba(255, 255, 255, 0.5) !important;
}

.album-modal :deep(.ant-modal-footer) {
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