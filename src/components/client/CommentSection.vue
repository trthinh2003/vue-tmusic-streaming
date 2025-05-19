<template>
  <div class="comment-section">
    <!-- Danh sách bình luận -->
    <div class="comment-list" ref="commentList">
      <a-comment 
        v-for="comment in comments" 
        :key="comment.id"
        class="comment-item"
      >
        <template #avatar>
          <a-avatar :src="comment.user.avatar" />
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
          
          <!-- Phần trả lời -->
          <div v-if="comment.replies.length > 0" class="reply-list">
            <a-comment 
              v-for="reply in comment.replies" 
              :key="reply.id"
              class="reply-item"
            >
              <template #avatar>
                <a-avatar :src="reply.user.avatar" size="small" />
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
          <a-avatar :src="currentUser.avatar" />
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
import { ref, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

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

// Lấy danh sách bình luận
const fetchComments = async () => {
  try {
    loading.value = true;
    // Giả lập API call
    const mockComments = [
      {
        id: 1,
        content: 'Bài hát này thật tuyệt vời!',
        createdAt: '2023-05-15T10:30:00Z',
        user: {
          id: 2,
          name: 'Người nghe nhiệt tình',
          avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
        },
        likeCount: 5,
        isLiked: false,
        replies: [
          {
            id: 3,
            content: 'Mình cũng nghĩ vậy!',
            createdAt: '2023-05-15T11:00:00Z',
            user: {
              id: 3,
              name: 'Fan cứng',
              avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
            }
          }
        ]
      },
      // Thêm các comment khác...
    ];
    
    // Format thời gian
    comments.value = mockComments.map(comment => ({
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
    
    // Giả lập API call
    const newCommentObj = {
      id: Date.now(),
      content: newComment.value.trim(),
      createdAt: new Date().toISOString(),
      user: { ...props.currentUser },
      likeCount: 0,
      isLiked: false,
      replies: []
    };
    
    comments.value.unshift({
      ...newCommentObj,
      fullTime: dayjs(newCommentObj.createdAt).format('HH:mm DD/MM/YYYY'),
      relativeTime: 'Vừa xong'
    });
    
    newComment.value = '';
    message.success('Bình luận đã được gửi');
    
    // Tự động scroll lên đầu danh sách
    setTimeout(() => {
      if (commentList.value) {
        commentList.value.scrollTop = 0;
      }
    }, 100);
    
  } catch (error) {
    message.error('Gửi bình luận thất bại');
  } finally {
    submitting.value = false;
  }
};

// Like/unlike comment
const toggleLike = (comment) => {
  comment.isLiked = !comment.isLiked;
  comment.likeCount += comment.isLiked ? 1 : -1;
};

// Hiển thị form trả lời
const showReply = (comment) => {
  message.info(`Trả lời bình luận của ${comment.user.name}`);
};

onMounted(() => {
  fetchComments();
});
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
  margin-top: 8px;
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

.form-actions {
  margin-top: 8px;
  text-align: right;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  padding: 16px;
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