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

const props = defineProps({
    songs: Array,
    columns: Array,
    loading: Boolean,
		pagination: Object,
})

const emit = defineEmits([
    "update:pagination",
    "fetch-data",
]);

const handleTableChange = (pagination) => {
    emit("update:pagination", pagination);
    emit("fetch-data", pagination.current, pagination.pageSize);
};
</script>