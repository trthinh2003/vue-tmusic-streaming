<template>
	<a-modal 
		:open="modelValue" 
		title="Bộ lọc bài hát" 
		class="dark-modal" 
		@cancel="handleCancel" 
		@ok="handleApply"
	>
		<a-form layout="vertical">
			<a-form-item label="Tên bài hát">
				<a-input v-model:value="localFilters.songName" placeholder="Nhập tên bài hát" />
			</a-form-item>
			<a-form-item label="Tên nghệ sĩ">
				<div class="search__artist d-flex flex-row justify-content-between align-items-center">
					<a-input v-model:value="localFilters.artistName" placeholder="Nhập tên nghệ sĩ" />
					<a-button class="search__artist-btn ms-1">
						<span class="search__artist-btn-text">...</span>
					</a-button>
				</div>
			</a-form-item>
			<a-form-item label="Thể loại">
				<a-select v-model:value="localFilters.genre" placeholder="Chọn thể loại" allowClear>
					<a-select-option value="pop">Pop</a-select-option>
					<a-select-option value="rock">Rock</a-select-option>
					<a-select-option value="jazz">Jazz</a-select-option>
					<a-select-option value="hiphop">Hip Hop</a-select-option>
				</a-select>
			</a-form-item>
		</a-form>
		<template #footer>
			<a-button class="close-button" @click="handleCancel">Đóng</a-button>
			<a-button type="primary" class="apply-button" @click="handleApply">Áp dụng</a-button>
		</template>
	</a-modal>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
	modelValue: Boolean,
	filters: {
		type: Object,
		default: () => ({
			songName: '',
			artistName: '',
			genre: ''
		})
	}
});

const emit = defineEmits([
	'update:modelValue',
	'update:filters',
	'apply-filter'
]);

const localFilters = ref({ ...props.filters });

watch(() => props.filters, (newVal) => {
	localFilters.value = { ...newVal };
}, { deep: true });

const handleCancel = () => {
	emit('update:modelValue', false);
};

const handleApply = () => {
	emit('update:filters', { ...localFilters.value });
	emit('apply-filter');
	emit('update:modelValue', false);
	console.log('Bộ lọc bài hát:', localFilters.value);
};
</script>

<style scoped>
.dark-modal :deep(.ant-modal-content) {
	background: #1e1e1e;
	color: white;
}

.dark-modal :deep(.ant-modal-header) {
	background: #252525;
	border-bottom: 1px solid #444;
	color: white;
}

.dark-modal :deep(.ant-modal-footer) {
	background: #252525;
	border-top: 1px solid #444;
}

.search__artist-btn {
	background: #c1d0c6;
	border: none;
	color: white;
}

.close-button {
	background: #444;
	border: none;
	color: white;
}

.close-button:hover {
	background: #666;
}

.apply-button {
	background: #007bff;
	border: none;
	color: white;
}

.apply-button:hover {
	background: #0056b3;
}
</style>