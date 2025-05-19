<template>
    <a-card title="DANH SÁCH NGHỆ SĨ" class="w-100">
        <div class="row mb-3">
            <div class="col-12 d-flex mb-4">
                <div class="col-8">
                    <div class="form-group search__artist">
                        <input 
                            type="text" 
                            class="form-control search__artist-input" 
                            placeholder="Tìm kiếm nghệ sĩ..." 
                            v-model="searchQuery"
                            @keyup.enter="handleSearch"
                        >
                        <i class="fa-solid fa-magnifying-glass search__artist-icon" @click="handleSearch"></i>
                    </div>
                </div>
                <div class="col-4 d-flex justify-content-end">
                    <a-button type="primary" class="btn-sm" style="background-color: green;" @click="showModal">
                        <i class="fa-solid fa-plus pe-1"></i><span class="d-none d-sm-inline">Thêm mới</span>
                    </a-button>
                </div>
            </div>
            <ArtistTable 
                :columns="columns" 
                :artists="artists" 
                :loading="loading" 
                :pagination="pagination"
                @update:pagination="pagination = $event" 
                @fetch-data="fetchArtists" 
            />
        </div>
        <ArtistModalCreate 
            :isModalVisible="isModalVisible" 
            :newArtist="newArtist" 
            :previewImage="previewImage"
            @submit-form="submitForm" 
            @close-modal="isModalVisible = false" 
            @handle-file-upload="updateAvatar" 
        />
    </a-card>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { getArtists, createArtist, searchArtists } from "@/services/artistService";
import dayjs from 'dayjs';
import ArtistModalCreate from '@/components/admin/artists/ArtistModalCreate.vue';
import ArtistTable from '@/components/admin/artists/ArtistTable.vue';

export default defineComponent({
    components: {
        ArtistModalCreate,
        ArtistTable
    },
    setup() {
        const artists = ref([]);
        const pagination = ref({
            current: 1,
            pageSize: 5,
            total: 0,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} nghệ sĩ`
        });
        const loading = ref(false);
        const isModalVisible = ref(false);
        const newArtist = ref({});
        const previewImage = ref("");
        const searchQuery = ref("");
        const isSearching = ref(false);

        const showModal = () => (isModalVisible.value = true);
        const closeModal = () => (isModalVisible.value = false);

        const updateAvatar = ({ file, preview }) => {
            newArtist.value.avatar = file;
            previewImage.value = preview;
            console.log(newArtist.value);
        };
    
        const fetchArtists = (page = 1, pageSize = 5) => {
            if (isSearching.value) return;
            
            loading.value = true;
            getArtists(page, pageSize)
                .then((res) => {
                    artists.value = res.data.data;
                    pagination.value = {
                        ...pagination.value,
                        total: res.data.pagination.totalItems,
                        current: res.data.pagination.currentPage,
                        pageSize: res.data.pagination.perPage,
                        showTotal: (total) => `Tổng cộng ${total} nghệ sĩ`,
                    };
                })
                .catch(() => message.error("Không thể lấy dữ liệu"))
                .finally(() => (loading.value = false));
        };

        const handleSearch = () => {
            if (!searchQuery.value.trim()) {
                isSearching.value = false;
                fetchArtists();
                return;
            }
            
            isSearching.value = true;
            loading.value = true;
            
            searchArtists(pagination.value.current, pagination.value.pageSize, searchQuery.value)
                .then((res) => {
                    artists.value = res.data.data;
                    pagination.value = {
                        ...pagination.value,
                        total: res.data.pagination.totalItems,
                        current: res.data.pagination.currentPage,
                        pageSize: res.data.pagination.perPage,
                        showTotal: (total) => `Tổng cộng ${total} nghệ sĩ`,
                    };
                })
                .catch(() => message.error("Tìm kiếm thất bại"))
                .finally(() => (loading.value = false));
        };

        const handleTableChange = (pagination) => {
            if (isSearching.value) {
                handleSearch();
            } else {
                fetchArtists(pagination.current, pagination.pageSize);
            }
        };

        const submitForm = async (artist) => {
            try {
                const formData = new FormData();
                formData.append('Name', artist.name);
                formData.append('Bio', artist.bio);
                formData.append('DateOfBirth', dayjs(artist.dateOfBirth).format('YYYY-MM-DD'));
                if (newArtist.value.avatar) {
                    formData.append('Avatar', newArtist.value.avatar);
                }
                
                const response = await createArtist(formData);
				message.success(response.data.message)
                fetchArtists();
                isModalVisible.value = false;
                newArtist.value = {};
                previewImage.value = "";
            } catch (error) {
                console.log(error);
            }
        }

        onMounted(() => {
            fetchArtists();
        });

        return {
            artists,
            columns: [
                { title: 'STT', dataIndex: 'id', key: 'id', fixed: 'left', width: 60 },
                { title: 'Họ tên', dataIndex: 'name', key: 'name' },
                { title: 'Avatar', dataIndex: 'avatar', key: 'avatar', align: 'center' },
                { title: 'Mô tả', dataIndex: 'bio', key: 'bio' },
                { title: 'Ngày sinh', dataIndex: 'dateOfBirth', key: 'dateOfBirth' },
                { title: 'Thao tác', key: 'action', fixed: 'right', align: 'center', className: 'ant-table-cell-action' },
            ],
            isModalVisible,
            showModal,
            closeModal,
            newArtist,
            previewImage,
            updateAvatar,
            submitForm,
            fetchArtists,
            handleTableChange,
            handleSearch,
            searchQuery,
            loading,
            pagination
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
    right: -5px;
    cursor: pointer;
}

@media(max-width: 576px) {
    .search__artist-icon {
        right: 8px;
    }
    .search__artist-input {
        padding: 8px 2px;
        width: 100%;
    }   
}
</style>