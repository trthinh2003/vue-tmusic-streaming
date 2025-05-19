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
    { title: 'Thao tác', key: 'action', fixed: 'right', align: 'center', className: 'ant-table-cell-action' },
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

<style scoped src="@/assets/admin/css/table-custom.css"></style>