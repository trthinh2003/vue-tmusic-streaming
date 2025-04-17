//src/components/client/FilterModal.vue
<template>
	<a-modal v-model:open="visibleModalFilter" title="Bộ lọc bài hát" class="dark-modal" @ok="applyFilters">
		<a-form layout="vertical">
			<a-form-item label="Tên bài hát">
				<a-input v-model:value="filters.songName" placeholder="Nhập tên bài hát" />
			</a-form-item>
			<a-form-item label="Tên nghệ sĩ">
				<a-input v-model:value="filters.artistName" placeholder="Nhập tên nghệ sĩ" />
			</a-form-item>
			<a-form-item label="Thể loại">
				<a-select v-model:value="filters.genre" placeholder="Chọn thể loại" allowClear>
					<a-select-option value="pop">Pop</a-select-option>
					<a-select-option value="rock">Rock</a-select-option>
					<a-select-option value="jazz">Jazz</a-select-option>
					<a-select-option value="hiphop">Hip Hop</a-select-option>
				</a-select>
			</a-form-item>
		</a-form>
		<template #footer>
			<a-button class="close-button" @click="visible = false">Đóng</a-button>
			<a-button type="primary" class="apply-button" @click="handleOk">Áp dụng</a-button>
		</template>
	</a-modal>
</template>

<script>
export default {
	name: 'FilterModal',
	emits: ['apply-filter', 'update:open'],
	setup({ emit }) {
		const handleOk = () => {
      emit('apply-filter', filters.value);
      visibleModalFilter.value = false;
    };
		return {
			visibleModalFilter: false,
			filters: {
				songName: '',
				artistName: '',
				genre: ''
			},
			handleOk
		};
	}
};
</script>