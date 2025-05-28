<template>
  <a-modal 
    :open="modelValue"
    :footer="null"
    width="800px"
    centered
    class="help-modal"
    :getContainer="false"
    :forceRender="true"
    @cancel="handleCancel"
  >
    <div class="help-modal-header">
      <h2>Hướng dẫn</h2>
    </div>
    <div class="help-modal-content" v-if="modelValue">
      <!-- Thay Carousel bằng cách hiển thị thủ công -->
      <div v-for="(step, index) in visibleSteps" :key="index" 
           v-show="currentSlide === index"
           class="slide">
        <img
          :src="step.image"
          :alt="step.title"
          class="slide-image"
        />
        <h3 class="slide-title">{{ step.title }}</h3>
        <p class="slide-description">{{ step.description }}</p>
      </div>
      
      <div class="navigation-controls">
        <a-button @click="prevSlide" :disabled="currentSlide === 0">
          <i class="fa-solid fa-chevron-left"></i> Trước
        </a-button>
        <a-button @click="nextSlide" :disabled="currentSlide === steps.length - 1">
          Tiếp <i class="fa-solid fa-chevron-right"></i>
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  steps: Array
});

const emit = defineEmits(['update:modelValue', 'close']);

const currentSlide = ref(0);

const visibleSteps = computed(() => {
  if (!props.steps || props.steps.length === 0) {
    console.warn('No steps provided to HelpGuideModal');
    return [];
  }
  return props.modelValue ? props.steps : [];
});

const nextSlide = () => {
  if (currentSlide.value < props.steps.length - 1) {
    currentSlide.value++;
  }
};

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--;
  }
};

const handleCancel = () => {
  emit('update:modelValue', false);
  emit('close');
};
</script>

<style scoped>
.help-modal-content {
  padding: 20px;
  min-height: 500px; /* Fixed height */
  position: relative;
}

.slide {
  position: absolute;
  width: calc(100% - 40px);
  transition: opacity 0.3s ease;
}

.slide-image {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  display: block;
  margin: 0 auto 20px;
}

.navigation-controls {
  position: absolute;
  bottom: -10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 20px;
}

:deep(.ant-btn-default:disabled) {
  background-color: #c9c9c9 !important;
  color: #000 !important;
}
</style>