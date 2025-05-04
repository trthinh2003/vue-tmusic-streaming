<template>
	<a-modal 
		:open="isModalEditVisible" 
		title="Chỉnh sửa thông tin" 
		width="800px" 
		class="artist-modal" 
		@cancel="closeModal"
	>
		<a-form layout="vertical">
			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item label="Họ tên nghệ sĩ">
						<a-input v-model:value="name" placeholder="Nhập tên nghệ sĩ" />
					</a-form-item>
					<a-form-item label="Ngày sinh">
						<a-date-picker v-model:value="dateOfBirth" format="DD/MM/YYYY" style="width: 100%;" />
					</a-form-item>
					<a-form-item label="Thông tin mô tả">
						<a-textarea v-model:value="bio" placeholder="Nhập thông tin mô tả" :rows="4" />
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
								<img v-if="previewImageLocal" :src="previewImageLocal" alt="Avatar" class="avatar-preview" />
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

<script>
import { ref, defineComponent, watch } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { PlusOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs'

export default defineComponent({
	name: "ArtistsModalEdit",
	components: {
		PlusOutlined
	},
	props: {
		isModalEditVisible: Boolean,
		newArtist: Object,
		previewImage: String
	},
	emits: ["close-modal", "submit-form", "handle-file-upload"],
	setup(props, { emit }) {
		const fileList = ref([]);
		const schema = yup.object({
			name: yup.string().required("Vui lòng nhập tên nghệ sĩ."),
			bio: yup.string().required("Vui lòng nhập thông tin mô tả."),
		});
		const previewImageLocal = ref(props.previewImage || "");
		const { handleSubmit, errors } = useForm({ validationSchema: schema });
		const { value: id } = useField("id", "", { initialValue: "" });
		const { value: name } = useField("name", "", { initialValue: "" });
		const { value: bio } = useField("bio", "", { initialValue: "" });
		const { value: dateOfBirth } = useField("dateOfBirth", "", { initialValue: null });

		watch(() => props.newArtist, (newVal) => {
			if (newVal) {
				id.value = newVal.id || "";
				name.value = newVal.name || "";
				bio.value = newVal.bio || "";
				dateOfBirth.value = newVal.dateOfBirth ? dayjs(newVal.dateOfBirth) : null;
				previewImageLocal.value = newVal.avatar || "";
			}
		}, { immediate: true, deep: true });

		watch(() => props.previewImage, (val) => {
			if (val) previewImageLocal.value = val;
		});

		const closeModal = () => emit("close-modal");
		const submitForm = handleSubmit((values) => {
			emit("submit-form", values)
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
					previewImageLocal.value = e.target.result;
					emit("handle-file-upload", { file, preview: e.target.result });
				};
				reader.readAsDataURL(file);
			}
		};

		const resetForm = () => {
			name.value = "";
			bio.value = "";
			dateOfBirth.value = null;
			previewImageLocal.value = "";
			fileList.value = [];
		};

		return {
			id,
			name,
			bio,
			dateOfBirth,
			previewImageLocal,
			fileList,
			closeModal,
			submitForm,
			beforeUpload,
			handleFileUpload,
			resetForm,
			errors,
		}
	},
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
</style>

<style scoped>
.artist-modal :deep(.ant-modal-content) {
	background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
	color: white;
	border-radius: 16px;
	border: 1px solid rgba(255, 255, 255, 0.1);
}

.artist-modal :deep(.ant-modal-header) {
	background: transparent !important;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.artist-modal :deep(.ant-modal-title) {
	color: white !important;
	font-size: 1.25rem;
	font-weight: 600;
}

.artist-modal :deep(.ant-modal-close-x) {
	color: white !important;
}

.artist-modal :deep(.ant-form-item-label > label) {
	color: rgba(255, 255, 255, 0.85) !important;
}

.artist-modal :deep(.ant-input),
.artist-modal :deep(.ant-input-affix-wrapper),
.artist-modal :deep(.ant-picker),
.artist-modal :deep(.ant-input-textarea) {
	background: rgba(255, 255, 255, 0.1) !important;
	border: 1px solid rgba(255, 255, 255, 0.2) !important;
	color: white !important;
}

.artist-modal :deep(.ant-input::placeholder),
.artist-modal :deep(.ant-input-affix-wrapper input::placeholder),
.artist-modal :deep(.ant-input-textarea::placeholder) {
	color: rgba(255, 255, 255, 0.4) !important;
}

.artist-modal :deep(.ant-picker-suffix),
.artist-modal :deep(.ant-input-suffix) {
	color: rgba(255, 255, 255, 0.5) !important;
}

.artist-modal :deep(.ant-modal-footer) {
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