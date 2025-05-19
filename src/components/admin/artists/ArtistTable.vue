<template>
	<a-table 
		:columns="columns" 
		:data-source="artists" 
		:pagination="pagination" 
		:loading="loading"
		@change="handleTableChange" 
		:bordered="true" 
		:scroll="{ x: 'max-content', y: 500 }"
	>
		<template #headerCell="{ column }">
			{{ column.title }}
		</template>
		<template #bodyCell="{ column, record }">
			<template v-if="column.key === 'avatar'">
				<img :src="record.avatar" alt=""
					style="width: 50px; height: 50px; border-radius: 5px; object-fit: cover;">
			</template>
			<template v-if="column.key === 'bio'">
				{{ $truncateWords(record.bio) }}
			</template>
			<template v-if="column.key === 'dateOfBirth'">
				{{ $formatDate(record.dateOfBirth) == "01/01/1901" ? 'Không xác định' : $formatDate(record.dateOfBirth)
				}}
			</template>
			<template v-if="column.key === 'action'">
				<div class="action-buttons d-flex justify-content-center align-items-center gap-2 flex-wrap">
					<a-tooltip title="Chỉnh sửa">
						<a-button shape="circle" type="default" @click="showEdit(record)" class="action-btn edit-btn">
							<i class="fa-solid fa-pen-to-square"></i>
						</a-button>
					</a-tooltip>
					<a-tooltip title="Xem chi tiết">
						<a-button shape="circle" class="me-1 mb-sm-0 mb-1" @click="showDetail(record)" style="color: #000">
							<i class="fa-solid fa-eye"></i>
						</a-button>
					</a-tooltip>
					<a-tooltip title="Xóa nghệ sĩ">
						<a-popconfirm title="Bạn có chắc muốn xóa bài hát này?" ok-text="Xác nhận" cancel-text="Hủy"
							@confirm="confirmDelete(record.id)" @cancel="cancelDelete(record.id)">
							<a-button shape="circle" type="primary" danger class="action-btn delete-btn">
								<i class="fa-solid fa-trash-can"></i>
							</a-button>
						</a-popconfirm>
					</a-tooltip>
				</div>
			</template>
		</template>
	</a-table>
	<ArtistModalEdit 
		:isModalEditVisible="isModalEditVisible" 
		:newArtist="newArtist" 
		:previewImage="previewImage"
		@submit-form="submitForm" 
		@close-modal="isModalEditVisible = false" 
		@handle-file-upload="updateAvatar" 
	/>
	<ArtistModalDetail 
		:isModalDetailVisible="visible" 
		:artist="selectedArtist" 
		@close-modal="visible = false" 
	/>
</template>

<script>
import ArtistModalDetail from './ArtistModalDetail.vue';
import ArtistModalEdit from './ArtistModalEdit.vue';
import { updateArtist } from "@/services/artistService";
import dayjs from 'dayjs';
import { ref } from 'vue';
import { message } from 'ant-design-vue';

export default {
	components: {
		ArtistModalDetail,
		ArtistModalEdit
	},
	props: {
		artists: Array,
		columns: Array,
		loading: Boolean,
		pagination: Object,
		handleTableChange: Function
	},
	emits: ["update:pagination", "fetch-data"],
	setup(props, { emit }) {
		const handleTableChange = (pagination) => {
			emit("update:pagination", pagination);
			emit("fetch-data", pagination.current, pagination.pageSize);
		};

		const isModalEditVisible = ref(false);
		const newArtist = ref({});
		const previewImage = ref("");

		const updateAvatar = ({ file, preview }) => {
			newArtist.value.avatar = file;
			// console.log(newArtist.value.avatar);
			previewImage.value = preview;
		};

		const showEdit = (artist) => {
			isModalEditVisible.value = true;
			newArtist.value = artist;
			previewImage.value = artist.avatar;
			// console.log(artist, newArtist.value);
		};

		const submitForm = async (artist) => {
			try {
				const formData = new FormData();
				formData.append('Name', artist.name);
				formData.append('Bio', artist.bio);
				formData.append('DateOfBirth', dayjs(artist.dateOfBirth).format('YYYY-MM-DD'));
				if (newArtist.value.avatar instanceof File) {
					formData.append('Avatar', newArtist.value.avatar);
				}
				console.log(artist.id, [...formData.entries()]);

				const response = await updateArtist(artist.id, formData);
				message.success(response.data.message)
				handleTableChange(props.pagination);
				isModalEditVisible.value = false;
				newArtist.value = {};
				previewImage.value = "";
			} catch (error) {
				console.log(error.response?.data);
			}
		}

		const showDetail = (artist) => {
			console.log(artist);
			visible.value = true;
			selectedArtist.value = artist;
		};

		const confirmDelete = (id) => {
			console.log(id, props.artists);
		};

		const cancelDelete = (id) => { };

		const visible = ref(false);
		const selectedArtist = ref(null);

		return {
			handleTableChange,
			confirmDelete,
			cancelDelete,
			visible,
			selectedArtist,
			isModalEditVisible,
			newArtist,
			previewImage,
			showEdit,
			submitForm,
			updateAvatar,
			showDetail
		}
	}
}
</script>

<style scoped src="@/assets/admin/css/table-custom.css"></style>