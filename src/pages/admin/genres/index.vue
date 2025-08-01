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
            
            <!-- Layout 2 cột -->
            <div class="row">
                <!-- Cột trái - Bảng dữ liệu -->
                <div class="col-lg-8 col-md-7">
                    <GenreTable 
                        :columns="columnsWithoutImage" 
                        :genres="pagedData.data" 
                        :loading="loading"
                        :pagination="pagedData.pagination"
                        :selectedGenreId="selectedGenreForView?.id"
                        @show-edit="showEditModal"
                        @show-detail="showDetailModal" 
                        @confirm-delete="confirmDelete"
                        @row-click="handleRowClick"
                    />
                    
                    <!-- Pagination -->
                    <div class="d-flex justify-content-end mt-3" v-if="pagedData.pagination">
                        <a-pagination
                            v-model:current="currentPage"
                            v-model:page-size="pageSize"
                            :total="pagedData.pagination.totalItems"
                            :show-size-changer="true"
                            :show-quick-jumper="true"
                            :show-total="(total, range) => `${range[0]}-${range[1]} của ${total} mục`"
                            @change="handlePageChange"
                            @show-size-change="handlePageSizeChange"
                        />
                    </div>
                </div>
                
                <!-- Cột phải - Hiển thị ảnh chi tiết -->
                <div class="col-lg-4 col-md-5">
                    <div class="genre-detail-panel">
                        <div class="panel-header">
                            <h5>Chi tiết thể loại</h5>
                        </div>
                        <div class="panel-content">
                            <div v-if="selectedGenreForView" class="genre-detail">
                                <div class="genre-image-large">
                                    <img 
                                        v-if="selectedGenreForView.image" 
                                        :src="selectedGenreForView.image" 
                                        :alt="selectedGenreForView.name"
                                        class="detail-image"
                                    />
                                    <div v-else class="no-image-large">
                                        <i class="fa-solid fa-image"></i>
                                        <p>Không có ảnh</p>
                                    </div>
                                </div>
                                <div class="genre-info">
                                    <h6>{{ selectedGenreForView.name }}</h6>
                                    <div class="info-item">
                                        <strong>Số bài hát:</strong> {{ selectedGenreForView.songCount || 0 }}
                                    </div>
                                    <div class="info-item">
                                        <strong>Ngày tạo:</strong> 
                                        {{ selectedGenreForView.createdAt ? formatDate(selectedGenreForView.createdAt) : '-' }}
                                    </div>
                                    <div class="info-item" v-if="selectedGenreForView.description">
                                        <strong>Mô tả:</strong> 
                                        <p class="description">{{ selectedGenreForView.description }}</p>
                                    </div>
                                </div>
                                <div class="action-buttons-panel">
                                    <a-button type="primary" @click="showEditModal(selectedGenreForView)" class="mb-2">
                                        <i class="fa-solid fa-pen-to-square me-1"></i>Chỉnh sửa
                                    </a-button>
                                    <a-button @click="showDetailModal(selectedGenreForView)" class="mb-2">
                                        <i class="fa-solid fa-eye me-1"></i>Xem chi tiết
                                    </a-button>
                                    <a-popconfirm 
                                        title="Bạn có chắc muốn xóa thể loại này?" 
                                        ok-text="Xác nhận" 
                                        cancel-text="Hủy"
                                        @confirm="confirmDelete(selectedGenreForView.id)"
                                    >
                                        <a-button type="primary" danger class="mb-2">
                                            <i class="fa-solid fa-trash-can me-1"></i>Xóa
                                        </a-button>
                                    </a-popconfirm>
                                </div>
                            </div>
                            <div v-else class="no-selection">
                                <div class="no-selection-content">
                                    <i class="fa-solid fa-mouse-pointer"></i>
                                    <p>Nhấp vào một hàng để xem chi tiết</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
import { ref, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import { getGenresPaginate, createGenre, updateGenre, deleteGenre, getGenre } from '@/services/genreService';
import GenreModalCreate from '@/components/admin/genres/GenreModalCreate.vue';
import GenreModalEdit from '@/components/admin/genres/GenreModalEdit.vue';
import GenreModalDetail from '@/components/admin/genres/GenreModalDetail.vue';
import GenreTable from '@/components/admin/genres/GenreTable.vue';

const pagedData = ref({
    data: [],
    pagination: null
});
const loading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

// Modal states
const isCreateModalVisible = ref(false);
const isEditModalVisible = ref(false);
const isDetailModalVisible = ref(false);
const selectedGenre = ref(null);
const selectedGenreForView = ref(null); // Để hiển thị ở cột phải

const columns = ref([
    { title: 'STT', key: 'index', width: 60 },
    { title: 'Ảnh', key: 'image', width: 100, align: 'center' },
    { title: 'Thể loại', dataIndex: 'name', key: 'name' },
    { title: 'Số bài hát', dataIndex: 'songCount', key: 'songCount', align: 'center', width: 120 },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', width: 150 },
    { title: 'Thao tác', key: 'action', align: 'center', className: 'ant-table-cell-action', width: 200 },
]);

// Columns không có ảnh và thao tác cho bảng bên trái
const columnsWithoutImage = computed(() => [
    { title: 'STT', key: 'index', width: 60 },
    { title: 'Thể loại', dataIndex: 'name', key: 'name' },
    { title: 'Số bài hát', dataIndex: 'songCount', key: 'songCount', align: 'center', width: 120 },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', width: 150 },
]);

const fetchGenres = async () => {
    loading.value = true;
    try {
        const response = await getGenresPaginate(currentPage.value, pageSize.value);
        pagedData.value = response.data;
        
        // Tự động chọn item đầu tiên nếu có dữ liệu
        if (response.data.data && response.data.data.length > 0 && !selectedGenreForView.value) {
            selectedGenreForView.value = response.data.data[0];
        }
    } catch (error) {
        console.error(error);
        message.error('Không thể lấy danh sách thể loại');
    } finally {
        loading.value = false;
    }
};

const handlePageChange = (page, size) => {
    currentPage.value = page;
    pageSize.value = size;
    fetchGenres();
};

const handlePageSizeChange = (current, size) => {
    currentPage.value = 1;
    pageSize.value = size;
    fetchGenres();
};

const handleSearch = () => {
    if (!searchQuery.value.trim()) {
        fetchGenres();
        return;
    }
    
    const filteredGenres = pagedData.value.data.filter(genre => 
        genre.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
    pagedData.value = {
        ...pagedData.value,
        data: filteredGenres
    };
    
    // Reset selection khi search
    selectedGenreForView.value = filteredGenres.length > 0 ? filteredGenres[0] : null;
};

// Handle row click để chọn item hiển thị bên phải
const handleRowClick = (record) => {
    selectedGenreForView.value = record;
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
        
        // Cập nhật selectedGenreForView nếu đang được chọn
        if (selectedGenreForView.value?.id === selectedGenre.value.id) {
            selectedGenreForView.value = { ...selectedGenreForView.value, ...genreData };
        }
    } catch (error) {
        message.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thể loại');
    }
};

const confirmDelete = async (id) => {
    try {
        const response = await deleteGenre(id);
        message.success(response.data.message);
        
        // Reset selection nếu item đang được chọn bị xóa
        if (selectedGenreForView.value?.id === id) {
            selectedGenreForView.value = null;
        }
        
        fetchGenres();
    } catch (error) {
        message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa thể loại');
    }
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
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

/* Styles for detail panel */
.genre-detail-panel {
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 8px;
    overflow: hidden;
    height: fit-content;
    position: sticky;
    top: 20px;
}

.panel-header {
    background: #f0f0f0;
    padding: 12px 16px;
    border-bottom: 1px solid #d9d9d9;
}

.panel-header h5 {
    margin: 0;
    font-weight: 600;
    color: #333;
}

.panel-content {
    padding: 16px;
    min-height: 400px;
}

.genre-detail {
    text-align: center;
}

.genre-image-large {
    margin-bottom: 16px;
}

.detail-image {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: 12px;
    border: 1px solid #d9d9d9;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-image-large {
    width: 150px;
    height: 150px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    border: 1px solid #d9d9d9;
    border-radius: 12px;
    color: #999;
    margin: 0 auto;
}

.no-image-large i {
    font-size: 40px;
    margin-bottom: 8px;
}

.no-image-large p {
    font-size: 12px;
    margin: 0;
}

.genre-info {
    text-align: left;
    margin-bottom: 20px;
}

.genre-info h6 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #333;
    text-align: center;
}

.info-item {
    margin-bottom: 8px;
    color: #666;
}

.info-item strong {
    color: #333;
}

.description {
    margin-top: 4px;
    margin-bottom: 0;
    line-height: 1.5;
}

.action-buttons-panel {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.action-buttons-panel .ant-btn {
    width: 100%;
}

.no-selection {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
}

.no-selection-content {
    text-align: center;
    color: #999;
}

.no-selection-content i {
    font-size: 48px;
    margin-bottom: 16px;
}

.no-selection-content p {
    margin: 0;
    font-size: 14px;
}

@media(max-width: 576px) {
    .search__genre-icon {
        right: 8px;
    }
    .search__genre-input {
        padding: 8px 2px;
        width: 100%;
    }
    
    .genre-detail-panel {
        margin-top: 20px;
        position: static;
    }
}

@media(max-width: 768px) {
    .detail-image,
    .no-image-large {
        width: 120px;
        height: 120px;
    }
    
    .no-image-large i {
        font-size: 30px;
    }
}
</style>