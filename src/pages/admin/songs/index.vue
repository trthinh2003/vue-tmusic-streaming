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
		<a-table :columns="columns" :data-source="songs" :pagination=false :loading=false :bordered="true"
			:scroll="{ x: 'max-content', y: 500 }">
			<template #bodyCell="{ column, record }">
				<template v-if="column.key === 'cover'">
					<img :src="record.cover" alt="" style="width: 50px; height: 50px; border-radius: 5px; object-fit: cover;">
				</template>
				<template v-if="column.key === 'releaseDate'">
					{{ $formatDate(record.releaseDate) == "01/01/1901" ? 'Không xác định' : $formatDate(record.releaseDate) }}
				</template>
				<template v-if="column.key === 'action'">
					<div class="action-buttons d-flex justify-content-center align-items-center gap-2 flex-wrap">
						<a-tooltip title="Chỉnh sửa">
							<router-link :to="{ name: 'admin-songs-edit', params: { slug: record.slug } }">
								<a-button shape="circle" type="default" class="action-btn edit-btn">
									<i class="fa-solid fa-pen-to-square"></i>
								</a-button>
							</router-link>
						</a-tooltip>

						<a-tooltip title="Xóa bài hát">
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
	</a-card>
</template>

<script setup>
import { ref } from 'vue';
import { getSongs } from '@/services/songService';

const songs = ref([]);
const columns = ref([
	{ title: 'STT', dataIndex: 'id', key: 'key', width: 60, fixed: 'left' },
	{ title: 'Bài hát', dataIndex: 'title', key: 'title', width: 400 },
	{ title: 'Ảnh', dataIndex: 'cover', key: 'cover', align: 'center', width: 60 },
	{ title: 'Nghệ sĩ', dataIndex: 'artist', key: 'artist', align: 'center', width: 150 },
	{ title: 'Thể loại', dataIndex: 'genre', key: 'genre', width: 150 },
	{ title: 'Ngày phát hành', dataIndex: 'releaseDate', key: 'releaseDate', align: 'center', width: 120 },
	{ title: 'Độ dài', dataIndex: 'duration', key: 'duration', align: 'center', width: 80 },
	{ title: 'Thao tác', key: 'action', fixed: 'right', align: 'center', className: 'ant-table-cell-action' },
]);

const displaySongs = async () => {
	try {
		const response = await getSongs();
		songs.value = response.data.data;
		console.log(response.data.data);
	} catch (error) {
		console.log(error);
	}
}
displaySongs();

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