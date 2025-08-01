<template>
  <a-modal
    v-model:open="visible"
    :footer="null"
    width="450px"
    :body-style="{ padding: '0', background: '#121212', borderRadius: '12px' }"
    :mask-style="{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }"
    :style="{ top: '0' }"
    class="share-modal"
  >
    <div class="share-modal-container">
      <!-- Header -->
      <div class="share-modal-header">
        <h3>Chia sẻ bài hát</h3>
      </div>
      
      <!-- Song Info -->
      <div class="song-info-section">
        <div class="song-info">
          <div class="album-cover-container">
            <img :src="song.cover" alt="Album cover" class="album-cover">
          </div>
          <div class="song-details">
            <h4 class="song-title">{{ song.title }}</h4>
            <p class="song-artist">{{ song.artist }}</p>
          </div>
        </div>
      </div>
      
      <!-- QR Code Section -->
      <div class="qr-section">
        <div class="qr-container">
          <div class="qr-code-wrapper">
            <canvas ref="qrCanvas" width="180" height="180"></canvas>
          </div>
          <p class="qr-instruction">Quét mã QR để nghe nhạc</p>
        </div>
      </div>
      
      <!-- Expiry Info -->
      <div class="expiry-section">
        <div class="expiry-badge">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
          </svg>
          <span>Hết hạn sau {{ expireInMinutes }} phút</span>
        </div>
        <div class="expiry-times">
          <span class="time-item">Tạo: {{ new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }}</span>
          <span class="time-divider">•</span>
          <span class="time-item">Hết hạn: {{ new Date(Date.now() + expireInMinutes * 60000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }}</span>
        </div>
      </div>
      
      <!-- Share Link -->
      <div class="share-link-section">
        <div class="link-container">
          <input
            v-model="shareLink"
            readonly
            class="share-input"
            placeholder="Đang tạo link..."
          />
          <button
            class="copy-button"
            @click="copyToClipboard"
            :class="{ 'copied': isCopied }"
          >
            <svg v-if="!isCopied" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
              <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="action-buttons">
        <button class="action-btn secondary" @click="refreshLink">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
          </svg>
          <span>Làm mới</span>
        </button>
        <button class="action-btn primary" @click="shareToSocial">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z"/>
          </svg>
          <span>Chia sẻ</span>
        </button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import QRCode from 'qrcode'
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
const isCopied = ref(false)

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
      width: 180,
      margin: 1,
      color: {
        dark: '#ffffff',
        light: '#121212'
      },
      errorCorrectionLevel: 'M'
    })
  } catch (error) {
    console.error('QR code generation failed:', error)
  }
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(shareLink.value)
    .then(() => {
      isCopied.value = true
      message.success('Đã sao chép liên kết')
      setTimeout(() => {
        isCopied.value = false
      }, 2000)
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
.share-modal-container {
  background: linear-gradient(135deg, #121212 0%, #1a1a1a 100%);
  color: #ffffff;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header */
.share-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0;
}

.share-modal-header h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
}

/* Song Info Section */
.song-info-section {
  padding: 24px 24px 20px;
}

.song-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.album-cover-container {
  position: relative;
}

.album-cover {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.song-details {
  flex: 1;
}

.song-title {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.3;
}

.song-artist {
  margin: 0;
  font-size: 14px;
  color: #a7a7a7;
  font-weight: 400;
}

/* QR Section */
.qr-section {
  padding: 0 24px 20px;
}

.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #282828 0%, #3e3e3e 100%);
  border-radius: 16px;
  padding: 32px 24px 24px;
  position: relative;
}

.qr-code-wrapper {
  background: #ffffff;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  margin-bottom: 16px;
}

.qr-instruction {
  margin: 0;
  font-size: 14px;
  color: #a7a7a7;
  text-align: center;
}

/* Expiry Section */
.expiry-section {
  padding: 0 24px 20px;
  text-align: center;
}

.expiry-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(30, 215, 96, 0.1);
  color: #1ed760;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
}

.expiry-times {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: #a7a7a7;
}

.time-divider {
  color: #535353;
}

/* Share Link Section */
.share-link-section {
  padding: 0 24px 24px;
}

.link-container {
  display: flex;
  gap: 8px;
  background: #282828;
  border-radius: 8px;
  padding: 4px;
}

.share-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 14px;
  padding: 12px 16px;
  outline: none;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
}

.share-input::placeholder {
  color: #535353;
}

.copy-button {
  background: #a8b1ac;
  border: none;
  color: #000000;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  min-width: 44px;
}

.copy-button:hover:not(.copied) {
  background: #a3e2b8;
  transform: scale(1.05);
}

.copy-button.copied {
  background: #1ed760;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.action-btn.primary {
  background: linear-gradient(90deg, #00dbde 0%, #fc00ff 100%);
  color: #000000;
}

.action-btn.primary:hover {
  opacity: 0.8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 215, 96, 0.3);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.share-modal-container > * {
  animation: fadeIn 0.3s ease-out forwards;
}

.share-modal-container > *:nth-child(1) { animation-delay: 0.1s; }
.share-modal-container > *:nth-child(2) { animation-delay: 0.2s; }
.share-modal-container > *:nth-child(3) { animation-delay: 0.3s; }
.share-modal-container > *:nth-child(4) { animation-delay: 0.4s; }
.share-modal-container > *:nth-child(5) { animation-delay: 0.5s; }
.share-modal-container > *:nth-child(6) { animation-delay: 0.6s; }

/* Responsive */
@media (max-width: 480px) {
  .share-modal-header {
    padding: 20px 16px 0;
  }
  
  .song-info-section,
  .qr-section,
  .expiry-section,
  .share-link-section,
  .action-buttons {
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .qr-container {
    padding: 24px 16px 20px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>

<style>
.share-modal .ant-modal-content {
  background: rgba(26, 26, 46, 0.9);
  border-radius: 12px;
  overflow: hidden;
  padding: 0;
}
</style>