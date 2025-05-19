<template>
    <li class="song-item" :class="{ 'active': isCurrent }">
        <img :src="song.cover" alt="Cover" class="song-cover">
        <div class="song-details">
            <h3>{{ song.title }}</h3>
            <p class="text-white">{{ song.artist }}</p>
        </div>
        <span class="duration text-white">{{ song.duration }}</span>
    </li>
</template>

<script>
export default {
    name: 'SongItem',
    props: {
        song: Object,
        isCurrent: Boolean
    }
}
</script>

<style scoped>
.song-item {
    display: flex;
    align-items: center;
    padding: 3px;
    margin: 5px 0 0 0;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;
}

.song-item:hover {
    background: rgba(255, 255, 255, 0.1);
}

.song-item.active {
    background: #42b983;
}

.song-cover {
    width: 40px;
    height: 40px;
    border-radius: 5px;
    margin-right: 15px;
    object-fit: cover;
}

.song-details {
    flex: 1;
}

.song-details h3 {
    font-size: 16px;
    margin-bottom: 5px;
}

.song-details p {
    font-size: 14px;
    color: #aaa;
}

.duration {
    color: #aaa;
}
</style>