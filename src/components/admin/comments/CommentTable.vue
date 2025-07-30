<template>
    <a-table
        :columns="columns"
        :data-source="comments"
        :loading="loading"
        :pagination="paginationConfig"
        :scroll="{ x: 1000 }"
        @change="handleTableChange"
        row-key="id"
    >
        <template #bodyCell="{ column, record, index }">
            <!-- STT -->
            <template v-if="column.key === 'index'">
                {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
            </template>

            <!-- Nội dung comment -->
            <template v-if="column.key === 'content'">
                <div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    {{ record.content }}
                </div>
            </template>

            <!-- User ID -->
            <template v-if="column.key === 'userId'">
                <a-tag color="blue">ID: {{ record.userId }}</a-tag>
            </template>

            <!-- Bài hát -->
            <template v-if="column.key === 'songTitle'">
                <div style="max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    {{ record.songTitle }}
                </div>
            </template>

            <!-- Ngày tạo -->
            <template v-if="column.key === 'createdAt'">
                {{ formatDate(record.createdAt) }}
            </template>

            <!-- Like count -->
            <template v-if="column.key === 'likeCount'">
                <a-tag color="green">{{ record.likeCount }}</a-tag>
            </template>

            <!-- Reply count -->
            <template v-if="column.key === 'replyCount'">
                <a-tag color="orange">{{ record.replyCount }}</a-tag>
            </template>

            <!-- Actions -->
            <template v-if="column.key === 'action'">
                <a-popconfirm
                    title="Bạn có chắc chắn muốn xóa bình luận này?"
                    ok-text="Xóa"
                    cancel-text="Hủy"
                    @confirm="handleDelete(record.id)"
                >
                    <a-button type="primary" danger size="small">
                        <i class="fa-solid fa-trash"></i>
                    </a-button>
                </a-popconfirm>
            </template>
        </template>
    </a-table>
</template>

<script setup>
import { computed } from 'vue';
import dayjs from 'dayjs';

// Props
const props = defineProps({
    columns: {
        type: Array,
        required: true
    },
    comments: {
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
const emit = defineEmits(['update:pagination', 'fetch-data', 'delete-comment']);

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

const handleDelete = (commentId) => {
    emit('delete-comment', commentId);
};

const formatDate = (date) => {
    return dayjs(date).format('DD/MM/YYYY HH:mm');
};
</script>

<style scoped src="@/assets/admin/css/table-custom.css"></style>