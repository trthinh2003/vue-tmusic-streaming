<template>
    <a-table 
        :columns="columns" 
        :data-source="albums" 
        :pagination="pagination" 
        :loading="loading"
        @change="handleTableChange"
        :bordered="true"
        :scroll="{ x: 'max-content', y: 500 }"
    >
        <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'index'">
                {{ albums.indexOf(record) + 1 + (pagination.current - 1) * pagination.pageSize}}
            </template>
            <template v-if="column.key === 'imageUrl'">
                <img :src="record.imageUrl" alt=""
                    style="width: 50px; height: 50px; border-radius: 5px; object-fit: cover;">
            </template>
            <template v-if="column.key === 'releaseDate'">
                {{ new Date(record.releaseDate).getFullYear() === 1901
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
                        <a-button shape="circle" class="me-1 mb-sm-0 mb-1" @click="showDetail(record)"
                            style="color: #000">
                            <i class="fa-solid fa-eye"></i>
                        </a-button>
                    </a-tooltip>
                    <a-tooltip title="Xóa album">
                        <a-popconfirm title="Bạn có chắc muốn xóa album này?" ok-text="Xác nhận" cancel-text="Hủy"
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
    <!-- <ArtistModalEdit 
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
    /> -->
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
    albums: Array,
    columns: Array,
    loading: Boolean,
	pagination: Object,
})
const emit = defineEmits([
    "update:pagination",
    "fetch-data",
    "showEdit",
    "showDetail",
    "confirm-delete",
    "cancel-delete"
]);

const handleTableChange = (pagination) => {
    emit("update:pagination", pagination);
    emit("fetch-data", pagination.current, pagination.pageSize);
};

</script>

<style scoped src="@/assets/admin/css/table-custom.css"></style>