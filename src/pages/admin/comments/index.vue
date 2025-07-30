<template>
    <a-card title="QUẢN LÝ BÌNH LUẬN" class="w-100">
        <div class="row mb-3">
            <div class="col-12 d-flex mb-4">
                <div class="col-8">
                    <div class="form-group search__comment">
                        <input 
                            type="text" 
                            class="form-control search__comment-input" 
                            placeholder="Tìm kiếm bình luận, bài hát hoặc tên user..." 
                            v-model="searchQuery"
                            @keyup.enter="handleSearch"
                        >
                        <i class="fa-solid fa-magnifying-glass search__comment-icon" @click="handleSearch"></i>
                    </div>
                </div>
                <div class="col-4 d-flex justify-content-end align-items-center">
                    <a-button v-if="searchQuery" @click="clearSearch" class="me-2">
                        <i class="fa-solid fa-times"></i> Xóa tìm kiếm
                    </a-button>
                </div>
            </div>
            <CommentTable 
                :columns="columns" 
                :comments="comments" 
                :loading="loading" 
                :pagination="pagination"
                @update:pagination="pagination = $event" 
                @fetch-data="fetchComments" 
                @delete-comment="handleDeleteComment"
            />
        </div>
    </a-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { getCommentsForAdmin, searchCommentsForAdmin, deleteComment } from "@/services/commentAdminService";
import CommentTable from '@/components/admin/comments/CommentTable.vue';

const comments = ref([]);
const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showTotal: (total) => `Tổng cộng ${total} bình luận`
});
const loading = ref(false);
const searchQuery = ref("");
const isSearching = ref(false);

const columns = [
    { title: 'STT', key: 'index', fixed: 'left', width: 60 },
    { title: 'Nội dung bình luận', key: 'content', width: 200 },
    { title: 'User ID', key: 'userId', width: 100, align: 'center' },
    { title: 'Bài hát', key: 'songTitle', width: 150 },
    { title: 'Ngày tạo', key: 'createdAt', width: 140 },
    { title: 'Lượt thích', key: 'likeCount', width: 100, align: 'center' },
    { title: 'Phản hồi', key: 'replyCount', width: 100, align: 'center' },
    { title: 'Thao tác', key: 'action', fixed: 'right', align: 'center', width: 100 },
];

// Methods
const fetchComments = (page = 1, pageSize = 10) => {
    if (isSearching.value) return;
    
    loading.value = true;
    getCommentsForAdmin(page, pageSize)
        .then((res) => {
            comments.value = res.data.data;
            pagination.value = {
                ...pagination.value,
                total: res.data.pagination.totalItems,
                current: res.data.pagination.currentPage,
                pageSize: res.data.pagination.perPage,
                showTotal: (total) => `Tổng cộng ${total} bình luận`,
            };
        })
        .catch(() => message.error("Không thể lấy dữ liệu bình luận"))
        .finally(() => (loading.value = false));
};

const handleSearch = () => {
    if (!searchQuery.value.trim()) {
        clearSearch();
        return;
    }
    
    isSearching.value = true;
    loading.value = true;
    
    searchCommentsForAdmin(searchQuery.value, pagination.value.current, pagination.value.pageSize)
        .then((res) => {
            comments.value = res.data.data;
            pagination.value = {
                ...pagination.value,
                total: res.data.pagination.totalItems,
                current: res.data.pagination.currentPage,
                pageSize: res.data.pagination.perPage,
                showTotal: (total) => `Tìm thấy ${total} bình luận`,
            };
        })
        .catch(() => message.error("Tìm kiếm thất bại"))
        .finally(() => (loading.value = false));
};

const clearSearch = () => {
    searchQuery.value = "";
    isSearching.value = false;
    pagination.value.current = 1;
    fetchComments();
};

const handleDeleteComment = async (commentId) => {
    try {
        loading.value = true;
        await deleteComment(commentId);
        message.success("Xóa bình luận thành công");
        
        // Refresh data sau khi xóa
        if (isSearching.value) {
            handleSearch();
        } else {
            fetchComments(pagination.value.current, pagination.value.pageSize);
        }
    } catch (error) {
        message.error("Không thể xóa bình luận");
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const handleTableChange = (paginationConfig) => {
    if (isSearching.value) {
        searchCommentsForAdmin(searchQuery.value, paginationConfig.current, paginationConfig.pageSize)
            .then((res) => {
                comments.value = res.data.data;
                pagination.value = {
                    ...pagination.value,
                    total: res.data.pagination.totalItems,
                    current: res.data.pagination.currentPage,
                    pageSize: res.data.pagination.perPage,
                };
            })
            .catch(() => message.error("Lỗi khi tải dữ liệu"));
    } else {
        fetchComments(paginationConfig.current, paginationConfig.pageSize);
    }
};

onMounted(() => {
    fetchComments();
});
</script>

<style scoped>
.search__comment {
    position: relative;
    width: 100%;
}

.search__comment-input {
    border-radius: 5px;
    border: 1px solid #d9d9d9;
    padding: 8px 10px;
    width: 100%;
}

.search__comment-icon {
    position: absolute;
    top: 30%;
    right: -5px;
    cursor: pointer;
}

@media(max-width: 576px) {
    .search__comment-icon {
        right: 8px;
    }
    .search__comment-input {
        padding: 8px 2px;
        width: 100%;
    }   
}
</style>