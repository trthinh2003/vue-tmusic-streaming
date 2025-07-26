<template>
	<a-table 
		:columns="columns" 
		:data-source="songs" 
		:pagination="pagination" 
		:loading="loading" 
		@change="handleTableChange"
		:bordered="true"
		:scroll="{ x: 'max-content', y: 500 }"
	>
		<template #bodyCell="{ column, record }">
			<template v-if="column.key === 'index'">
        {{ songs.indexOf(record) + 1 + (pagination.current - 1) * pagination.pageSize}}
      </template>
			<template v-if="column.key === 'cover'">
				<img :src="record.cover" alt="" style="width: 50px; height: 50px; border-radius: 5px; object-fit: cover;">
			</template>
			<template v-if="column.key === 'releaseDate'">
				{{ new Date(record.releaseDate).getFullYear() === 1901
                    ? 'Không xác định'
                    : new Date(record.releaseDate).getFullYear()
                }}
			</template>
			<template v-if="column.key === 'isPopular'">
				<a-checkbox 
					:checked="record.isPopular" 
					@change="(e) => handlePopularChange(record.id, e.target.checked)"
					:loading="loadingPopular[record.id]"
				>
					<span v-if="record.isPopular" style="color: #52c41a; font-weight: bold;">Popular</span>
					<span v-else style="color: #8c8c8c;">Normal</span>
				</a-checkbox>
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
</template>

<script setup>
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { updateSongPopular } from '@/services/songService';

const props = defineProps({
    songs: Array,
    columns: Array,
    loading: Boolean,
    pagination: Object,
})

const emit = defineEmits([
    "update:pagination",
    "fetch-data",
    "song-updated"
]);

const loadingPopular = ref({});

const handleTableChange = (pagination) => {
    emit("update:pagination", pagination);
    emit("fetch-data", pagination.current, pagination.pageSize);
};

const handlePopularChange = async (songId, isPopular) => {
    try {
        loadingPopular.value[songId] = true;
        await updateSongPopular(songId, isPopular);
        message.success(isPopular ? 'Đã đánh dấu bài hát là Phổ biến!' : 'Đã bỏ đánh dấu Phổ biến!');
        emit("song-updated");
    } catch (error) {
        console.error('Error updating popular status:', error);
        message.error('Cập nhật trạng thái Phổ biến thất bại!');
        const songIndex = props.songs.findIndex(s => s.id === songId);
        if (songIndex !== -1) {
            props.songs[songIndex].isPopular = !isPopular;
        }
    } finally {
        loadingPopular.value[songId] = false;
    }
};

const confirmDelete = (id) => {
    console.log('Delete song:', id);
};

const cancelDelete = (id) => {
    console.log('Cancel delete:', id);
};
</script>