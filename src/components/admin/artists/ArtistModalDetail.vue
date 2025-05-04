<template>
	<a-modal 
		:open="isModalDetailVisible" 
		title="Thông tin nghệ sĩ" 
		@cancel="closeModal" 
		:footer="null"
	>
		<div class="artist-detail">
			<div class="avatar-container">
				<img :src="artist?.avatar || '/default-avatar.png'" alt="Avatar" class="avatar-img" />
			</div>
			<p class="text-center"><strong>{{ artist?.name || '' }}</strong></p>
			<p><strong>Ngày sinh:</strong> 
				{{ $formatDate(artist?.dateOfBirth) == "01/01/1901" ? 'Không xác định' : $formatDate(artist?.dateOfBirth) }}
			</p>
			<p><strong>Mô tả:</strong> {{ artist?.bio || '' }}</p>
		</div>
	</a-modal>
</template>

<script setup>
const props = defineProps({
	isModalDetailVisible: Boolean,
	artist: Object
})

const emit = defineEmits(['close-modal'])

const closeModal = () => emit('close-modal');
</script>

<style scoped>
.avatar-container {
	text-align: center;
	margin-bottom: 15px;
}

.avatar-img {
	width: 150px;
	height: 150px;
	border-radius: 5px;
	object-fit: cover;
}
</style>
