<template>
    <a-table 
        :columns="columns" 
        :data-source="genres" 
        :pagination="false"
        :loading="loading"
        :bordered="true"
        :scroll="{ x: 'max-content', y: 500 }"
        :row-class-name="getRowClassName"
        :custom-row="customRow"
        row-key="id"
    >
        <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'index'">
                {{ genres.indexOf(record) + 1 + (pagination.currentPage - 1) * pagination.perPage }}
            </template>
            
            <!-- Thêm hiển thị ngày tạo -->
            <template v-if="column.key === 'createdAt'">
                <span v-if="record.createdAt">
                    {{ formatDate(record.createdAt) }}
                </span>
                <span v-else>-</span>
            </template>
        </template>
    </a-table>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    columns: Array,
    genres: Array,
    loading: Boolean,
    pagination: Object,
    selectedGenreId: [String, Number]
});

const emit = defineEmits(['show-edit', 'show-detail', 'confirm-delete', 'row-click']);

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

const handleRowClick = (record) => {
    emit('row-click', record);
};

const getRowClassName = (record) => {
    return record.id === props.selectedGenreId ? 'selected-row' : '';
};

// Sử dụng customRow thay vì @row-click
const customRow = (record) => {
    return {
        onClick: () => {
            handleRowClick(record);
        },
        style: {
            cursor: 'pointer'
        }
    };
};
</script>

<style scoped src="@/assets/admin/css/table-custom.css"></style>