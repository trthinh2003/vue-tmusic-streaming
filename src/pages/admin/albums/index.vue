<template>
    <a-card title="DANH SÁCH ALBUM" class="w-100">
		<a-table 
			:columns="columns" 
			:data-source="albums" 
			:pagination=false
			:loading=false
			:bordered="true"
			:scroll="{ x: 'max-content', y: 500 }"
		>
			<template #bodyCell="{ column, record }">
                <template v-if="column.key === 'imageUrl'">
				<img :src="record.imageUrl" alt=""
                    style="width: 50px; height: 50px; border-radius: 5px; object-fit: cover;">
                </template>
                <template v-if="column.key === 'releaseDate'">
                    {{  new Date(record.releaseDate).getFullYear() === 1901
                        ? 'Không xác định'
                        : new Date(record.releaseDate).getFullYear()
                    }}
			    </template>
                <template v-if="column.key === 'artist'">
                    {{ record.artist?.name || 'Không xác định' }}
                </template>
				<template v-if="column.key === 'action'">
					<div class="d-flex flex-column flex-sm-row align-items-center justify-content-center">
						<a-button class="me-1 mb-sm-0 mb-1 " @click="showEdit(record)">
							<i class="fa-solid fa-pen"></i>
						</a-button>
						<a-button type="primary" class="me-1 mb-sm-0 mb-1" @click="showDetail(record)">
							<i class="fa-solid fa-eye"></i>
						</a-button>
						<a-popconfirm title="Bạn có chắc muốn xóa album này?" ok-text="Yes" cancel-text="No"
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
import { getAlbums } from '@/services/albumService';
import { ref } from 'vue';

const albums = ref([]);
const columns = ref([
    { title: 'STT', dataIndex: 'id', key: 'key', width: 60 },
    { title: 'Tiêu đề Album', dataIndex: 'title', key: 'title',},
    { title: 'Ảnh', dataIndex: 'imageUrl', key: 'imageUrl', align: 'center', width: 80},
    { title: 'Năm phát hành', dataIndex: 'releaseDate', key: 'releaseDate', align: 'center', width: 120},
	{ title: 'Số bài hát', dataIndex: 'songCount', key: 'songCount', align: 'center', width: 120},
    { title: 'Nghệ sĩ', key: 'artist', align: 'center', width: 150 },
    { title: 'Thao tác', key: 'action', fixed: 'right', align: 'center', width: 150},
]);

const displayAlbums = async () => {
    try {
        const response = await getAlbums();
        albums.value = response.data.data;
        console.log(albums.value);
    } catch (error) {
        console.log(error);
    }
}
displayAlbums();
</script>

<style scoped>
:deep(.ant-table-thead > tr > th) {
  background-color: #f5f5f5;
	text-align: center;
  font-weight: bold;
}
</style>