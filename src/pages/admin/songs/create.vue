<template>
    <div class="song-create-container">
        <router-link :to="{ name: 'admin-songs' }" class="back-link">
            <arrow-left-outlined /> Quay lại
        </router-link>
        
        <h1 class="page-title">Thêm mới bài hát</h1>
        
        <a-form layout="vertical" @submit.prevent="handleSubmit" class="song-form">
            <!-- Section 1: Basic Info -->
            <a-card title="Thông tin cơ bản" class="form-section">
                <a-row :gutter="24">
                    <a-col :xs="24" :md="12">
                        <a-form-item label="Tiêu đề bài hát" name="title">
                            <a-input v-model:value="songData.Title" 
                                    placeholder="Nhập tiêu đề bài hát"
                                    class="custom-input" />
                            <span class="text-danger" v-if="errorsServer.Title?.[0]">{{ errorsServer.Title?.[0] }}</span>
                        </a-form-item>
                    </a-col>

                    <a-col :xs="24" :md="12">
                        <a-form-item label="Nghệ sĩ" name="artist">
                            <a-auto-complete
                                v-model:value="songData.Artist"
                                :options="artistOptions"
                                :loading="artistLoading"
                                placeholder="Nhập tên nghệ sĩ"
                                class="custom-input"
                                @search="handleArtistSearch"
                                @select="handleArtistSelect"
                            />
                            <span class="text-danger" v-if="errorsServer.Artist?.[0]">{{ errorsServer.Artist?.[0] }}</span>
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row :gutter="24">
                    <a-col :xs="24" :md="12">
                        <a-form-item label="Độ dài" name="duration">
                            <a-input v-model:value="songData.Duration" 
                                    placeholder="VD: 4:20, 3:50, 5:00,..."
                                    class="custom-input" />
                            <span class="text-danger" v-if="errorsServer.Duration?.[0]">{{ errorsServer.Duration?.[0] }}</span>                            
                        </a-form-item>
                    </a-col>
                    
                    <a-col :xs="24" :md="12">
                        <a-form-item label="Ngày phát hành" name="releaseDate">
                            <a-date-picker v-model:value="songData.ReleaseDate" 
                                placeholder="Nhập ngày phát hành"
								format="DD/MM/YYYY"
                                style="width: 100%;" />
                            <span class="text-danger" v-if="errorsServer.ReleaseDate?.[0]">{{ errorsServer.ReleaseDate?.[0] }}</span> 
                        </a-form-item>
                    </a-col>
                </a-row>
                
                <a-row :gutter="24">
                    <a-col :span="24">
                        <a-form-item label="Mô tả ngắn" name="description">
                            <a-textarea v-model:value="songData.Cour" 
                                      placeholder="Nhập mô tả ngắn về bài hát"
                                      :rows="3"
                                      class="custom-textarea" />
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-card>
            
            <!-- Section 2: Classification -->
            <a-card title="Phân loại" class="form-section">
                <a-row :gutter="24">
                   <a-col :xs="24" :md="12">
                        <a-form-item label="Album (Tùy chọn)" name="album">
                            <a-select
                                v-model:value="songData.Albums"
                                show-search
                                placeholder="Chọn album (có thể bỏ trống)"
                                :options="albums"
                                :filter-option="filterOption"
                                class="custom-select"
                                allowClear
                            />
                            <span class="text-danger" v-if="errorsServer.Album?.[0]">{{ errorsServer.Album?.[0] }}</span>                            
                        </a-form-item>
                    </a-col>
                    
                    <a-col :xs="24" :md="12">
                        <a-form-item label="Thể loại" name="genre">
                            <a-select
                                v-model:value="songData.Genres"
                                mode="multiple"
                                placeholder="Chọn thể loại"
                                :options="genres"
                                :filter-option="filterOption"
                                class="custom-select"
                            />
                            <span class="text-danger" v-if="errorsServer.Genres?.[0]">{{ errorsServer.Genres?.[0] }}</span>
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-card>

            <!-- Section 3: Lyrics Editor -->
            <a-card title="Lời bài hát" class="form-section">
                <a-tabs v-model:activeKey="lyricsActiveTab">
                    <a-tab-pane key="editor" tab="Soạn thảo">
                        <a-form-item>
                            <div class="lyrics-editor-container">
                                <textarea 
                                    v-model="songData.LyricsText" 
                                    class="lyrics-editor" 
                                    placeholder="Nhập lời bài hát ở đây..."
                                    rows="10"
                                ></textarea>
                                <div class="editor-toolbar">
                                    <a-button @click="formatLyrics('bold')"><bold-outlined /></a-button>
                                    <a-button @click="formatLyrics('italic')"><italic-outlined /></a-button>
                                    <a-button @click="formatLyrics('timestamp')"><field-time-outlined /></a-button>
                                    <div class="divider"></div>
                                    <a-button @click="importLyricsFile" type="link">
                                        <import-outlined /> Nhập từ file
                                    </a-button>
									<div class="divider"></div>
									<a-dropdown>
										<a-button type="link">
											<export-outlined /> Xuất file
										</a-button>
										<template #overlay>
											<a-menu>
												<a-menu-item @click="exportLyricsFile('txt')">TXT</a-menu-item>
												<a-menu-item @click="exportLyricsFile('lrc')">LRC</a-menu-item>
											</a-menu>
										</template>
									</a-dropdown>
                                </div>
                            </div>
                        </a-form-item>
                    </a-tab-pane>
                    
                    <a-tab-pane key="upload" tab="Tải lên file">
                        <a-form-item label="File lyric (LRC hoặc TXT)">
                            <div class="lyrics-upload-container">
                                <a-upload
                                    v-model:file-list="lyricsFileList"
                                    :before-upload="beforeLyricsUpload"
									:customRequest="dummyRequest"
                                    @change="handleLyricsUpload"
                                    accept=".lrc,.txt"
                                    :showUploadList="false"
                                >
                                    <a-button class="upload-btn">
                                        <upload-outlined /> Chọn file lyric
                                    </a-button>
                                </a-upload>
                                <div v-if="songData.LyricsFile" class="file-info">
                                    <file-outlined />
                                    <span class="file-name">{{ songData.LyricsFile }}</span>
                                    <check-circle-filled v-if="lyricsUploadSuccess" class="success-icon" />
                                    <close-circle-filled v-else class="error-icon" />
                                </div>
                                <div class="upload-hint">
                                    Chấp nhận: .lrc, .txt (tối đa 2MB)
                                </div>
                                <div v-if="lyricsPreview" class="lyrics-preview">
                                    <h4>Xem trước:</h4>
                                    <pre>{{ lyricsPreview }}</pre>
                                </div>
                            </div>
                        </a-form-item>
                    </a-tab-pane>
                </a-tabs>
                <span class="text-danger" v-if="errorsServer.LyricsFile?.[0]">{{ errorsServer.LyricsFile?.[0] }}</span>
            </a-card>
            
            <!-- Section 4: Media Files -->
            <a-card title="Tệp đa phương tiện" class="form-section">
                <a-row :gutter="24">
                    <a-col :xs="24" :md="8">
                        <a-form-item name="image">
                            <div class="upload-container">
                                <a-upload 
                                  v-model:file-list="imageFileList" 
                                  list-type="picture-card" 
                                  class="avatar-uploader"
                                  :show-upload-list="false" 
                                  :before-upload="beforeImageUpload" 
                                  @change="handleImageUpload"
								  accept="image/*"
								>
                                  <img v-if="previewImage" :src="previewImage" alt="Ảnh nền" class="avatar-preview" />
                                  <div v-else class="upload-placeholder">
                                    <plus-outlined class="text-dark"/>
                                    <div class="ant-upload-text text-dark">Ảnh nền</div>
                                  </div>
                                </a-upload>
                            </div>
                            <span class="text-danger" v-if="errorsServer.Image?.[0]">{{ errorsServer.Image?.[0] }}</span>
                        </a-form-item>
                    </a-col>

					<a-col :xs="24" :md="8">
                        <a-form-item name="cover">
                            <div class="upload-container">
                                <a-upload 
                                  v-model:file-list="coverFileList" 
                                  list-type="picture-card" 
                                  class="avatar-uploader"
                                  :show-upload-list="false" 
                                  :before-upload="beforeCoverUpload" 
                                  @change="handleCoverUpload"
								  accept="image/*"
								>
                                  <img v-if="previewCover" :src="previewCover" alt="Ảnh bài hát" class="avatar-preview" />
                                  <div v-else class="upload-placeholder">
                                    <plus-outlined class="text-dark"/>
                                    <div class="ant-upload-text text-dark">Ảnh bài hát</div>
                                  </div>
                                </a-upload>
                            </div>
                            <span class="text-danger" v-if="errorsServer.Cover?.[0]">{{ errorsServer.Cover?.[0] }}</span>
                        </a-form-item>
                    </a-col>
                    
                    <a-col :xs="24" :md="8" class="text-center">
                        <a-form-item name="songFile">
                            <div class="song-upload-container">
                                <a-upload
                                    v-model:file-list="songFileList"
                                    :before-upload="beforeSongUpload"
                                    @change="handleSongUpload"
									:customRequest="dummyRequest"
                                    accept="audio/*"
                                    class="song-upload"
                                >
                                    <a-button class="upload-btn" size="large">
                                        <upload-outlined /> Chọn file nhạc
                                    </a-button>
                                </a-upload>
                                <div v-if="songData.SongFile" class="file-info">
                                    <file-outlined />
                                    <span class="file-name">{{ songData.SongFile }}</span>
                                    <check-circle-filled class="success-icon" />
                                </div>
                                <div v-else class="upload-hint">
                                    Chấp nhận: MP3, WAV, AAC (tối đa 50MB)
                                </div>
                            </div>
                            <span class="text-danger" v-if="errorsServer.SongFile?.[0]">{{ errorsServer.SongFile?.[0] }}</span>
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-card>
            
            <!-- Section 5: Additional Info -->
            <a-card title="Thông tin bổ sung" class="form-section">
                <a-row :gutter="24">
                    <a-col :span="24">
                        <a-form-item label="Thẻ tags" name="tags">
                            <a-select
                                v-model:value="songData.Tags"
                                mode="tags"
                                placeholder="Nhập tags và ấn Enter"
                                :token-separators="[',']"
                                class="custom-tags"
                            />
                            <span class="text-danger" v-if="errorsServer.Tags?.[0]">{{ errorsServer.Tags?.[0] }}</span>
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-card>
            
            <!-- Form Actions -->
            <div class="form-actions">
                <a-button type="default" @click="handleReset" class="reset-btn">
                    <redo-outlined /> Làm mới
                </a-button>
                <a-button type="primary" html-type="submit" :loading="loading" class="submit-btn">
                    <save-outlined /> Lưu bài hát
                </a-button>
            </div>
        </a-form>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { 
    PlusOutlined, 
    UploadOutlined, 
    EditOutlined,
    FileOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
    ArrowLeftOutlined,
    SaveOutlined,
    RedoOutlined,
    BoldOutlined,
    ItalicOutlined,
    FieldTimeOutlined,
    ImportOutlined,
	ExportOutlined 
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { getAlbumsForCreateSong } from '@/services/albumService';
import { getGenres } from '@/services/genreService';
import { createSong } from '@/services/songService';
import { searchArtists } from '@/services/artistService';

const router = useRouter();
const loading = ref(false);

const lyricsActiveTab = ref('editor');
const lyricsUploadSuccess = ref(false);
const lyricsPreview = ref('');

const artistOptions = ref([]);
const artistLoading = ref(false);
const artistSearchTimeout = ref(null);

// Form data
const songData = ref({
    Title: '',
    Artist: '',
    Duration: '',
    ReleaseDate: null,
    Genres: [],
    Albums: '',
    Cour: '',
    Image: null,
	Cover: null,
    SongFile: null,
    Tags: [],
    LyricsText: '',
    LyricsFile: '',
    LyricsFileContent: ''
});

const imageFileList = ref([]);
const coverFileList = ref([]);
const songFileList = ref([]);

const albums = ref([]);
const genres = ref([]);

const previewImage = ref('');
const previewCover = ref('');

const lyricsFileList = ref([]);
const lyricsFile = ref(null);

const errorsServer = ref({});

// Xử lý nhập liệu artist
const handleArtistSearch = (searchValue) => {
    if (artistSearchTimeout.value) {
        clearTimeout(artistSearchTimeout.value);
    }
    
    if (!searchValue || searchValue.length < 2) {
        artistOptions.value = [];
        return;
    }
    
    artistSearchTimeout.value = setTimeout(async () => {
        try {
            artistLoading.value = true;
            const response = await searchArtists(1, 10, searchValue);
            
            artistOptions.value = response.data.data.map(artist => ({
                value: artist.name,
                label: artist.name,
                id: artist.id
            }));
        } catch (error) {
            console.error('Error searching artists:', error);
            artistOptions.value = [];
        } finally {
            artistLoading.value = false;
        }
    }, 300); // Debounce 300ms
};

const handleArtistSelect = (value, option) => {
    songData.value.Artist = value;
    // songData.value.ArtistId = option.id;
};

// Format lyrics text
const formatLyrics = (type) => {
    const textarea = document.querySelector('.lyrics-editor');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = songData.value.LyricsText.substring(start, end);
    
    let formattedText = '';
    switch (type) {
        case 'bold':
            formattedText = `[b]${selectedText}[/b]`;
            break;
        case 'italic':
            formattedText = `[i]${selectedText}[/i]`;
            break;
        case 'timestamp':
            formattedText = `[00:00.00]${selectedText}`;
            break;
        default:
            formattedText = selectedText;
    }
    
    songData.value.LyricsText = 
        songData.value.LyricsText.substring(0, start) + 
        formattedText + 
        songData.value.LyricsText.substring(end);
    
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
};

// Xử lý upload file lyric
const dummyRequest = ({ onSuccess }) => {
    setTimeout(() => {
        onSuccess("ok");
    }, 0);
};
const beforeLyricsUpload = (file) => {
    const isLyricsFile = ['.lrc', '.txt'].some(ext => file.name.toLowerCase().endsWith(ext));
    const isLt2M = file.size / 1024 / 1024 < 2;
    
    if (!isLyricsFile) {
        message.error('Chỉ chấp nhận file .lrc hoặc .txt!');
        return false;
    }
    if (!isLt2M) {
        message.error('File lyric phải nhỏ hơn 2MB!');
        return false;
    }
    
    return true;
};

const handleLyricsUpload = async (info) => {
    if (info.file.status === 'uploading') {
        lyricsUploadSuccess.value = false;
        return;
    }
    
    if (info.file.status === 'done') {
        try {
            const file = info.file.originFileObj;
            
            if (!file || !(file instanceof Blob)) {
                throw new Error('File không hợp lệ');
            }
            
            lyricsFile.value = file;
            songData.value.LyricsFile = file.name;
            
            const fileContent = await readFileAsText(file); // **Đọc nội dung để preview (không lưu vào songData)**
            lyricsPreview.value = fileContent.split('\n').slice(0, 50).join('\n');
            lyricsUploadSuccess.value = true;
            
            if (lyricsActiveTab.value === 'editor') {
                songData.value.LyricsText = fileContent;
                message.info('Đã nhập nội dung lyric từ file');
            }
        } catch (error) {
            console.error('Error reading file:', error);
            lyricsUploadSuccess.value = false;
            message.error('Lỗi khi đọc file lyric: ' + error.message);
        }
    }
};

const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = (error) => reject(error);
            
            // ****Kiểm tra lại đối tượng file trước khi đọc*****
            if (file instanceof Blob) {
                reader.readAsText(file);
            } else {
                reject(new Error('Đối tượng file không hợp lệ'));
            }
        } catch (error) {
            reject(error);
        }
    });
};

const importLyricsFile = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.lrc,.txt';
    fileInput.onchange = async (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            
            try {
                if (!(file instanceof Blob)) {
                    throw new Error('File không hợp lệ');
                }
                
                lyricsFile.value = file; // Lưu file gốc
                songData.value.LyricsFile = file.name;
                
                const fileContent = await readFileAsText(file);
                songData.value.LyricsText = fileContent;
                lyricsPreview.value = fileContent.split('\n').slice(0, 50).join('\n');
                lyricsUploadSuccess.value = true;
                
                message.success('Đã nhập nội dung lyric từ file');
            } catch (error) {
                console.error('Error reading file:', error);
                message.error('Lỗi khi đọc file: ' + error.message);
            }
        }
    };
    fileInput.click();
};


// Xử lý xuất file lyric
const exportLyricsFile = (format = 'txt') => {
    if (!songData.value.LyricsText) {
        message.warning('Không có nội dung lyric để xuất');
        return;
    }
    
    try {
        let content = songData.value.LyricsText;
        let fileType = 'text/plain';
        let extension = '.txt';
        
        if (format === 'lrc') {
            extension = '.lrc';
        }
        
        const blob = new Blob([content], { type: fileType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const fileName = songData.value.Title 
            ? `${songData.value.Title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_lyrics${extension}` 
            : `lyrics${extension}`;
        a.download = fileName;
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        message.success(`Đã xuất file lyric (${format.toUpperCase()}) thành công`);
    } catch (error) {
        console.error('Lỗi khi xuất file lyric:', error);
        message.error('Xuất file lyric thất bại');
    }
};

// Helper để tạo file .lrc từ text
const createLrcFileFromText = (lyricsText, songTitle = 'Untitled') => {
    if (!lyricsText || typeof lyricsText !== 'string') {
        throw new Error('Invalid lyrics text');
    }
    try {
        const safeTitle = songTitle 
            ? songTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()
            : 'untitled';
        const fileName = `${safeTitle}_lyrics.lrc`;
        const lrcBlob = new Blob([lyricsText], { 
            type: 'text/plain' 
        });
        Object.defineProperty(lrcBlob, 'name', {
            value: fileName,
            writable: false
        });
        
        return lrcBlob;
    } catch (error) {
        console.error('Error creating LRC blob:', error);
        throw error;
    }
};

onMounted(async () => {
    try {
        const albumRes = await getAlbumsForCreateSong(1, 100);
        console.log(albumRes);
        albums.value = [
            { value: null, label: "-- Không chọn album --" },
            ...albumRes.data.data.map(album => ({
                value: album.id,
                label: album.title
            }))
        ];     

        const genreRes = await getGenres();
        genres.value = genreRes.data.map(genre => ({
            value: genre.id,
            label: genre.name
        }));
    } catch (error) {
        message.error('Lỗi khi tải dữ liệu');
        console.error(error);
    }
});

const filterOption = (input, option) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

const beforeImageUpload = () => {
    return false;
};

const handleImageUpload = (info) => {
    const file = info.file.originFileObj || info.file;
    
    if (!file) {
        console.error('No file found in upload info');
        return;
    }
    
    if (!(file instanceof Blob)) {
        console.error('Uploaded file is not a Blob or File object');
        return;
    }
    
    try {
        previewImage.value = URL.createObjectURL(file);
        songData.value.Image = file;
    } catch (error) {
        console.error('Error creating object URL:', error);
        message.error('Không thể xử lý file ảnh');
    }
};

const beforeCoverUpload = () => {
    return false;
};

const handleCoverUpload = (info) => {
    const file = info.file.originFileObj || info.file;
    
    if (!file) {
        console.error('No file found in upload info');
        return;
    }
    
    try {
        previewCover.value = URL.createObjectURL(file);
        songData.value.Cover = file; 
    } catch (error) {
        console.error('Error creating object URL:', error);
        message.error('Không thể xử lý file ảnh bìa');
    }
};

const beforeSongUpload = (file) => {
    const isAudio = file.type.startsWith('audio/');
    const isLt50M = file.size / 1024 / 1024 < 50;
    
    if (!isAudio) {
        message.error('Bạn chỉ có thể tải lên file nhạc!');
    }
    if (!isLt50M) {
        message.error('File nhạc phải nhỏ hơn 50MB!');
    }
    
    return isAudio && isLt50M;
};

const handleSongUpload = (info) => {
    const file = info.file.originFileObj || info.file;
    
    if (!file) {
        console.error('No file found in upload info');
        return;
    }
    
    songData.value.SongFile = file;
};

console.log(songData.value);


const handleSubmit = async () => {
    try {
        loading.value = true;
        const formData = new FormData();
        formData.append('Title', songData.value.Title);
        formData.append('Artist', songData.value.Artist);
        formData.append('Genres', JSON.stringify(songData.value.Genres));
        formData.append('Duration', songData.value.Duration);
        formData.append('ReleaseDate', dayjs(songData.value.ReleaseDate).format('YYYY-MM-DD') == 'Invalid Date' ? '' : dayjs(songData.value.ReleaseDate).format('YYYY-MM-DD'));
        if (songData.value.Albums && songData.value.Albums !== null && songData.value.Albums !== '') {
            formData.append('Album', songData.value.Albums.toString());
        }        
        formData.append('cour', songData.value.Cour);
        formData.append('Tags', JSON.stringify(songData.value.Tags));
        
        if (songData.value.Image) {
            formData.append('Image', songData.value.Image);
        }
        if (songData.value.Cover) {
            formData.append('Cover', songData.value.Cover);
        }
        if (songData.value.SongFile) {
            formData.append('SongFile', songData.value.SongFile);
        }
        // Xử lý lyrics - tự động tạo file .lrc nếu cần
        if (lyricsFile.value) {
            // Nếu đã có file lyric được upload
            formData.append('LyricsFile', lyricsFile.value);
        } else if (songData.value.LyricsText) {
            // Nếu có text lyric nhưng chưa có file, tự động tạo file .lrc
            try {
                const lrcBlob = createLrcFileFromText(songData.value.LyricsText, songData.value.Title);
                formData.append('LyricsFile', lrcBlob, `${safeTitle}_lyrics.lrc`);
            } catch (error) {
                console.error('Error creating LRC file:', error);
                // Fallback: gửi text thuần túy nếu không tạo được file
                formData.append('LyricsText', songData.value.LyricsText);
            }
        }
        
        console.log([...formData.entries()]);
        try {
            const response = await createSong(formData);
            console.log(response.data.message);
            await new Promise(resolve => setTimeout(resolve, 1000));
            message.success(response.data.message);
            router.push({ name: 'admin-songs' });
        } catch (error) {
            if (error.response?.status === 400) {
                errorsServer.value = { ...error.response.data.errors };
                console.log('Validation errors:', errorsServer.value); 
                console.log(errorsServer.value.Title[0]);
            }
        }
    } catch (error) {
        message.error('Lỗi khi thêm bài hát');
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const handleReset = () => {
    songData.value = {
        Title: '',
        Artist: undefined,
        Duration: undefined,
        Genres: [],
        Albums: undefined,
        Cour: '',
        Image: null,
        Cover: null,
        SongFile: null,
        Tags: [],
        LyricsText: '',
        LyricsFile: ''
    };
    lyricsFile.value = null;
    imageFileList.value = [];
    coverFileList.value = [];
    songFileList.value = [];
    lyricsFileList.value = [];
    previewImage.value = '';
    previewCover.value = '';
    lyricsPreview.value = '';
    lyricsUploadSuccess.value = false;
};

//Giải phóng vùng nhớ để tránh Memory Leak
onUnmounted(() => {
    if (previewImage.value) {
        URL.revokeObjectURL(previewImage.value);
    }
    if (previewCover.value) {
        URL.revokeObjectURL(previewCover.value);
    }
    if (artistSearchTimeout.value) {
        clearTimeout(artistSearchTimeout.value);
    }
});
</script>

<style scoped src="@/assets/admin/css/song-crud.css"></style>