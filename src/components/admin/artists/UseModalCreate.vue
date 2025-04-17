<template>
	<a-modal :open="isModalCreateOpen" title="Thêm nghệ sĩ mới" width="800px" @cancel="closeModal">
		<a-form layout="vertical">
			<a-row :gutter="16">
				<a-col :span="24">
					<a-form-item label="Avatar">
						<input type="file" @change="handleFileUpload" accept="image/*" />
						<img v-if="previewImage" :src="previewImage" alt="Preview" class="avatar-preview" />
					</a-form-item>
					<a-form-item label="Họ tên nghệ sĩ">
						<a-input v-model:value="name" placeholder="Nhập tên nghệ sĩ" />
					</a-form-item>
					<a-form-item label="Thông tin mô tả">
						<a-textarea v-model:value="bio" placeholder="Nhập thống tin mô tả" />
					</a-form-item>
					<a-form-item label="Ngày sinh">
						<a-date-picker v-model:value="birthday" format="DD/MM/YYYY" style="width: 100%;" />
					</a-form-item>
				</a-col>
			</a-row>
		</a-form>
		<template #footer>
			<a-button key="cancel" @click="closeModal">Hủy</a-button>
			<a-button key="submit" type="primary" @click="submitForm">Lưu</a-button>
		</template>
	</a-modal>
</template>

<script>
import { ref, defineComponent } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";

export default defineComponent({
	name: "UseModalCreate",
	props: {
		isModalOpen: Boolean,
		previewImage: String
	},
	emits: ["close-modal", "submit-form", "handle-file-upload"],
	setup(props, { emit }) {
		const schema = yup.object({
			name: yup.string().required("Vui lòng nhập tên nghệ sĩ."),
			bio: yup.string().required("Vui lòng nhập thông tin mô tả."),
		});
		const previewImage = ref("");
		const { handleSubmit, errors } = useForm({ validationSchema: schema });
		const { value: name } = useField("name", "", { initialValue: "" });
		const { value: bio } = useField("bio", "", { initialValue: "" });
		const { value: birthday } = useField("birthday", "", { initialValue: null });

		const closeModal = () => emit("close-modal");
		const submitForm = handleSubmit((values) => {
			emit("submit-form", values)
			closeModal();
		});
		const handleFileUpload = (event) => {
			const file = event.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (e) => {
					previewImage.value = e.target.result;
					emit("handle-file-upload", { file, preview: e.target.result });
				};
				reader.readAsDataURL(file);
			}
		};
		return {
			name,
			bio,
			birthday,
			previewImage,
			closeModal,
			submitForm,
			handleFileUpload,
			errors,
		}
	},
});
</script>

<style></style>