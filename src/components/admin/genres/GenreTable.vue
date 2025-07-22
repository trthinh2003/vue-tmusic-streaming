<template>
    <a-table 
        :columns="columns" 
        :data-source="genres" 
        :pagination="false"
        :loading="loading"
        :bordered="true"
        :scroll="{ x: 400, y: 500 }"
    >
        <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
                <div class="action-buttons d-flex justify-content-center align-items-center gap-2 flex-wrap">
                    <a-tooltip title="Chỉnh sửa">
                        <a-button shape="circle" type="default" @click="$emit('show-edit', record)" class="action-btn edit-btn">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </a-button>
                    </a-tooltip>
                    <a-tooltip title="Xem chi tiết">
                        <a-button shape="circle" class="me-1 mb-sm-0 mb-1" @click="$emit('show-detail', record)" style="color: #000">
                            <i class="fa-solid fa-eye"></i>
                        </a-button>
                    </a-tooltip>
                    <a-tooltip title="Xóa thể loại">
                        <a-popconfirm title="Bạn có chắc muốn xóa thể loại này?" ok-text="Xác nhận" cancel-text="Hủy"
                            @confirm="$emit('confirm-delete', record.id)">
                            <a-button shape="circle" type="primary" danger class="action-btn delete-btn">
                                <i class="fa-solid fa-trash-can"></i>
                            </a-button>
                        </a-popconfirm>
                    </a-tooltip>
                </div>
            </template>
        </template>
    </a-table>
</template>

<script setup>
defineProps({
    columns: Array,
    genres: Array,
    loading: Boolean
});

defineEmits(['show-edit', 'show-detail', 'confirm-delete']);
</script>