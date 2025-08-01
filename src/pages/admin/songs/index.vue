<template>
	<a-card title="DANH SÁCH BÀI HÁT" class="w-100">
		<div class="col-12 d-flex mb-4">
            <div class="col-8">
                <div class="form-group search__song">
                    <input 
                        type="text" 
                        class="form-control search__song-input" 
                        placeholder="Tìm kiếm bài hát..." 
                        v-model="searchQuery"
                        @keyup.enter="handleSearch"
                    >
                    <i class="fa-solid fa-magnifying-glass search__song-icon" @click="handleSearch"></i>
                </div>
            </div>
            <div class="col-4 d-flex justify-content-end">
				<router-link :to="{ name: 'admin-songs-create' }">
					<a-button type="primary" class="btn-sm" style="background-color: green;">
						<i class="fa-solid fa-plus pe-1"></i><span class="d-none d-sm-inline">Thêm mới</span>
					</a-button>
				</router-link>
            </div>
        </div>
		<SongTable
			:songs="songs"
			:columns="columns"
			:loading="loading"
			:pagination="pagination"
            @update:pagination="pagination = $event"
			@fetch-data="fetchSongs"
			@song-updated="handleSongUpdated"
		/>
	</a-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getSongs, searchSongs } from '@/services/songService';
import SongTable from '@/components/admin/songs/SongTable.vue';
import { message } from 'ant-design-vue';

const isSearching = ref(false);
const searchQuery = ref("");
const songs = ref([]);
const pagination = ref({
    current: 1,
    pageSize: 5,
    total: 0,
    showSizeChanger: true,
    showTotal: (total) => `Tổng cộng ${total} bài hát`
});
const loading = ref(false);
const columns = ref([
	{ title: 'STT', key: 'index', width: 60, fixed: 'left' },
	{ title: 'Bài hát', dataIndex: 'title', key: 'title', width: 300 },
	{ title: 'Ảnh', dataIndex: 'cover', key: 'cover', align: 'center', width: 60 },
	{ title: 'Nghệ sĩ', dataIndex: 'artist', key: 'artist', align: 'center', width: 150 },
	{ title: 'Thể loại', dataIndex: 'genre', key: 'genre', width: 150 },
	{ title: 'Năm phát hành', dataIndex: 'releaseDate', key: 'releaseDate', align: 'center', width: 120 },
	{ title: 'Độ dài', dataIndex: 'duration', key: 'duration', align: 'center', width: 80 },
	{ title: 'Phổ biến', key: 'isPopular', align: 'center', width: 100 },
	{ title: 'Thao tác', key: 'action', fixed: 'right', align: 'center', className: 'ant-table-cell-action' },
]);

const fetchSongs = (page = 1, pageSize = 5) => {
    if (isSearching.value) return;
    loading.value = true;
    getSongs(page, pageSize)
    .then((res) => {
		songs.value = res.data.data;
        pagination.value = {
            ...pagination.value,
            total: res.data.pagination.totalItems,
            current: res.data.pagination.currentPage,
            pageSize: res.data.pagination.perPage,
            showTotal: (total) => `Tổng cộng ${total} bài hát`,
        };
    })
    .catch(() => message.error("Không thể lấy dữ liệu"))
    .finally(() => (loading.value = false));
};

const handleSearch = () => {
    if (!searchQuery.value.trim()) {
        isSearching.value = false;
		fetchSongs();
        return;
    }         
    isSearching.value = true;
    loading.value = true;          
    searchSongs(pagination.value.current, pagination.value.pageSize, searchQuery.value)
    .then((res) => {
		songs.value = res.data.data;
		pagination.value = {
		...pagination.value,
		total: res.data.pagination.totalItems,
		current: res.data.pagination.currentPage,
		pageSize: res.data.pagination.perPage,
		showTotal: (total) => `Tổng cộng ${total} bài hát`,
		};
	})
	.then(() => (isSearching.value = true))
    .catch((error) => {
		message.error("Tìm kiếm thất bại");
		console.log(error)
	})
    .finally(() => (loading.value = false));
};

const handleSongUpdated = () => {
    // Refresh current page data after song popular status update
    if (isSearching.value) {
        handleSearch();
    } else {
        fetchSongs(pagination.value.current, pagination.value.pageSize);
    }
};

onMounted(() => {
	fetchSongs();
})
</script>

<style scoped src="@/assets/admin/css/table-custom.css"></style>
<style scoped>
.search__song {
    position: relative;
    width: 100%;
}

.search__song-input {
    border-radius: 5px;
    border: 1px solid #d9d9d9;
    padding: 8px 10px;
    width: 100%;
}

.search__song-icon {
    position: absolute;
    top: 30%;
    right: -5px;
    cursor: pointer;
}

@media(max-width: 576px) {
    .search__song-icon {
        right: 8px;
    }
    .search__song-input {
        padding: 8px 2px;
        width: 100%;
    }   
}
</style>