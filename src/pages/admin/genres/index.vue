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
					<div class="d-flex flex-column flex-sm-row align-items-center justify-content-center">
						<a-button class="me-1 mb-sm-0 mb-1 " @click="showEdit(record)">
							<i class="fa-solid fa-pen"></i>
						</a-button>
						<a-button type="primary" class="me-1 mb-sm-0 mb-1" @click="showDetail(record)">
							<i class="fa-solid fa-eye"></i>
						</a-button>
						<a-popconfirm title="Bạn có chắc muốn xóa thể loại này?" ok-text="Yes" cancel-text="No"
							@confirm="confirmDelete(record.id)" @cancel="cancelDelete(record.id)">
							<a-button type="primary" danger>
								<i class="fa-solid fa-trash-can"></i>
							</a-button>
						</a-popconfirm>
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
	{ title: 'Thao tác', key: 'action', align: 'center', width: 200 },
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

<style scoped>
:deep(.ant-table-thead > tr > th) {
  background-color: #f5f5f5;
	text-align: center;
  font-weight: bold;
}
</style>