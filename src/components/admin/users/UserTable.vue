<template>
    <a-table
        :columns="columns"
        :data-source="users"
        :loading="loading"
        :pagination="paginationConfig"
        :scroll="{ x: 'max-content' }"
        @change="handleTableChange"
        row-key="id"
    >
        <template #bodyCell="{ column, record, index }">
            <!-- STT -->
            <template v-if="column.key === 'index'">
                {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
            </template>

            <!-- Avatar -->
            <template v-if="column.key === 'avatar'">
                <a-avatar 
                    :size="50" 
                    :src="record.avatar" 
                    :style="{ backgroundColor: '#1890ff' }"
                >
                    {{ record.name ? record.name.charAt(0).toUpperCase() : record.userName.charAt(0).toUpperCase() }}
                </a-avatar>
            </template>

            <!-- Họ tên -->
            <template v-if="column.key === 'name'">
                <div style="max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    {{ record.name || 'Chưa cập nhật' }}
                </div>
            </template>

            <!-- Username -->
            <template v-if="column.key === 'userName'">
                <a-tag color="blue">{{ record.userName }}</a-tag>
            </template>

            <!-- Email -->
            <template v-if="column.key === 'email'">
                <div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    {{ record.email }}
                </div>
            </template>

            <!-- Giới tính -->
            <template v-if="column.key === 'gender'">
                <a-tag :color="record.gender === true ? 'blue' : 'pink'">
                    {{ record.gender === true ? 'Nam' : (record.gender === false ? 'Nữ' : 'Chưa xác định') }}
                </a-tag>
            </template>

            <!-- Actions -->
            <template v-if="column.key === 'action'">
                <a-space>
                    <a-button type="primary" size="small" @click="viewUser(record)">
                        <i class="fa-solid fa-eye"></i>
                    </a-button>
                    <a-popconfirm
                        title="Bạn có chắc chắn muốn xóa người dùng này?"
                        ok-text="Xóa"
                        cancel-text="Hủy"
                        @confirm="handleDelete(record.id)"
                    >
                        <a-button type="primary" danger size="small">
                            <i class="fa-solid fa-trash"></i>
                        </a-button>
                    </a-popconfirm>
                </a-space>
            </template>
        </template>
    </a-table>

    <!-- User Detail Modal -->
    <a-modal
        v-model:open="showUserModal"
        title="Chi tiết người dùng"
        :footer="null"
        width="600px"
    >
        <div v-if="selectedUser" class="user-detail">
            <div class="text-center mb-3">
                <a-avatar 
                    :size="80" 
                    :src="selectedUser.avatar"
                    :style="{ backgroundColor: '#1890ff' }"
                >
                    {{ selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : selectedUser.userName.charAt(0).toUpperCase() }}
                </a-avatar>
            </div>
            <a-descriptions :column="1" bordered>
                <a-descriptions-item label="ID">{{ selectedUser.id }}</a-descriptions-item>
                <a-descriptions-item label="Họ tên">{{ selectedUser.name || 'Chưa cập nhật' }}</a-descriptions-item>
                <a-descriptions-item label="Username">{{ selectedUser.userName }}</a-descriptions-item>
                <a-descriptions-item label="Email">{{ selectedUser.email }}</a-descriptions-item>
                <a-descriptions-item label="Giới tính">
                    {{ selectedUser.gender === true ? 'Nam' : (selectedUser.gender === false ? 'Nữ' : 'Chưa xác định') }}
                </a-descriptions-item>
                <a-descriptions-item label="Ngày tạo">{{ formatDate(selectedUser.createAt) }}</a-descriptions-item>
            </a-descriptions>
        </div>
    </a-modal>
</template>

<script setup>
import { computed, ref } from 'vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';

// Props
const props = defineProps({
    columns: {
        type: Array,
        required: true
    },
    users: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    },
    pagination: {
        type: Object,
        required: true
    }
});

// Emits
const emit = defineEmits(['update:pagination', 'fetch-data', 'delete-user']);

// Reactive data
const showUserModal = ref(false);
const selectedUser = ref(null);

// Computed
const paginationConfig = computed(() => ({
    current: props.pagination.current,
    pageSize: props.pagination.pageSize,
    total: props.pagination.total,
    showSizeChanger: props.pagination.showSizeChanger,
    showTotal: props.pagination.showTotal,
    pageSizeOptions: ['5', '10', '20', '50']
}));

// Methods
const handleTableChange = (pagination) => {
    emit('update:pagination', pagination);
    emit('fetch-data', pagination.current, pagination.pageSize);
};

const handleDelete = (userId) => {
    emit('delete-user', userId);
};

const viewUser = (user) => {
    selectedUser.value = user;
    showUserModal.value = true;
};

const formatDate = (date) => {
    if (!date) return 'Không có thông tin';
    return dayjs(date).format('DD/MM/YYYY HH:mm');
};
</script>

<style scoped src="@/assets/admin/css/table-custom.css"></style>
<style scoped>
.user-detail .ant-descriptions-item-label {
    font-weight: 600;
    width: 120px;
}

.user-detail .ant-avatar {
    border: 2px solid #f0f0f0;
}
</style>