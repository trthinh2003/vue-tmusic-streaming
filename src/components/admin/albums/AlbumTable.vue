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
    
    <AlbumModalEdit
        :isModalEditVisible="isModalEditVisible"
        :new-album="selectedAlbum"
        :preview-image="previewImageEdit"
        @close-modal="closeEditModal"
        @submit-form="handleUpdateAlbum"
        @handle-file-upload="handleFileUploadEdit"
    />
</template>

<script setup>
import { ref } from "vue";
import { message } from 'ant-design-vue';
import AlbumModalEdit from "@/components/admin/albums/AlbumModalEdit.vue";
import { updateAlbum } from "@/services/albumService";

const props = defineProps({
    albums: Array,
    columns: Array,
    loading: Boolean,
    pagination: Object,
})

const emit = defineEmits([
    "update:pagination",
    "fetch-data",
    "show-detail",
    "confirm-delete",
    "cancel-delete"
]);

// Edit Modal States
const isModalEditVisible = ref(false);
const selectedAlbum = ref(null);
const previewImageEdit = ref("");
const editImageFile = ref(null);

const handleTableChange = (pagination) => {
    emit("update:pagination", pagination);
    emit("fetch-data", pagination.current, pagination.pageSize);
};

const showEdit = (record) => {
    selectedAlbum.value = { ...record };
    previewImageEdit.value = record.imageUrl || "";
    editImageFile.value = null;
    isModalEditVisible.value = true;
};

const closeEditModal = () => {
    isModalEditVisible.value = false;
    selectedAlbum.value = null;
    previewImageEdit.value = "";
    editImageFile.value = null;
};

const handleFileUploadEdit = ({ file, preview }) => {
    editImageFile.value = file;
    previewImageEdit.value = preview;
};

const handleUpdateAlbum = async (formData) => {
    try {
        const updateData = new FormData();
        updateData.append('Title', formData.title);
        updateData.append('ArtistId', formData.artistIds);
        
        if (formData.releaseDate) {
            updateData.append('ReleaseDate', formData.releaseDate.toISOString());
        }
        
        if (editImageFile.value) {
            updateData.append('Image', editImageFile.value);
        }

        const response = await updateAlbum(selectedAlbum.value.id, updateData);
        
        if (response.status === 200) {
            message.success(response.data.message || 'Cập nhật album thành công!');
            closeEditModal();
            // Refresh data
            emit("fetch-data", props.pagination.current, props.pagination.pageSize);
        }
    } catch (error) {
        console.error('Error updating album:', error);
        const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật album!';
        message.error(errorMessage);
    }
};

const showDetail = (record) => {
    emit("show-detail", record);
};

const confirmDelete = (id) => {
    emit("confirm-delete", id);
};

const cancelDelete = (id) => {
    emit("cancel-delete", id);
};
</script>

<style scoped src="@/assets/admin/css/table-custom.css"></style>