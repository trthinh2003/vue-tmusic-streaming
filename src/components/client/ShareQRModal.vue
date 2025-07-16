<template>
  <a-modal
    v-model:open="visible"
    :footer="null"
    width="400px"
  >
    <div class="share-modal-header">Chia sẻ bài hát</div>
    <div class="share-modal-content">
      <div class="song-info">
        <img :src="song.cover" alt="Album cover" class="album-cover-small">
        <div class="song-text">
          <h4>{{ song.title }}</h4>
          <p>{{ song.artist }}</p>
        </div>
      </div>
      
      <div class="qr-code-container">
        <canvas ref="qrCanvas" width="200" height="200"></canvas>
      </div>
      
      <div class="expiry-info">
        <a-alert 
          :message="`Link hết hạn sau ${expireInMinutes} phút`" 
          type="info" 
          show-icon
        />
        <p class="expiry-detail">
          Tạo lúc: {{ new Date().toLocaleString() }}<br>
          Hết hạn: {{ expiryTime }}
        </p>
      </div>
      
      <div class="share-link">
        <a-input
          v-model:value="shareLink"
          readonly
          class="share-input"
        />
        <a-button
          type="primary"
          @click="copyToClipboard"
          class="copy-btn"
        >
          <template #icon><CopyOutlined /></template>
        </a-button>
      </div>
      
      <div class="share-actions">
        <a-button @click="refreshLink" style="margin-right: 10px;">
          <template #icon><ReloadOutlined /></template>
          Làm mới link
        </a-button>
        <a-button type="primary" @click="shareToSocial">
          <template #icon><ShareAltOutlined /></template>
          Chia sẻ
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import QRCode from 'qrcode'
import { CopyOutlined, ReloadOutlined, ShareAltOutlined } from '@ant-design/icons-vue'
import { createShareLink } from '@/services/songService'
import { message } from 'ant-design-vue'

const props = defineProps({
  open: Boolean,
  song: Object,
  expireInMinutes: {
    type: Number,
    default: 60
  }
})

const emit = defineEmits(['update:open', 'refresh'])

const visible = ref(false)
const qrCanvas = ref(null)
const shareLink = ref('')

const expiryTime = computed(() => {
  const now = new Date()
  const expiry = new Date(now.getTime() + props.expireInMinutes * 60000)
  return expiry.toLocaleString()
})

watch(() => props.open, async (val) => {
  visible.value = val
  if (val && props.song) {
    await generateShareLink()
    await nextTick()
    generateQRCode()
  }
})

watch(visible, (val) => {
  emit('update:open', val)
})

const generateShareLink = async () => {
  try {
    const response = await createShareLink(props.song.id, props.expireInMinutes)
    shareLink.value = `${window.location.origin}/share/${response.data.shareToken}`
  } catch (error) {
    console.error('Error generating share link:', error)
    message.error('Tạo link chia sẻ thất bại')
    shareLink.value = `${window.location.origin}/share/${props.song.id}`
  }
}

const generateQRCode = async () => {
  if (!qrCanvas.value || !shareLink.value) return
  
  try {
    await QRCode.toCanvas(qrCanvas.value, shareLink.value, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
  } catch (error) {
    console.error('QR code generation failed:', error)
  }
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(shareLink.value)
    .then(() => {
      message.success('Đã sao chép liên kết')
    })
    .catch(() => {
      message.error('Sao chép thất bại')
    })
}

const refreshLink = () => {
  emit('refresh')
}

const shareToSocial = () => {
  if (navigator.share) {
    navigator.share({
      title: `Nghe bài hát ${props.song.title} - ${props.song.artist}`,
      text: `Nghe bài hát ${props.song.title} của ${props.song.artist}`,
      url: shareLink.value
    }).catch(console.error)
  } else {
    copyToClipboard()
    message.info('Đã sao chép link, bạn có thể chia sẻ ở nơi khác')
  }
}
</script>

<style scoped>
.share-modal-content {
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.song-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.album-cover-small {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  margin-right: 10px;
}

.song-text h4 {
  margin: 0;
  font-size: 16px;
}

.song-text p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.qr-code-container {
  margin: 15px 0;
  padding: 15px;
  background: white;
  border-radius: 8px;
  display: flex;
  justify-content: center;
}

.expiry-info {
  margin: 10px 0;
}

.expiry-detail {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.share-link {
  display: flex;
  width: 100%;
  margin: 15px 0;
}

.share-input {
  flex: 1;
  margin-right: 8px;
}

.copy-btn {
  width: 40px;
}

.share-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
</style>