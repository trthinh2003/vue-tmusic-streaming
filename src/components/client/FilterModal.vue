<template>
	<a-modal v-model:open="visible" title="Bộ lọc bài hát" class="dark-modal" @ok="$emit('apply-filter')">
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
		<a-button type="primary" class="apply-button" @click="handleApply">Áp dụng</a-button>
	  </template>
	</a-modal>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const visible = ref(false)
  const filters = ref({
	songName: '',
	artistName: '',
	genre: ''
  })
  
  const emit = defineEmits(['apply-filter'])
  
  const showModal = () => {
	visible.value = true
  }
  
  const handleApply = () => {
	emit('apply-filter', filters.value)
	visible.value = false
  }
  
  defineExpose({
	showModal
  })
  </script>