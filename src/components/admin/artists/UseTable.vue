<template>
    <a-table :columns="columns" :data-source="artists" :pagination="pagination" :bordered="true">
        <template #bodyCell="{ column, text, record }">
            <template v-if="column.key === 'key'">
                {{ artists.indexOf(record) + 1 }}
            </template>
            <template v-else-if="column.key === 'imageUrl'">
                <img :src="record.imageUrl" alt="" style="width: 50px; height: 50px; border-radius: 50%;">
            </template>
            <template v-else-if="column.key === 'action'">
                <a-button type="primary" class="btn-sm me-sm-1 mb-1">
                    <i class="fa-solid fa-pen-to-square"></i>
                </a-button>
                <a-button type="primary" danger class="btn-sm">
                    <i class="fa-solid fa-trash"></i>
                </a-button>
            </template>
        </template>
    </a-table>
</template>

<script>
export default {
    props: {
        artists: Array,
        columns: Array,      
    }
}
</script>