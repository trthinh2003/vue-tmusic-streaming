<template>
	<a-card title="DANH SÁCH THỂ LOẠI" class="w-100">
		<a-table 
			:columns="columns" 
			:data-source="genres" 
			:pagination=false
			:loading=false
			:bordered="true"
			:scroll="{ x: 400, y: 500 }"
		>
			<template #bodyCell="{ column, record }">
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
	</a-card>
</template>

<script setup>
import { ref } from 'vue';
import { getGenres } from '@/services/genreService';

const genres = ref([]);
const columns = ref([
	{ title: 'STT', dataIndex: 'id', key: 'key', width: 80 },
	{ title: 'Thể loại', dataIndex: 'name', key: 'name' },
	{ title: 'Thao tác', key: 'action', align: 'center', className: 'ant-table-cell-action' },
]);
const displayGenres = async () => {
  try {
    const response = await getGenres();
    console.log(response.data);
		genres.value = response.data;
  } catch (error) {
    console.log(error);
  }
}
displayGenres();

</script>

<style scoped src="@/assets/admin/css/table-custom.css"></style>