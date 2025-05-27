<template>
    <a-card title="DANH SÁCH ALBUM" class="w-100">
		<div class="row mb-3">
			<div class="col-12 d-flex mb-4">
                <div class="col-8">
                    <div class="form-group search__album">
                        <input 
                            type="text" 
                            class="form-control search__album-input" 
                            placeholder="Tìm kiếm album..." 
                            v-model="searchQuery"
                            @keyup.enter="handleSearch"
                        >
                        <i class="fa-solid fa-magnifying-glass search__album-icon" @click="handleSearch"></i>
                    </div>
                </div>
                <div class="col-4 d-flex justify-content-end">
                    <a-button type="primary" class="btn-sm" style="background-color: green;" @click="showModal">
                        <i class="fa-solid fa-plus pe-1"></i><span class="d-none d-sm-inline">Thêm mới</span>
                    </a-button>
                </div>
            </div>
			<AlbumTable 
                :columns="columns"
                :albums="albums"
                :loading="loading"
                :pagination="pagination"
                @update:pagination="pagination = $event"
                @fetch-data="fetchAlbums"
            />
		</div>
	</a-card>
    <AlbumModalCreate 
        :isModalVisible="isModalVisible" 
        :newAlbum="newAlbum" 
        :previewImage="previewImage"
        @submit-form="submitForm" 
        @close-modal="isModalVisible = false" 
        @handle-file-upload="updateAvatar" 
    />
</template>

<script setup>
import { getAlbums, searchAlbums, createAlbum } from '@/services/albumService';
import AlbumTable from '@/components/admin/albums/AlbumTable.vue';
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import AlbumModalCreate from '@/components/admin/albums/AlbumModalCreate.vue';
import dayjs from 'dayjs';

const albums = ref([]);
const pagination = ref({
    current: 1,
    pageSize: 5,
    total: 0,
    showSizeChanger: true,
    showTotal: (total) => `Tổng cộng ${total} album`
});
const isModalVisible = ref(false);
const loading = ref(false);
const columns = ref([
    { title: 'STT', key: 'index', fixed: 'left', width: 60 },
    { title: 'Tiêu đề Album', dataIndex: 'title', key: 'title',},
    { title: 'Ảnh', dataIndex: 'imageUrl', key: 'imageUrl', align: 'center', width: 80},
    { title: 'Năm phát hành', dataIndex: 'releaseDate', key: 'releaseDate', align: 'center', width: 120},
	{ title: 'Số bài hát', dataIndex: 'songCount', key: 'songCount', align: 'center', width: 120},
    { title: 'Nghệ sĩ', key: 'artist', align: 'center', width: 150 },
    { title: 'Thao tác', key: 'action', fixed: 'right', align: 'center', className: 'ant-table-cell-action' },
]);
const isSearching = ref(false);
const searchQuery = ref("");
const newAlbum = ref({});
const previewImage = ref("");


const fetchAlbums = (page = 1, pageSize = 5) => {
    if (isSearching.value) return;
    loading.value = true;
    getAlbums(page, pageSize)
    .then((res) => {
        albums.value = res.data.data;
        pagination.value = {
            ...pagination.value,
            total: res.data.pagination.totalItems,
            current: res.data.pagination.currentPage,
            pageSize: res.data.pagination.perPage,
            showTotal: (total) => `Tổng cộng ${total} album`,
        };
    })
    .catch(() => message.error("Không thể lấy dữ liệu"))
    .finally(() => (loading.value = false));
};

const handleSearch = () => {
    if (!searchQuery.value.trim()) {
        isSearching.value = false;
		fetchAlbums();
        return;
    }         
    isSearching.value = true;
    loading.value = true;          
    searchAlbums(pagination.value.current, pagination.value.pageSize, searchQuery.value)
        .then((res) => {
			albums.value = res.data.data;
			pagination.value = {
			...pagination.value,
			total: res.data.pagination.totalItems,
			current: res.data.pagination.currentPage,
			pageSize: res.data.pagination.perPage,
			showTotal: (total) => `Tổng cộng ${total} album`,
			};
		})
		.then(() => (isSearching.value = true))
        .catch(() => message.error("Tìm kiếm thất bại"))
        .finally(() => (loading.value = false));
};

const showModal = () => isModalVisible.value = true;

const updateAvatar = ({ file, preview }) => {
    newAlbum.value.avatar = file;
    previewImage.value = preview;
    console.log(newAlbum.value);
};

const submitForm = async (album) => {
	try {
		const formData = new FormData();
		formData.append('Title', album.title);
		formData.append('ReleaseDate', dayjs(album.releaseDate).format('YYYY-MM-DD'));
		formData.append('ArtistId', album.artistIds);
		if (newAlbum.value.avatar) {
			formData.append('Image', newAlbum.value.avatar);
		}
		const response = await createAlbum(formData);
		message.success(response.data.message);
        fetchAlbums();
        newAlbum.value = {};
        previewImage.value = "";
		// fetchAlbums(pagination.value.current, pagination.value.pageSize);
		// isModalVisible.value = false;
		// console.log([...formData.entries()]);
		console.log(response);

	} catch (error) {
		// message.error("Thêm album không thành công");
	}
};

onMounted(() => {
	fetchAlbums();
})
</script>

<style scoped src="@/assets/admin/css/table-custom.css"></style>
<style scoped>
.search__album {
    position: relative;
    width: 100%;
}

.search__album-input {
    border-radius: 5px;
    border: 1px solid #d9d9d9;
    padding: 8px 10px;
    width: 100%;
}

.search__album-icon {
    position: absolute;
    top: 30%;
    right: -5px;
    cursor: pointer;
}

@media(max-width: 576px) {
    .search__album-icon {
        right: 8px;
    }
    .search__album-input {
        padding: 8px 2px;
        width: 100%;
    }   
}
</style>