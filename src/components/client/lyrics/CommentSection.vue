<template>
  <div class="comment-section">
    <!-- Danh sách bình luận -->
    <div class="comment-list" ref="commentList">
      <div v-if="comments.length === 0 && !loading" class="no-comments">
        Chưa có bình luận nào cho bài hát này.
      </div>
      <a-comment 
        v-for="comment in comments" 
        :key="comment.id"
        class="comment-item"
      >
        <template #avatar>
          <a-avatar :src="getAvatar(comment.user.avatar)" />
        </template>
        <template #author>
          <a>{{ comment.user.name }}</a>
        </template>
        <template #datetime>
          <a-tooltip :title="comment.fullTime">
            <span>{{ comment.relativeTime }}</span>
          </a-tooltip>
        </template>
        <template #content>
          <p class="comment-content">{{ comment.content }}</p>
          <div class="comment-actions">
            <a-button type="text" size="small" @click="toggleLike(comment)">
              <i class="fa-solid fa-heart" :class="{ 'liked': comment.isLiked }"></i>
              {{ comment.likeCount || 0 }}
            </a-button>
            <a-button type="text" size="small" @click="showReply(comment)">
              Trả lời
            </a-button>
          </div>
          
          <!-- Form trả lời bình luận (đặt ngay dưới comment actions) -->
          <div v-if="replyingComment && replyingComment.id === comment.id" class="reply-form">
            <a-comment>
              <template #avatar>
                <a-avatar :src="getAvatar(currentUser.avatar)" size="small" />
              </template>
              <template #content>
                <a-textarea
                  v-model:value="replyContent"
                  :placeholder="`Trả lời ${replyingComment.user.name}...`"
                  :rows="2"
                  :auto-size="{ minRows: 2, maxRows: 4 }"
                />
                <div class="reply-form-actions">
                  <a-button 
                    size="small" 
                    @click="cancelReply"
                  >
                    Hủy
                  </a-button>
                  <a-button 
                    type="primary" 
                    size="small"
                    @click="submitReply"
                    :disabled="!replyContent.trim()"
                    :loading="replySubmitting"
                  >
                    Trả lời
                  </a-button>
                </div>
              </template>
            </a-comment>
          </div>
          
          <!-- Phần trả lời -->
          <div v-if="comment.replies.length > 0" class="reply-list">
            <a-comment 
              v-for="reply in comment.replies" 
              :key="reply.id"
              class="reply-item"
            >
              <template #avatar>
                <a-avatar :src="getAvatar(reply.user.avatar)" size="small" />
              </template>
              <template #author>
                <a>{{ reply.user.name }}</a>
              </template>
              <template #datetime>
                <a-tooltip :title="reply.fullTime">
                  <span class="text-warning">{{ reply.relativeTime }}</span>
                </a-tooltip>
              </template>
              <template #content>
                <p class="reply-content">{{ reply.content }}</p>
              </template>
            </a-comment>
          </div>
        </template>
      </a-comment>
      
      <a-spin v-if="loading" class="loading-spinner" />
    </div>
    
    <!-- Form thêm bình luận -->
    <div class="comment-form">
      <a-comment>
        <template #avatar>
          <a-avatar :src="getAvatar(currentUser.avatar)" size="small" />
        </template>
        <template #content>
          <a-textarea
            v-model:value="newComment"
            placeholder="Thêm bình luận..."
            :rows="2"
            :auto-size="{ minRows: 2, maxRows: 5 }"
            @pressEnter="submitComment"
          />
          <div class="form-actions">
            <a-button 
              type="primary" 
              size="small"
              @click="submitComment"
              :disabled="!newComment.trim()"
              :loading="submitting"
            >
              Gửi
            </a-button>
          </div>
        </template>
      </a-comment>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { getComments, createComment, createCommentReply, toggleCommentLike } from '@/services/commentService';
import { useNextSongSignalStore } from '@/stores/nextSongSignalStore';
import adminLogo from '@/assets/img/admin-logo.png';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const props = defineProps({
  songId: {
    type: Number,
    required: true
  },
  currentUser: {
    type: Object,
    required: true
  }
});

const comments = ref([]);
const newComment = ref('');
const submitting = ref(false);
const loading = ref(false);
const commentList = ref(null);
const replyingComment = ref(null);
const replyContent = ref('');
const replySubmitting = ref(false);

const nextSongSignalStore = useNextSongSignalStore();
const getAvatar = (avatar) => avatar === '' ? adminLogo : avatar;

// Lấy danh sách bình luận từ API
const fetchComments = async () => {
  try {
    loading.value = true;
    const response = await getComments(props.songId);
    
    // Format thời gian cho comments
    comments.value = response.data.map(comment => ({
      ...comment,
      fullTime: dayjs(comment.createdAt).format('HH:mm DD/MM/YYYY'),
      relativeTime: dayjs(comment.createdAt).fromNow(),
      replies: comment.replies?.map(reply => ({
        ...reply,
        fullTime: dayjs(reply.createdAt).format('HH:mm DD/MM/YYYY'),
        relativeTime: dayjs(reply.createdAt).fromNow()
      })) || []
    }));
    
  } catch (error) {
    console.error('Error fetching comments:', error);
    message.error('Lỗi khi tải bình luận');
  } finally {
    loading.value = false;
  }
};

// Gửi bình luận mới
const submitComment = async () => {
  if (!newComment.value.trim()) return;

  try {
    submitting.value = true;
    
    const commentData = {
      content: newComment.value.trim(),
      songId: props.songId
    };
    
    const response = await createComment(commentData);
    
    // Thêm comment mới vào đầu danh sách
    const newCommentObj = {
      ...response.data,
      fullTime: dayjs(response.data.createdAt).format('HH:mm DD/MM/YYYY'),
      relativeTime: 'Vừa xong',
      replies: []
    };
    
    comments.value.unshift(newCommentObj);
    newComment.value = '';
    message.success('Bình luận đã được gửi');
    
    // Tự động scroll lên đầu danh sách
    setTimeout(() => {
      if (commentList.value) {
        commentList.value.scrollTop = 0;
      }
    }, 100);
    
  } catch (error) {
    console.error('Error creating comment:', error);
    if (error.response?.status === 401) {
      message.error('Vui lòng đăng nhập để bình luận');
    } else {
      message.error('Gửi bình luận thất bại');
    }
  } finally {
    submitting.value = false;
  }
};

// Like/unlike comment
const toggleLike = async (comment) => {
  try {
    const response = await toggleCommentLike(comment.id);
    
    // Cập nhật trạng thái like trong UI
    comment.isLiked = response.data.isLiked;
    comment.likeCount += response.data.isLiked ? 1 : -1;
    
  } catch (error) {
    console.error('Error toggling like:', error);
    if (error.response?.status === 401) {
      message.error('Vui lòng đăng nhập để thích bình luận');
    } else {
      message.error('Có lỗi xảy ra khi thích bình luận');
    }
  }
};

// Hiển thị form trả lời
const showReply = (comment) => {
  replyingComment.value = comment;
  replyContent.value = '';
};

// Hủy trả lời
const cancelReply = () => {
  replyingComment.value = null;
  replyContent.value = '';
};

// Gửi trả lời
const submitReply = async () => {
  if (!replyContent.value.trim() || !replyingComment.value) return;

  try {
    replySubmitting.value = true;

    const replyData = {
      replyContent: replyContent.value.trim(),
      commentId: replyingComment.value.id
    };
    const response = await createCommentReply(replyData);
    const parentComment = comments.value.find(c => c.id === replyingComment.value.id);
    if (parentComment) {
      const newReply = {
        ...response.data,
        fullTime: dayjs(response.data.createdAt).format('HH:mm DD/MM/YYYY'),
        relativeTime: 'Vừa xong'
      };

      parentComment.replies.push(newReply);
    }
    replyingComment.value = null;
    replyContent.value = '';
    message.success('Trả lời đã được gửi');

  } catch (error) {
    console.error('Error creating reply:', error);
    if (error.response?.status === 401) {
      message.error('Vui lòng đăng nhập để trả lời bình luận');
    } else {
      message.error('Gửi trả lời thất bại');
    }
  } finally {
    replySubmitting.value = false;
  }
};

watch(() => nextSongSignalStore.refreshFlag, () => {
  fetchComments();
});

// watch(() => props.songId, (newSongId) => {
//   fetchComments();
// }, { immediate: true });

onMounted(() => {
  fetchComments();
})
</script>

<style scoped>
.comment-section {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.comment-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
}

.comment-item {
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.comment-content {
  margin-bottom: 8px;
  color: white;
  white-space: pre-line;
}

.comment-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.comment-actions .ant-btn {
  padding: 0 8px;
  height: 28px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.comment-actions .fa-heart {
  font-size: 12px;
  transition: color 0.3s ease;
}

.comment-actions .fa-heart.liked {
  color: #ff4d4f;
}

.comment-actions button {
  color: rgba(255, 255, 255, 0.45);
}

.comment-actions button:hover {
  color: var(--primary-color);
}

:deep(.ant-comment .ant-comment-content-author-name >*) {
  color: #00eeff;
}

:deep(.ant-comment .ant-comment-content-author-time) {
  color: rgb(198, 188, 26);
}

.reply-form {
  margin-top: 12px;
  padding-left: 32px;
}

.reply-form-actions {
  margin-top: 8px;
  text-align: right;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.reply-form-actions .ant-btn {
  height: 28px;
  padding: 0 12px;
  font-size: 12px;
}

.reply-item :deep(.ant-avatar-sm) {
  width: 32px;
  height: 32px;
}

.ant-btn-primary:disabled {
  color: white;
  background-color: darkcyan;
}

.liked {
  color: #ff4d4f;
}

.reply-list {
  margin-top: 12px;
  padding-left: 32px;
  border-left: 2px solid rgba(255, 255, 255, 0.1);
}

.reply-item {
  padding: 8px 0;
}

.reply-content {
  color: white;
}

.comment-form {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.comment-form :deep(.ant-avatar-sm) {
  width: 32px;
  height: 32px;
}

.form-actions {
  margin-top: 8px;
  text-align: right;
}

.no-comments {
  padding: 16px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  padding: 16px;
}
@media (max-width: 768px) {
  .comment-form {
    padding: 12px;
  }
  
  .reply-form {
    padding-left: 20px;
  }
  
  .reply-list {
    padding-left: 20px;
  }
}
</style>

<style scoped>
.minimal-scroll {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
  
.minimal-scroll::-webkit-scrollbar {
	width: 6px;
}
  
.minimal-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  visibility: hidden;
}
  
.minimal-scroll:hover::-webkit-scrollbar-thumb {
  visibility: visible;
}
</style>