<template>
    <a-card title="DANH SÁCH TÀI KHOẢN" class="w-100">
        <div class="row mb-3">
            <div class="col-12 d-flex mb-4">
                <div class="col-8">
                    <div class="form-group search__user">
                        <input 
                            type="text" 
                            class="form-control search__user-input" 
                            placeholder="Tìm kiếm tài khoản theo tên, username hoặc email..."
                            v-model="searchQuery"
                            @keyup.enter="handleSearch"
                        >
                        <i class="fa-solid fa-magnifying-glass search__user-icon" @click="handleSearch"></i>
                    </div>
                </div>
                <div class="col-4 d-flex justify-content-end align-items-center">
                    <a-button v-if="searchQuery" @click="clearSearch" class="me-2">
                        <i class="fa-solid fa-times"></i> Xóa tìm kiếm
                    </a-button>
                </div>
            </div>
            <UserTable 
                :columns="columns" 
                :users="users" 
                :loading="loading" 
                :pagination="pagination"
                @update:pagination="pagination = $event" 
                @fetch-data="fetchUsers" 
                @delete-user="handleDeleteUser"
            />
        </div>
    </a-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import axiosInstance from '@/configs/axios';
import UserTable from '@/components/admin/users/UserTable.vue';

const users = ref([]);
const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showTotal: (total) => `Tổng cộng ${total} tài khoản`
});
const loading = ref(false);
const searchQuery = ref("");
const isSearching = ref(false);

const columns = [
    { title: 'STT', key: 'index', fixed: 'left', width: 60 },
    { title: 'Avatar', key: 'avatar', width: 80, align: 'center' },
    { title: 'Họ tên', dataIndex: 'name', key: 'name', width: 150 },
    { title: 'Username', dataIndex: 'userName', key: 'userName', width: 120 },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 200 },
    { title: 'Giới tính', key: 'gender', width: 100, align: 'center' },
    { title: 'Thao tác', key: 'action', fixed: 'right', align: 'center', width: 120 },
];

// Methods
const fetchUsers = async (page = 1, pageSize = 5) => {
    if (isSearching.value) return;
    
    loading.value = true;
    try {
        const response = await axiosInstance.get(`/users?page=${page}&pageSize=${pageSize}`);
        if (response.status === 200) {
            users.value = response.data.data;
            pagination.value = {
                ...pagination.value,
                total: response.data.pagination.totalItems,
                current: response.data.pagination.currentPage,
                pageSize: response.data.pagination.perPage,
                showTotal: (total) => `Tổng cộng ${total} tài khoản`,
            };
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        message.error("Không thể lấy dữ liệu người dùng");
    } finally {
        loading.value = false;
    }
};

const searchUsers = async (query, page = 1, pageSize = 10) => {
    loading.value = true;
    try {
        const response = await axiosInstance.get(`/users/search?query=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`);
        if (response.status === 200) {
            users.value = response.data.data;
            pagination.value = {
                ...pagination.value,
                total: response.data.pagination.totalItems,
                current: response.data.pagination.currentPage,
                pageSize: response.data.pagination.perPage,
                showTotal: (total) => `Tìm thấy ${total} tài khoản`,
            };
        }
    } catch (error) {
        console.error('Error searching users:', error);
        message.error("Tìm kiếm thất bại");
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => {
    if (!searchQuery.value.trim()) {
        clearSearch();
        return;
    }
    
    isSearching.value = true;
    pagination.value.current = 1;
    searchUsers(searchQuery.value.trim());
};

const clearSearch = () => {
    searchQuery.value = "";
    isSearching.value = false;
    pagination.value.current = 1;
    fetchUsers();
};

const handleDeleteUser = async (userId) => {
    try {
        loading.value = true;
        const response = await axiosInstance.delete(`/users/${userId}`);
        if (response.status === 200) {
            message.success("Xóa người dùng thành công");
            
            // Refresh data sau khi xóa
            if (isSearching.value) {
                searchUsers(searchQuery.value, pagination.value.current, pagination.value.pageSize);
            } else {
                fetchUsers(pagination.value.current, pagination.value.pageSize);
            }
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        if (error.response?.data?.message) {
            message.error(error.response.data.message);
        } else {
            message.error("Không thể xóa người dùng");
        }
    } finally {
        loading.value = false;
    }
};

const handleTableChange = (paginationConfig) => {
    if (isSearching.value) {
        searchUsers(searchQuery.value, paginationConfig.current, paginationConfig.pageSize);
    } else {
        fetchUsers(paginationConfig.current, paginationConfig.pageSize);
    }
};

onMounted(() => {
    fetchUsers();
});
</script>

<style scoped>
.search__user {
    position: relative;
    width: 100%;
}

.search__user-input {
    border-radius: 5px;
    border: 1px solid #d9d9d9;
    padding: 8px 10px;
    width: 100%;
}

.search__user-icon {
    position: absolute;
    top: 30%;
    right: -5px;
    cursor: pointer;
}

@media(max-width: 576px) {
    .search__user-icon {
        right: 8px;
    }
    .search__user-input {
        padding: 8px 2px;
        width: 100%;
    }   
}
</style>