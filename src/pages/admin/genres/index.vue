<template>
    <a-card title="DANH SÁCH THỂ LOẠI" class="w-100">
        <div class="row mb-3">
            <div class="col-12 d-flex mb-4">
                <div class="col-8">
                    <div class="form-group search__genre">
                        <input 
                            type="text" 
                            class="form-control search__genre-input" 
                            placeholder="Tìm kiếm thể loại..." 
                            v-model="searchQuery"
                            @keyup.enter="handleSearch"
                        >
                        <i class="fa-solid fa-magnifying-glass search__genre-icon" @click="handleSearch"></i>
                    </div>
                </div>
                <div class="col-4 d-flex justify-content-end">
                    <a-button type="primary" class="btn-sm" style="background-color: green;" @click="showCreateModal">
                        <i class="fa-solid fa-plus pe-1"></i><span class="d-none d-sm-inline">Thêm mới</span>
                    </a-button>
                </div>
            </div>
            <GenreTable 
                :columns="columns" 
                :genres="genres" 
                :loading="loading"
                @show-edit="showEditModal"
                @show-detail="showDetailModal" 
                @confirm-delete="confirmDelete"
            />
        </div>
        
        <!-- Modal tạo mới -->
        <GenreModalCreate 
            :isModalVisible="isCreateModalVisible" 
            @submit-form="handleCreateGenre" 
            @close-modal="isCreateModalVisible = false" 
        />
        
        <!-- Modal chỉnh sửa -->
        <GenreModalEdit 
            :isModalVisible="isEditModalVisible"
            :genreData="selectedGenre"
            @submit-form="handleUpdateGenre" 
            @close-modal="isEditModalVisible = false" 
        />
        
        <!-- Modal xem chi tiết -->
        <GenreModalDetail 
            :isModalVisible="isDetailModalVisible"
            :genreData="selectedGenre"
            @close-modal="isDetailModalVisible = false" 
        />
    </a-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { getGenres, createGenre, updateGenre, deleteGenre, getGenre } from '@/services/genreService';
import GenreModalCreate from '@/components/admin/genres/GenreModalCreate.vue';
import GenreModalEdit from '@/components/admin/genres/GenreModalEdit.vue';
import GenreModalDetail from '@/components/admin/genres/GenreModalDetail.vue';
import GenreTable from '@/components/admin/genres/GenreTable.vue';

const genres = ref([]);
const loading = ref(false);
const searchQuery = ref('');

// Modal states
const isCreateModalVisible = ref(false);
const isEditModalVisible = ref(false);
const isDetailModalVisible = ref(false);
const selectedGenre = ref(null);

const columns = ref([
    { title: 'STT', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Thể loại', dataIndex: 'name', key: 'name' },
    { title: 'Số bài hát', dataIndex: 'songCount', key: 'songCount', align: 'center', width: 120 },
    { title: 'Thao tác', key: 'action', align: 'center', className: 'ant-table-cell-action', width: 200 },
]);

const fetchGenres = async () => {
    loading.value = true;
    try {
        const response = await getGenres();
        genres.value = response.data;
    } catch (error) {
        console.error(error);
        message.error('Không thể lấy danh sách thể loại');
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => {
    if (!searchQuery.value.trim()) {
        fetchGenres();
        return;
    }
    
    const filteredGenres = genres.value.filter(genre => 
        genre.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
    genres.value = filteredGenres;
};

// Modal handlers
const showCreateModal = () => {
    isCreateModalVisible.value = true;
};

const showEditModal = async (record) => {
    try {
        const response = await getGenre(record.id);
        selectedGenre.value = response.data;
        isEditModalVisible.value = true;
    } catch (error) {
        message.error('Không thể lấy thông tin thể loại');
    }
};

const showDetailModal = async (record) => {
    try {
        const response = await getGenre(record.id);
        selectedGenre.value = response.data;
        isDetailModalVisible.value = true;
    } catch (error) {
        message.error('Không thể lấy thông tin thể loại');
    }
};

const handleCreateGenre = async (genreData) => {
    try {
        const response = await createGenre(genreData);
        message.success(response.data.message);
        fetchGenres();
        isCreateModalVisible.value = false;
    } catch (error) {
        message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo thể loại');
    }
};

const handleUpdateGenre = async (genreData) => {
    try {
        const response = await updateGenre(selectedGenre.value.id, genreData);
        message.success(response.data.message);
        fetchGenres();
        isEditModalVisible.value = false;
    } catch (error) {
        message.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thể loại');
    }
};

const confirmDelete = async (id) => {
    try {
        const response = await deleteGenre(id);
        message.success(response.data.message);
        fetchGenres();
    } catch (error) {
        message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa thể loại');
    }
};

onMounted(() => {
    fetchGenres();
});
</script>

<style scoped>
.search__genre {
    position: relative;
    width: 100%;
}

.search__genre-input {
    border-radius: 5px;
    border: 1px solid #d9d9d9;
    padding: 8px 10px;
    width: 100%;
}

.search__genre-icon {
    position: absolute;
    top: 30%;
    right: -5px;
    cursor: pointer;
}

@media(max-width: 576px) {
    .search__genre-icon {
        right: 8px;
    }
    .search__genre-input {
        padding: 8px 2px;
        width: 100%;
    }   
}
</style>