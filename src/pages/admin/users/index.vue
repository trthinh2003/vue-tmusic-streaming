<template>
    <a-card title="DANH SÁCH TÀI KHOẢN" class="w-100">
        <div class="row mb-3">
            <div class="col-12 d-flex mb-4">
                <div class="col-8">
                    <div class="form-group search__user">
                        <input type="text" class="form-control search__user-input" placeholder="Tìm kiếm tài khoản...">
                        <i class="fa-solid fa-magnifying-glass search__user-icon"></i>
                    </div>
                </div>
            </div>
            <a-table :columns="columns" :data-source="users" :pagination="false" :bordered="true"
                style="overflow-x: scroll;">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'key'">
                        {{ users.indexOf(record) + 1 }}
                    </template>
                    <template v-else-if="column.key === 'avatar'">
                        <img :src="record.avatar" alt="" style="width: 50px; height: 50px; border-radius: 50%;">
                    </template>
                    <template v-if="column.key === 'gender'">
                        {{ record.gender == true ? 'Nam' : 'Nữ' }}
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

<script setup>
import axiosInstance from '@/configs/axios';
import { ref } from 'vue';

const users = ref([]);
const columns = ref([]);
const getUsers = async () => {
    try {
        const response = await axiosInstance.get('/users');
        if (response.status === 200) {
            users.value = response.data;
            // console.log(users.value);
        }
        console.log(response);
    } catch (error) {
        console.log(error);
    }
}
getUsers();

columns.value = [
    { title: 'STT', dataIndex: 'key', key: 'key', fixed: 'left' },
    { title: 'Họ tên', dataIndex: 'name', key: 'name' },
    { title: 'Giới tính', dataIndex: 'gender', key: 'gender' },
    { title: 'Avatar', dataIndex: 'avatar', key: 'avatar' },
    { title: 'Username', dataIndex: 'userName', key: 'userName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Thao tác', key: 'action', fixed: 'right', align: 'center' },
]

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
    right: -10px;
}

@media(max-width: 576px) {
    .search__user-icon {
        right: -8px;
    }
    .search__user-input {
        width: 100%;
    }   
}
</style>