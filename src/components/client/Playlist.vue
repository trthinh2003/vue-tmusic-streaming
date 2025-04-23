<template>
    <div class="playlist">
        <h2>Playlist</h2>
        <ul>
            <song-item 
                v-for="song in paginatedSongs" 
                :key="song.id" 
                :song="song" 
                :is-current="song.id === currentSong.id"
                @click.native="$emit('select-song', song)" 
            />
        </ul>

        <!-- Điều khiển phân trang -->
        <div class="pagination-controls mt-4">
            <button @click="prevPage" :disabled="currentPage === 1"><</button>
            <span class="text-white mx-2">{{ currentPage }} / {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages">></button>
        </div>
    </div>
</template>

<script>
import SongItem from './SongItem.vue'
import { Icon } from '@iconify/vue';

export default {
    name: 'Playlist',
    components: {
        SongItem,
        Icon
    },
    props: {
        songs: Array,
        currentSong: Object,
        itemsPerPage: {
            type: Number,
            default: 3
        }
    },
    data() {
        return {
            currentPage: 1
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.songs.length / this.itemsPerPage);
        },
        paginatedSongs() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.songs.slice(start, end);
        }
    },
    methods: {
        prevPage() {
            if (this.currentPage > 1) this.currentPage--;
        },
        nextPage() {
            if (this.currentPage < this.totalPages) this.currentPage++;
        }
    }
}
</script>

<style scoped>
.playlist {
    margin-top: 5px;
}

.playlist h2 {
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #444;
}

ul {
    list-style: none;
}

.pagination-controls {
    display: flex;
    justify-content: center;
    margin-top: 10px;
}

button {
    background: #42b983;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    margin: 0 5px;
    border-radius: 5px;
}

button:disabled {
    background: #555;
    cursor: not-allowed;
}
</style>
