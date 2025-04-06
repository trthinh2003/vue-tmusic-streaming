<template>
    <div class="playlist">
        <h2>Playlist</h2>
        <ul>
            <song-item 
            v-for="song in songs" 
            :key="song.id" 
            :song="song" 
            :is-current="song.id === currentSong.id"
            @click.native="$emit('select-song', song)" 
            />
        </ul>
    </div>
</template>

<script>
import SongItem from './SongItem.vue'

export default {
    name: 'Playlist',
    components: {
        SongItem
    },
    props: {
        songs: Array,
        currentSong: Object
    }
}
</script>

<style scoped>
.playlist {
    margin-top: 20px;
}

.playlist h2 {
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #444;
}

ul {
    list-style: none;
}
</style>