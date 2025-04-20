<template>
    <a-card title="DANH SÁCH NGHỆ SĨ" class="w-100">
        <div class="row mb-3">
            <div class="col-12 d-flex mb-4">
                <div class="col-8">
                    <div class="form-group search__artist">
                        <input type="text" class="form-control search__artist-input" placeholder="Tìm kiếm nghệ sĩ...">
                        <i class="fa-solid fa-magnifying-glass search__artist-icon"></i>
                    </div>
                </div>
                <div class="col-4 d-flex justify-content-end">
                    <a-button type="primary" class="btn-sm" style="background-color: green;">
                        <i class="fa-solid fa-plus pe-1"></i><span class="d-none d-sm-inline">Thêm mới</span>
                    </a-button>
                </div>
            </div>
            <a-table
                :columns="columns"
                :data-source="artists"
                :pagination="false"
                :bordered="true"
                style="overflow-x: scroll;"
            >
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'key'">
                        {{ artists.indexOf(record) + 1 }}
                    </template>
                    <template v-else-if="column.key === 'avatar'">
                        <img :src="record.avatar" alt="" style="width: 50px; height: 50px; border-radius: 50%;">
                    </template>
                    <template v-if="column.key === 'bio'">
                        {{ $truncateWords(record.bio) }}
                    </template>
                    <template v-if="column.key === 'dateOfBirth'">
                        {{ $formatDate(record.dateOfBirth) }}
                    </template>
                    <template v-else-if="column.key === 'action'">
                        <a-button type="primary" class="btn-sm me-sm-1 mb-1">
                            <i class="fa-solid fa-eye"></i>
                        </a-button>
                        <a-button type="primary" danger class="btn-sm">
                            <i class="fa-solid fa-trash"></i>
                        </a-button>
                    </template>
                </template>
            </a-table>
        </div>
    </a-card>
</template>

<script>
import { defineComponent, ref } from 'vue';
import axiosInstance from '@/configs/axios';
// import UseModal from '@/components/admin/artists/UseModal.vue';

export default defineComponent({
    setup() {
        const artists = ref([]);
        async function getArtists() {
            try {
                const response = await axiosInstance.get('/artists');
                if (response.status === 200) {
                    artists.value = response.data;
                    console.log(artists.value);
                }
                console.log(response);
            } catch (error) {
                console.log(error);
            }
        }
        getArtists();

        return {
            artists,
            columns: [
                { title: 'STT', dataIndex: 'key', key: 'key', fixed: 'left' },
                { title: 'Họ tên', dataIndex: 'name', key: 'name' },
                // { title: 'Số bài hát', dataIndex: 'age', key: 'age', },
                { title: 'Avatar', dataIndex: 'avatar', key: 'avatar' },
                { title: 'Mô tả', dataIndex: 'bio', key: 'bio' },
                { title: 'Ngày sinh', dataIndex: 'dateOfBirth', key: 'dateOfBirth' },
                { title: 'Thao tác', key: 'action', fixed: 'right', align: 'center' },
            ],
        };
    },
})
</script>

<style scoped>
.search__artist {
    position: relative;
    width: 100%;
}

.search__artist-input {
    border-radius: 5px;
    border: 1px solid #d9d9d9;
    padding: 8px 10px;
    width: 100%;
}

.search__artist-icon {
    position: absolute;
    top: 30%;
    right: -10px;
}

@media(max-width: 576px) {
    .search__artist-icon {
        right: -8px;
    }
    .search__artist-input {
        width: 100%;
    }   
}
</style>>